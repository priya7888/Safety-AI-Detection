from typing import Dict, Any, Optional
from .barrier_analysis import analyze_barriers

def detect_barriers(text: str) -> Dict[str, Any]:
    """
    Analyzes barrier state, defense type, and failure mechanism from free text.
    """
    res = analyze_barriers(text)
    status = res.get("status", "BARRIER_UNKNOWN")
    description = res.get("description", "No specific barrier referenced")
    
    # Categorize barrier type according to industrial safety defense models
    lower = text.lower()
    barrier_type = "Administrative / Procedure"
    if any(k in lower for k in ["interlock", "guard", "scaffold railing", "toe-board", "bollard", "containment", "esd", "relief valve", "fire damper"]):
        barrier_type = "Engineering Control (Physical Barrier)"
    elif any(k in lower for k in ["harness", "lanyard", "lifeline", "goggles", "shield", "suit", "respirator"]):
        barrier_type = "Personal Protective Equipment (PPE)"
    elif any(k in lower for k in ["permit", "ptw", "tag", "lock", "procedure", "checklist", "briefing"]):
        barrier_type = "Administrative & Procedural Control"

    # Identify failure mode
    failure_mode = "Intact / Functional"
    if status == "BARRIER_FAILED":
        failure_mode = "Physical Breakdown, Fatigue, or Equipment Malfunction"
    elif status == "BARRIER_MISSING":
        failure_mode = "Omission, Intentional Bypass, or Non-Provision"
    elif status == "BARRIER_UNKNOWN":
        failure_mode = "Unspecified in observation report"

    return {
        "status": status,
        "barrier_description": description,
        "barrier_type": barrier_type,
        "failure_mode": failure_mode,
        "is_compromised": status in ["BARRIER_FAILED", "BARRIER_MISSING"]
    }
