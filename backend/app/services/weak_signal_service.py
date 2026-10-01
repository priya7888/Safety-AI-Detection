from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from ..models.weak_signal import WeakSignal, WeakSignalReview
from ..ai_services.signal_correlation import (
    evaluate_report_pair_or_group
)

def evaluate_custom_reports_correlation(reports: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Directly evaluates whether a set of reports interact to form a compound weak signal / precursor."""
    return evaluate_report_pair_or_group(reports)

def get_weak_signals_for_organization(db: Session, org_id: str) -> Dict[str, Any]:
    """
    Synthesizes weak signals for the given organization by querying actual
    WeakSignal database entities and completed safety reports. Zero static/hardcoded signals.
    """
    # 1. Fetch real WeakSignal entities from DB
    db_signals = db.query(WeakSignal).filter(WeakSignal.organization_id == org_id).all()

    correlated = []
    seen_titles = set()

    for ws in db_signals:
        source_reps = []
        if ws.safety_reports:
            for rep in ws.safety_reports:
                source_reps.append({
                    "report_id": rep.report_reference,
                    "report_type": rep.report_type,
                    "date_submitted": rep.report_date,
                    "short_description": rep.description,
                    "unit": rep.location,
                    "excerpt": rep.description
                })

        structured_sig = {
            "id": ws.id,
            "signal_id": ws.signal_id,
            "title": ws.title,
            "category": ws.category,
            "cluster_detected": True,
            "relationship": f"Recurring {ws.category} ({ws.location or ws.unit})",
            "potential_consequence": ws.escalation_path,
            "combined_risk": ws.risk_level.upper(),
            "correlation_score": ws.risk_score,
            "risk_score": ws.risk_score,
            "risk_level": ws.risk_level,
            "reason": ws.detection_reason,
            "recommended_action": ws.recommended_action,
            "first_detected_date": ws.first_detected_at.strftime("%Y-%m-%d") if ws.first_detected_at else str(date.today()),
            "source": "Automated Multi-Record Surveillance",
            "potential_sif_precursor": ws.escalation_path,
            "why_identified": ws.detection_reason,
            "energy_source": ws.energy_vector,
            "barrier_status": ws.barrier_issue,
            "review_status": ws.status,
            "reviewer_notes": ws.reviewer_notes or "Under review by Operational Safety Team.",
            "recurrence_count": ws.recurrence_count,
            "source_reports": source_reps,
            "signals": [
                {
                    "signal_num": idx + 1,
                    "report_id": r["report_id"],
                    "description": r["short_description"],
                    "individual_risk": "MEDIUM",
                    "location": r["unit"],
                    "date": r["date_submitted"]
                }
                for idx, r in enumerate(source_reps)
            ],
            "progression_steps": [
                {"step": "First Anomaly", "trend": "Increasing", "status": f"Initial observation logged in {ws.location or ws.unit}"},
                {"step": "Recurrent Detection", "trend": "Increasing", "status": f"{ws.recurrence_count} recurring reports identified without permanent elimination"},
                {"step": "Precursor Escalation", "trend": "Stable", "status": ws.escalation_path}
            ]
        }
        correlated.append(structured_sig)
        seen_titles.add(ws.title.lower())

    # Weak signals are created only by the historical detector during report
    # analysis. Do not synthesize new signals while reading the dashboard:
    # correlation is evidence for review, not proof of a weak signal.

    # 4. Attach any persisted reviews from weak_signal_reviews table
    reviews = db.query(WeakSignalReview).filter(WeakSignalReview.organization_id == org_id).all()
    review_map = {rev.signal_id: rev for rev in reviews}

    for sig in correlated:
        sid = sig.get("signal_id")
        if sid and sid in review_map:
            sig["review_status"] = review_map[sid].status
            if review_map[sid].reviewer_notes:
                sig["reviewer_notes"] = review_map[sid].reviewer_notes

    # 5. Compute summary KPIs
    total_active = len(correlated)
    high_risk = sum(1 for s in correlated if s.get("risk_level") == "High" or (s.get("risk_score") or 0) >= 90)
    med_risk = sum(1 for s in correlated if s.get("risk_level") == "Medium" and (s.get("risk_score") or 0) < 90)
    low_risk = sum(1 for s in correlated if s.get("risk_level") == "Low")
    escalating = sum(1 for s in correlated if (s.get("risk_score") or 0) >= 80)
    avg_conf = round(sum(s.get("risk_score", 0) for s in correlated) / total_active, 1) if total_active > 0 else 0.0

    summary = {
        "total_active_signals": total_active,
        "high_risk_precursors": high_risk,
        "escalating_patterns": escalating,
        "average_confidence": avg_conf,
        "high_risk_count": high_risk,
        "medium_risk_count": med_risk,
        "low_risk_count": low_risk,
        "total_clusters": 0
    }

    # 6. Extract and format structured Emerging Risk Clusters
    emerging_clusters = []
    for idx, sig in enumerate(correlated, start=1):
        if not sig.get("cluster_detected", True):
            continue

        raw_signals = sig.get("signals") or []
        source_reps = sig.get("source_reports") or []
        
        signals_list = []
        if raw_signals:
            for s_idx, s in enumerate(raw_signals, start=1):
                signals_list.append({
                    "signal_num": s_idx,
                    "report_id": s.get("report_id", f"SIG-{s_idx:02d}"),
                    "description": s.get("description", ""),
                    "individual_risk": s.get("risk_level", "MEDIUM").upper(),
                    "location": s.get("location") or (sig.get("title", "").split()[0] if sig.get("title") else "Operating Area"),
                    "date": s.get("date", str(date.today())),
                    "detected_roles": s.get("detected_roles", [])
                })
        elif source_reps:
            for s_idx, rep in enumerate(source_reps, start=1):
                rtype = rep.get("report_type", "")
                r_risk = "MEDIUM" if ("near miss" in rtype.lower() or "unsafe" in rtype.lower()) else "LOW"
                # If high-risk phrasing present in excerpt, reflect realistic individual risk
                desc = (rep.get("short_description") or rep.get("excerpt") or "").lower()
                if "fire" in desc or "leak" in desc or "spark" in desc or "voltage" in desc or "fall" in desc:
                    r_risk = "MEDIUM/HIGH"
                signals_list.append({
                    "signal_num": s_idx,
                    "report_id": rep.get("report_id", f"REP-{s_idx:02d}"),
                    "description": rep.get("short_description") or rep.get("excerpt") or "",
                    "individual_risk": r_risk,
                    "location": rep.get("unit") or "Plant Operating Zone",
                    "date": rep.get("date_submitted", str(date.today())),
                    "detected_roles": []
                })

        # Calculate time relationship
        dates = [s.get("date") for s in signals_list if s.get("date")]
        time_rel = "Active operational window (within 48 hours)"
        if len(dates) >= 2:
            try:
                d1 = datetime.strptime(str(dates[0])[:10], "%Y-%m-%d").date()
                d2 = datetime.strptime(str(dates[1])[:10], "%Y-%m-%d").date()
                diff_days = abs((d1 - d2).days)
                if diff_days == 0:
                    time_rel = "Concurrent (Same shift / day occurrence)"
                elif diff_days == 1:
                    time_rel = "Within 24 hours of each other"
                else:
                    time_rel = f"Occurred within {diff_days} days of each other"
            except Exception:
                pass

        cluster_loc = "Plant Area"
        if signals_list and signals_list[0].get("location"):
            cluster_loc = signals_list[0]["location"]
        elif source_reps and source_reps[0].get("unit"):
            cluster_loc = source_reps[0]["unit"]

        rel = sig.get("relationship") or sig.get("title") or "Cross-Hazard Interaction"
        consequence = sig.get("potential_consequence") or sig.get("potential_sif_precursor") or "Catastrophic Incident"
        combined_risk = sig.get("combined_risk") or (sig.get("risk_level", "HIGH").upper())
        score = sig.get("correlation_score") or sig.get("risk_score") or 90
        reason = sig.get("reason") or sig.get("why_identified") or "Multiple co-located hazards interact to create an escalated consequence pathway."
        action = sig.get("recommended_action") or sig.get("key_learnings") or "Immediately inspect/isolate the affected area and enforce primary controls."
        progression = sig.get("progression_steps") or []

        risk_levels_summary = ", ".join([f"Signal {s['signal_num']}: {s['individual_risk']}" for s in signals_list])

        emerging_clusters.append({
            "id": idx,
            "cluster_id": f"CL-{idx:02d}",
            "cluster_title": f"EMERGING {combined_risk}-RISK CLUSTER: {rel}",
            "title": rel,
            "relationship": rel,
            "signals": signals_list,
            "individual_risk_levels": risk_levels_summary,
            "location": cluster_loc,
            "time_relationship": time_rel,
            "correlation_score": score,
            "potential_consequence": consequence,
            "combined_risk": combined_risk,
            "reason": reason,
            "recommended_action": action,
            "progression_steps": progression,
            "source_signal_id": sig.get("signal_id", f"WS-{idx:02d}"),
            "review_status": sig.get("review_status", "Under Review"),
            "reviewer_notes": sig.get("reviewer_notes", "")
        })

    summary["total_clusters"] = len(emerging_clusters)

    return {
        "summary": summary,
        "weak_signals": correlated,
        "emerging_clusters": emerging_clusters
    }

def get_weak_signal_by_id(db: Session, org_id: str, signal_id: str) -> Optional[Dict[str, Any]]:
    """Returns detailed forensic dossier for a specific weak signal or cluster."""
    result = get_weak_signals_for_organization(db, org_id)
    signals = result.get("weak_signals", [])
    clusters = result.get("emerging_clusters", [])
    
    clean_target = signal_id.strip().lower()

    # 1. Check clusters
    for c in clusters:
        if c.get("cluster_id", "").lower() == clean_target:
            return c
        if clean_target in c.get("title", "").lower() or clean_target in c.get("relationship", "").lower():
            return c

    # 2. Check weak signals
    for s in signals:
        if s.get("signal_id", "").lower() == clean_target:
            return s
        if str(s.get("id", "")).lower() == clean_target:
            return s
        if clean_target in s.get("title", "").lower():
            return s

    return signals[0] if signals else (clusters[0] if clusters else None)

def update_weak_signal_review(
    db: Session,
    org_id: str,
    signal_id: str,
    status: str,
    notes: Optional[str] = None,
    decision: Optional[str] = None,
    reviewer: Optional[str] = None
) -> Dict[str, Any]:
    """Persists auditor review status, human classification decision, and notes in the database with strict completion locking."""
    review = db.query(WeakSignalReview).filter(
        WeakSignalReview.organization_id == org_id,
        WeakSignalReview.signal_id == signal_id
    ).first()

    # Strict lock: completed records cannot be reverted
    if review and review.status in ["Completed", "Complete"] and status not in ["Completed", "Complete"]:
        raise ValueError("Finalized Record Locked: Records marked as Completed cannot be reverted.")

    clean_status = "Completed" if status in ["Completed", "Complete"] else status

    if not review:
        review = WeakSignalReview(
            organization_id=org_id,
            signal_id=signal_id,
            status=clean_status,
            decision=decision,
            reviewer=reviewer,
            reviewer_notes=notes or ""
        )
        db.add(review)
    else:
        review.status = clean_status
        if decision is not None:
            review.decision = decision
        if reviewer is not None:
            review.reviewer = reviewer
        if notes is not None:
            review.reviewer_notes = notes
        review.reviewed_at = datetime.utcnow()

    # Also update WeakSignal table if matching signal_id exists
    ws_entity = db.query(WeakSignal).filter(
        WeakSignal.organization_id == org_id,
        WeakSignal.signal_id == signal_id
    ).first()
    if ws_entity:
        ws_entity.status = clean_status
        if notes is not None:
            ws_entity.reviewer_notes = notes

    db.commit()
    db.refresh(review)

    # Return refreshed signal
    signal = get_weak_signal_by_id(db, org_id, signal_id)
    return {
        "status": "success",
        "signal_id": signal_id,
        "review_status": review.status,
        "reviewer_notes": review.reviewer_notes,
        "weak_signal": signal
    }
