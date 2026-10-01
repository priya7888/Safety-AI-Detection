from typing import Dict, Any, Optional

def classify_sif_precursor(
    report_type: str,
    hazard: Optional[str],
    barrier_status: Optional[str],
    energy_source: Optional[str],
    sif_assessment: str
) -> Dict[str, Any]:
    """
    Synthesizes multi-attribute safety intelligence classification:
    - Risk Priority Tier
    - Precursor Density Impact
    - Control Hierarchy Level
    """
    if sif_assessment == "YES":
        if barrier_status in ["BARRIER_MISSING", "BARRIER_FAILED"]:
            priority = "CRITICAL_PRECURSOR"
            priority_label = "Critical Priority"
            urgency = "Immediate Stop-Work / Operational Verification Required"
            confidence = 0.94
        else:
            priority = "ELEVATED_PRECURSOR"
            priority_label = "Elevated Priority"
            urgency = "Barriers Compromised - Targeted Inspection Needed"
            confidence = 0.88
    elif sif_assessment == "INSUFFICIENT_INFORMATION":
        priority = "DATA_INCOMPLETE"
        priority_label = "Data Clarification"
        urgency = "Report narrative lacks equipment, energy, or barrier details"
        confidence = 0.50
    else:
        priority = "ROUTINE_CONTROLLED"
        priority_label = "Routine Controlled"
        urgency = "Standard HSE Housekeeping / Administrative Follow-up"
        confidence = 0.92

    # Classify barrier control level
    barrier_hierarchy = "ENGINEERING"
    if barrier_status in ["BARRIER_FAILED", "BARRIER_MISSING"]:
        barrier_hierarchy = "CRITICAL_HARD_DEFENSE"
    elif barrier_status == "BARRIER_PRESENT":
        barrier_hierarchy = "ADMINISTRATIVE_OR_PPE"

    return {
        "priority_tier": priority,
        "priority_label": priority_label,
        "urgency": urgency,
        "confidence_score": confidence,
        "barrier_hierarchy_impact": barrier_hierarchy
    }
