from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models.user import User
from ..models.safety_report import SafetyReport
from ..models.ai_analysis import AIAnalysis
from ..models.feedback import Feedback
from ..models.weak_signal import WeakSignal
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard Intelligence"])

@router.get("")
def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Dynamically computes dashboard metrics and distributions strictly for the
    authenticated organization. No hardcoded or fake data.
    """
    org_id = current_user.organization_id

    # 1. Total Safety Reports
    total_reports = db.query(SafetyReport).filter(SafetyReport.organization_id == org_id).count()

    # 2. Completed Analysis Count
    completed_analysis = db.query(SafetyReport).filter(
        SafetyReport.organization_id == org_id,
        SafetyReport.analysis_status == "COMPLETED"
    ).count()

    # 3. Potential SIF Findings Count
    potential_sif_findings = db.query(func.count(func.distinct(SafetyReport.id))).join(AIAnalysis).filter(
        SafetyReport.organization_id == org_id,
        AIAnalysis.sif_precursor_assessment == "YES"
    ).scalar() or 0

    sif_precursors_awaiting_review = db.query(SafetyReport).join(AIAnalysis).outerjoin(
        Feedback, Feedback.report_id == SafetyReport.id
    ).filter(
        SafetyReport.organization_id == org_id,
        AIAnalysis.sif_precursor_assessment == "YES",
        Feedback.id == None
    ).with_entities(func.count(func.distinct(SafetyReport.id))).scalar() or 0

    sif_precursors_completed = db.query(SafetyReport).join(AIAnalysis).join(
        Feedback, Feedback.report_id == SafetyReport.id
    ).filter(
        SafetyReport.organization_id == org_id,
        AIAnalysis.sif_precursor_assessment == "YES",
        Feedback.review_status == "COMPLETED"
    ).with_entities(func.count(func.distinct(SafetyReport.id))).scalar() or 0

    # 4. Awaiting Review Count: Completed analyses without feedback
    feedback_report_ids = db.query(Feedback.report_id).filter(
        Feedback.organization_id == org_id
    ).subquery()

    awaiting_review = db.query(SafetyReport).filter(
        SafetyReport.organization_id == org_id,
        SafetyReport.analysis_status == "COMPLETED",
        ~SafetyReport.id.in_(feedback_report_ids)
    ).count()

    # 4b. Dynamic Weak Signals Count
    weak_signals_count = db.query(WeakSignal).filter(
        WeakSignal.organization_id == org_id
    ).count()

    # 5. Report Distribution by report_type
    distribution_query = db.query(
        SafetyReport.report_type,
        func.count(SafetyReport.id).label("count")
    ).filter(
        SafetyReport.organization_id == org_id
    ).group_by(SafetyReport.report_type).all()

    type_labels = {
        "UNSAFE_ACT": "Unsafe Act",
        "UNSAFE_CONDITION": "Unsafe Condition",
        "NEAR_MISS": "Near-Miss"
    }

    report_distribution = [
        {
            "type": row[0],
            "label": type_labels.get(row[0], row[0]),
            "count": row[1]
        }
        for row in distribution_query
    ]

    # 6. Reporting Trend over time (grouped by report_date)
    trend_query = db.query(
        SafetyReport.report_date,
        func.count(SafetyReport.id).label("count")
    ).filter(
        SafetyReport.organization_id == org_id
    ).group_by(SafetyReport.report_date).order_by(SafetyReport.report_date.asc()).all()

    reporting_trend = [
        {"date": row[0], "count": row[1]}
        for row in trend_query
    ]

    # 7. SIF Assessment Distribution
    sif_dist_query = db.query(
        AIAnalysis.sif_precursor_assessment,
        func.count(AIAnalysis.id).label("count")
    ).filter(
        AIAnalysis.organization_id == org_id
    ).group_by(AIAnalysis.sif_precursor_assessment).all()

    sif_labels = {
        "YES": "Potential SIF Precursor",
        "NO": "Non-SIF Observation",
        "INSUFFICIENT_INFORMATION": "Insufficient Information"
    }

    sif_dict = {row[0]: row[1] for row in sif_dist_query}
    sif_assessment_distribution = [
        {"assessment": "YES", "label": "YES", "count": sif_dict.get("YES", 0)},
        {"assessment": "NO", "label": "NO", "count": sif_dict.get("NO", 0)},
        {"assessment": "INSUFFICIENT_INFORMATION", "label": "INSUFFICIENT INFORMATION", "count": sif_dict.get("INSUFFICIENT_INFORMATION", 0)}
    ]

    # 8. Common Hazards Identified
    hazards_query = db.query(
        AIAnalysis.identified_hazard,
        func.count(AIAnalysis.id).label("count")
    ).filter(
        AIAnalysis.organization_id == org_id,
        AIAnalysis.identified_hazard != None
    ).group_by(AIAnalysis.identified_hazard).order_by(func.count(AIAnalysis.id).desc()).limit(8).all()

    common_hazards = [
        {"hazard": row[0], "count": row[1]}
        for row in hazards_query if row[0]
    ]

    # 9. Safety Reports by Location
    location_query = db.query(
        SafetyReport.location,
        func.count(SafetyReport.id).label("count")
    ).filter(
        SafetyReport.organization_id == org_id,
        SafetyReport.location != None
    ).group_by(SafetyReport.location).order_by(func.count(SafetyReport.id).desc()).limit(8).all()

    reports_by_location = [
        {"location": row[0], "count": row[1]}
        for row in location_query if row[0]
    ]

    # 10. Recent Safety Reports (latest 6)
    recent_query = db.query(SafetyReport).filter(
        SafetyReport.organization_id == org_id
    ).order_by(SafetyReport.created_at.desc()).limit(6).all()

    recent_reports = [
        {
            "id": r.id,
            "report_reference": r.report_reference,
            "report_type": type_labels.get(r.report_type, r.report_type),
            "raw_type": r.report_type,
            "description": r.description,
            "location": r.location,
            "report_date": r.report_date,
            "analysis_status": r.analysis_status,
            "sif_precursor_assessment": r.ai_analysis.sif_precursor_assessment if r.ai_analysis else None
        }
        for r in recent_query
    ]

    # 11. Potential SIF Precursor Findings List (sif_precursor_assessment = YES)
    sif_findings_query = db.query(SafetyReport).join(AIAnalysis).filter(
        SafetyReport.organization_id == org_id,
        AIAnalysis.sif_precursor_assessment == "YES"
    ).order_by(SafetyReport.created_at.desc()).limit(6).all()

    potential_sif_findings_list = []
    for r in sif_findings_query:
        analysis = r.ai_analysis
        signals = analysis.safety_signals if analysis and analysis.safety_signals else []
        signal_text = ", ".join(signals[:3]) if isinstance(signals, list) and signals else (analysis.energy_source or "High Energy / Barrier Failure")
        
        potential_sif_findings_list.append({
            "id": r.id,
            "report_reference": r.report_reference,
            "report_type": type_labels.get(r.report_type, r.report_type),
            "raw_type": r.report_type,
            "identified_hazard": analysis.identified_hazard if analysis else "Unidentified",
            "location": r.location,
            "key_safety_signal": signal_text,
            "brief_explanation": analysis.explanation if analysis else "Potential SIF precursor identified by AI safety engine.",
            "report_date": r.report_date
        })

    # 12. Reports Awaiting Review (Analysis = COMPLETED and Feedback does not exist)
    awaiting_query = db.query(SafetyReport).filter(
        SafetyReport.organization_id == org_id,
        SafetyReport.analysis_status == "COMPLETED",
        ~SafetyReport.id.in_(feedback_report_ids)
    ).order_by(SafetyReport.created_at.desc()).limit(6).all()

    reports_awaiting_review = [
        {
            "id": r.id,
            "report_reference": r.report_reference,
            "report_type": type_labels.get(r.report_type, r.report_type),
            "raw_type": r.report_type,
            "identified_hazard": r.ai_analysis.identified_hazard if r.ai_analysis else "Not evaluated",
            "sif_assessment": r.ai_analysis.sif_precursor_assessment if r.ai_analysis else "PENDING",
            "analysis_date": r.report_date
        }
        for r in awaiting_query
    ]

    return {
        "organization_id": org_id,
        "organization_name": current_user.organization.name if current_user.organization else "Organization",
        "total_reports": total_reports,
        "completed_analysis": completed_analysis,
        "potential_sif_findings": potential_sif_findings,
        "total_sif_precursors": potential_sif_findings,
        "sif_precursors_awaiting_review": sif_precursors_awaiting_review,
        "sif_precursors_completed": sif_precursors_completed,
        "awaiting_review": awaiting_review,
        "weak_signals_count": weak_signals_count,
        "report_distribution": report_distribution,
        "reporting_trend": reporting_trend,
        "sif_assessment_distribution": sif_assessment_distribution,
        "common_hazards": common_hazards,
        "reports_by_location": reports_by_location,
        "recent_reports": recent_reports,
        "potential_sif_findings_list": potential_sif_findings_list,
        "reports_awaiting_review": reports_awaiting_review
    }

@router.post("/reset-baseline")
def reset_baseline_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Administrator endpoint to completely wipe and reset all operational data:
    - Feedbacks
    - AI Analyses
    - Weak Signals
    - Safety Reports
    Returning system to a clean zero-baseline cold start for both admin and users.
    """
    org_id = current_user.organization_id
    db.query(Feedback).filter(Feedback.organization_id == org_id).delete(synchronize_session=False)
    db.query(AIAnalysis).filter(AIAnalysis.organization_id == org_id).delete(synchronize_session=False)
    db.query(WeakSignal).filter(WeakSignal.organization_id == org_id).delete(synchronize_session=False)
    db.query(SafetyReport).filter(SafetyReport.organization_id == org_id).delete(synchronize_session=False)
    db.commit()

    return {
        "status": "success",
        "message": "All operational records and baseline data wiped successfully.",
        "organization_id": org_id,
        "total_reports": 0,
        "completed_analysis": 0,
        "potential_sif_findings": 0,
        "awaiting_review": 0,
        "weak_signals_count": 0
    }

