from typing import List, Dict, Any
from collections import defaultdict
from sqlalchemy.orm import Session
from ..models.safety_report import SafetyReport
from ..models.ai_analysis import AIAnalysis
from ..schemas.sif_intelligence import SIFIntelligenceSummary, SIFFindingResponse, SIFPatternsResponse
from ..ai_services.pattern_analysis import analyze_operational_patterns
from ..ai_services.insight_generator import generate_safety_narrative

def generate_sif_intelligence(db: Session, org_id: str) -> SIFIntelligenceSummary:
    """
    Synthesizes meaningful multi-report SIF intelligence by identifying actual recurring
    patterns across analyzed reports strictly for the authenticated organization.
    Does NOT fabricate artificial trends or fake data.
    """
    # 1. Fetch completed reports with analyses
    reports = db.query(SafetyReport).join(AIAnalysis).filter(
        SafetyReport.organization_id == org_id,
        SafetyReport.analysis_status == "COMPLETED"
    ).all()

    total_count = len(reports)
    if total_count < 2:
        return SIFIntelligenceSummary(
            total_analyzed_reports=total_count,
            findings=[],
            status_message="Insufficient analyzed reports to identify a meaningful safety pattern across multiple observations. At least 2 analyzed reports are required for multi-report correlation."
        )

    # Group by Hazard
    hazard_groups: Dict[str, List[SafetyReport]] = defaultdict(list)
    location_groups: Dict[str, List[SafetyReport]] = defaultdict(list)

    for r in reports:
        if r.ai_analysis and r.ai_analysis.identified_hazard:
            hazard_groups[r.ai_analysis.identified_hazard].append(r)
        if r.location:
            location_groups[r.location.strip()].append(r)

    findings: List[SIFFindingResponse] = []
    finding_id_counter = 1

    # Evaluate recurring hazard clusters (2 or more reports sharing common hazard)
    for hazard_name, group in hazard_groups.items():
        if len(group) >= 2:
            rel_refs = [r.report_reference for r in group]
            locs = list(set(r.location for r in group))
            
            # Aggregate unique safety signals
            all_signals = []
            for r in group:
                if r.ai_analysis and r.ai_analysis.safety_signals:
                    all_signals.extend(r.ai_analysis.safety_signals)
            unique_signals = list(dict.fromkeys(all_signals))

            # Barrier issues synthesis
            barrier_states = [r.ai_analysis.barrier_information for r in group if r.ai_analysis]
            if "BARRIER_MISSING" in barrier_states or "BARRIER_FAILED" in barrier_states:
                barrier_summary = "Repeated barrier deficiency or failure observed across multiple operational events."
            else:
                barrier_summary = "Barrier controls were either present or not specified in the documented reports."

            explanation = (
                f"A recurring safety pattern was detected across {len(group)} reports ({', '.join(rel_refs)}) "
                f"involving {hazard_name}. Operational areas impacted: {', '.join(locs)}. "
                f"Multi-report correlation indicates repeated exposure conditions requiring unified barrier verification."
            )

            findings.append(SIFFindingResponse(
                id=finding_id_counter,
                organization_id=org_id,
                related_report_ids=rel_refs,
                common_hazard=hazard_name,
                common_safety_signals=unique_signals if unique_signals else ["Recurring hazardous energy exposure"],
                barrier_issues=barrier_summary,
                related_location=", ".join(locs),
                explanation=explanation,
                created_at=group[0].created_at
            ))
            finding_id_counter += 1

    if not findings:
        return SIFIntelligenceSummary(
            total_analyzed_reports=total_count,
            findings=[],
            status_message="No meaningful recurring hazard relationship identified among the currently analyzed reports. Individual reports do not currently share common high-consequence patterns."
        )

    return SIFIntelligenceSummary(
        total_analyzed_reports=total_count,
        findings=findings,
        status_message=f"Successfully synthesized {len(findings)} evidence-based SIF intelligence finding(s) from {total_count} analyzed reports."
    )

