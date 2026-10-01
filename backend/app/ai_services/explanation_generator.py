from typing import List, Optional

def generate_explanation(
    sif_assessment: str,
    hazard: Optional[str],
    signals: List[str],
    energy_source: Optional[str],
    exposure: Optional[str],
    barrier_desc: str,
    potential_consequence: Optional[str],
    report_type: str,
    safety_factors: Optional[List[str]] = None
) -> str:
    """
    Constructs explainable, evidence-grounded safety intelligence commentary.
    Strictly integrates the current observation, classification context, barrier status,
    and user-selected checklist safety factors. Avoids deterministic injury predictions.
    """
    clean_type = (report_type or "NEAR_MISS").upper().replace("-", "_").replace(" ", "_")
    type_desc = (
        "an Unsafe Act regarding worker action and operational discipline"
        if "ACT" in clean_type
        else "an Unsafe Condition regarding workplace physical environment and barrier integrity"
        if "CONDITION" in clean_type
        else "a Near Miss observation with potential incident escalation"
    )

    factors_clause = ""
    if safety_factors and len(safety_factors) > 0:
        factors_clause = f"Evaluated safety factors: {', '.join(safety_factors)}."

    if sif_assessment == "INSUFFICIENT_INFORMATION":
        parts = [
            "Insufficient information is available for a reliable SIF precursor assessment.",
            f"Observation evaluated as {type_desc}."
        ]
        if factors_clause:
            parts.append(factors_clause)
        parts.append(
            "The report text does not provide adequate detail regarding specific hazardous energy sources, "
            "personnel exposure points, or safety barrier controls."
        )
        return " ".join(parts)

    if sif_assessment == "YES":
        parts = [
            "Potential SIF precursor identified based on the available safety report information.",
            f"Observation evaluated as {type_desc}."
        ]
        
        if hazard:
            parts.append(f"Identified hazard involves {hazard}.")
        
        if exposure and exposure != "Possible":
            parts.append(f"Operational context indicates that {exposure.lower()}.")
        elif signals:
            parts.append(f"Detected safety signal: {signals[0].lower()}.")
            
        if energy_source and energy_source not in ["UNKNOWN", "Insufficient Information"]:
            parts.append(f"Primary energy vector identified as {energy_source}.")
            
        parts.append(f"Barrier analysis note: {barrier_desc}")
        
        if factors_clause:
            parts.append(factors_clause)

        if potential_consequence and "Not identified" not in potential_consequence and "Insufficient" not in potential_consequence:
            parts.append(f"Potential consequence severity: {potential_consequence}")
            
        return " ".join(parts)

    else: # NO
        parts = [
            "Based on the available report information, this observation does not indicate a high-energy SIF precursor.",
            f"Observation evaluated as {type_desc}."
        ]
        if hazard:
            parts.append(f"The documented situation relates to {hazard}.")
        parts.append(f"Barrier condition: {barrier_desc}")
        if factors_clause:
            parts.append(factors_clause)
        return " ".join(parts)
