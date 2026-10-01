from typing import Dict, List, Optional, Any

def assess_sif_precursor(
    report_type: str,
    text: str,
    hazard: Optional[str],
    energy_source: Optional[str],
    exposure: Optional[str],
    barrier_status: str,
    signals: List[str]
) -> Dict[str, Any]:
    """
    Evaluates whether the available report information indicates a potential SIF precursor.
    Does NOT predict accidents. Evaluates presence of high energy + exposure + barrier deficiency.
    """
    cleaned_len = len(text.strip().split())
    
    # 1. Honest Check for Insufficient Information
    if cleaned_len < 4 or (hazard is None and not signals and exposure is None):
        return {
            "assessment": "INSUFFICIENT_INFORMATION",
            "potential_consequence": "Insufficient information available to evaluate potential consequence severity.",
            "reason": "The report description lacks sufficient operational details regarding hazards, exposure, or controls for a reliable SIF precursor assessment."
        }

    # 2. Evaluate High-Consequence Hazards
    is_high_energy_hazard = hazard and any(key in hazard.lower() for key in [
        "suspended load", "dropped object", "fall", "height", "arc flash", 
        "electrical", "confined space", "hazardous energy", "stored pressure", 
        "mobile equipment", "vehicle", "rotating machinery", "entanglement", "fire", "thermal", "chemical"
    ])

    has_active_exposure = exposure is not None or len(signals) > 0
    has_barrier_gap = barrier_status in ["BARRIER_MISSING", "BARRIER_FAILED", "BARRIER_UNKNOWN"]

    # 3. Determine Potential Consequence
    potential_consequence = None
    if hazard:
        if "Suspended Load" in hazard or "Dropped Object" in hazard:
            potential_consequence = "Potential blunt force trauma, crush injury, or fatality from falling heavy mass."
        elif "Work at Height" in hazard or "Fall" in hazard:
            potential_consequence = "Potential severe deceleration injury, spinal trauma, or fatality due to fall from height."
        elif "Electrical" in hazard or "Arc Flash" in hazard:
            potential_consequence = "Potential high-voltage electrical shock, severe arc flash thermal burns, or electrocution."
        elif "Confined Space" in hazard or "Toxic Gas" in hazard:
            potential_consequence = "Potential asphyxiation, toxic inhalation incapacitation, or atmospheric explosion."
        elif "Hazardous Energy" in hazard or "Stored Pressure" in hazard:
            potential_consequence = "Potential high-pressure fluid injection, line blowout impact, or mechanical strike."
        elif "Mobile Equipment" in hazard or "Vehicle" in hazard:
            potential_consequence = "Potential runover, crush entrapment, or severe struck-by impact by heavy industrial vehicle."
        elif "Rotating Machinery" in hazard or "Entanglement" in hazard:
            potential_consequence = "Potential limb entanglement, traumatic amputation, or severe mechanical entrapment."
        elif "Fire" in hazard or "Thermal" in hazard:
            potential_consequence = "Potential severe thermal burns, smoke inhalation, or rapid structural fire escalation."
        elif "Chemical" in hazard:
            potential_consequence = "Potential acute chemical burns, corrosive systemic exposure, or hazardous plume inhalation."
        else:
            potential_consequence = "Potential minor to moderate localized impact or low-severity first-aid injury."
    else:
        potential_consequence = "Not identified from the available report information."

    # 4. SIF Precursor Decision Logic
    # YES: High-energy hazard + personnel exposure/safety signals + compromised or missing barrier
    if is_high_energy_hazard and (has_active_exposure or barrier_status in ["BARRIER_MISSING", "BARRIER_FAILED"]):
        return {
            "assessment": "YES",
            "potential_consequence": potential_consequence,
            "reason": "Report indicates a combination of significant hazardous energy, personnel exposure, and absent or compromised barriers."
        }
    
    # If it's a minor housekeeping or low-energy event with no severe exposure
    if hazard and "Slip, Trip, or Surface Housekeeping" in hazard and not signals:
        return {
            "assessment": "NO",
            "potential_consequence": potential_consequence or "Low-severity slip or minor contusion.",
            "reason": "Available report information indicates a low-energy condition without high-consequence energy sources or severe exposure."
        }

    # If signals are present or high hazard present without confirmed exposure:
    if is_high_energy_hazard and not has_active_exposure and barrier_status == "BARRIER_PRESENT":
        return {
            "assessment": "NO",
            "potential_consequence": potential_consequence,
            "reason": "While a hazardous energy source was present, active safety barriers successfully mitigated worker exposure."
        }

    if is_high_energy_hazard:
        return {
            "assessment": "YES",
            "potential_consequence": potential_consequence,
            "reason": "Identified high-energy hazard with potential unmitigated exposure pathways based on available information."
        }

    return {
        "assessment": "NO",
        "potential_consequence": potential_consequence or "Not identified from the available report information.",
        "reason": "Available information does not indicate high-energy exposure or potential serious consequence precursors."
    }