def get_sif_patterns_and_dashboard_data(db: Session, org_id: str) -> SIFPatternsResponse:
    """
    Computes real-time data for the 4 intelligence cards, the SIF Hotspot Matrix,
    emerging risks, and executive AI safety narrative.
    """
    reports = db.query(SafetyReport).join(AIAnalysis).filter(
        SafetyReport.organization_id == org_id,
        SafetyReport.analysis_status == "COMPLETED"
    ).all()

    report_dicts = []
    barrier_failure_counts = defaultdict(int)
    location_sif_counts = defaultdict(int)
    sif_count = 0
    high_priority_count = 0

    for r in reports:
        analysis = r.ai_analysis
        is_sif = analysis.sif_precursor_assessment == "YES" if analysis else False
        barrier_status = analysis.barrier_information if analysis else "BARRIER_UNKNOWN"
        hazard = analysis.identified_hazard if analysis else "General Hazard"

        if is_sif:
            sif_count += 1
            if r.location:
                location_sif_counts[r.location.strip()] += 1
            if barrier_status in ["BARRIER_FAILED", "BARRIER_MISSING"]:
                high_priority_count += 1

        if barrier_status in ["BARRIER_FAILED", "BARRIER_MISSING"]:
            # Categorize barrier failure label
            desc_lower = (r.description or "").lower()
            if "interlock" in desc_lower or "guard" in desc_lower:
                barrier_label = "Physical Guarding & Interlocks"
            elif "fall" in desc_lower or "height" in desc_lower or "scaffold" in desc_lower or "grating" in desc_lower:
                barrier_label = "Fall Protection & Scaffold Guardrails"
            elif "loto" in desc_lower or "lockout" in desc_lower or "isolation" in desc_lower:
                barrier_label = "Energy Isolation & LOTO Locks"
            elif "crane" in desc_lower or "sling" in desc_lower or "rigging" in desc_lower:
                barrier_label = "Mechanical Lifting Exclusion Barricades"
            else:
                barrier_label = "Operational Physical Barriers"
            barrier_failure_counts[barrier_label] += 1

        report_dicts.append({
            "id": r.id,
            "report_reference": r.report_reference,
            "report_type": r.report_type,
            "location": r.location,
            "description": r.description,
            "additional_context": r.additional_context,
            "sif_precursor_assessment": analysis.sif_precursor_assessment if analysis else "UNKNOWN",
            "identified_hazard": hazard,
            "barrier_information": barrier_status
        })

    total_reports = len(reports)
    sif_density = round((sif_count / total_reports) * 100, 1) if total_reports > 0 else 0.0

    # Most frequent barrier failure
    if barrier_failure_counts:
        most_frequent_barrier = max(barrier_failure_counts.items(), key=lambda x: x[1])[0]
    elif total_reports > 0:
        most_frequent_barrier = "No barrier failures recorded"
    else:
        most_frequent_barrier = "None recorded"

    # Highest risk area
    if location_sif_counts:
        highest_risk_area = max(location_sif_counts.items(), key=lambda x: x[1])[0]
    elif reports and reports[0].location:
        highest_risk_area = reports[0].location
    elif total_reports > 0:
        highest_risk_area = "General Operating Area"
    else:
        highest_risk_area = "None recorded"


    pattern_results = analyze_operational_patterns(report_dicts)
    narrative_results = generate_safety_narrative(
        total_reports=total_reports,
        sif_count=sif_count,
        high_priority_count=high_priority_count,
        top_barrier_failure=most_frequent_barrier,
        top_risk_area=highest_risk_area,
        precursor_density=sif_density
    )

    return SIFPatternsResponse(
        total_reports=total_reports,
        sif_density_pct=sif_density,
        high_priority_precursors=high_priority_count,
        most_frequent_barrier_failure=most_frequent_barrier,
        highest_risk_area=highest_risk_area,
        hotspot_matrix=pattern_results["matrix"],
        top_locations=pattern_results["top_locations"],
        emerging_risks=pattern_results["emerging_risks"],
        safety_narrative=narrative_results,
        status_message=f"Computed operational intelligence across {total_reports} safety reports."
    )
