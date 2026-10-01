from typing import List, Optional

def generate_explanation(
    sif_assessment: str,
    hazard: Optional[str],
    signals: List[str],
    energy_source: Optional[str],
    exposure: Optional[str],
    barrier_desc: str,
    potential_consequence: Optional[str],
    report_type: str
) -> str:
    """
    Constructs explainable, evidence-grounded safety intelligence commentary.
    Strictly avoids deterministic predictions and phrases like 'An accident will happen'.
    """
    if sif_assessment == "INSUFFICIENT_INFORMATION":
        return (
            "Insufficient information is available for a reliable SIF precursor assessment. "
            "The report text does not provide adequate detail regarding specific hazardous energy sources, "
            "personnel exposure points, or safety barrier controls."
        )

    if sif_assessment == "YES":
        parts = []
        parts.append("Potential SIF precursor identified based on the available safety report information.")
        
        if hazard:
            parts.append(f"Identified hazard involves {hazard}.")
        
        if exposure:
            parts.append(f"Operational context indicates that {exposure.lower()}.")
        elif signals:
            parts.append(f"Detected safety signal: {signals[0].lower()}.")
            
        if energy_source:
            parts.append(f"Primary energy vector identified as {energy_source}.")
            
        parts.append(f"Barrier analysis note: {barrier_desc}")
        
        if potential_consequence and "Not identified" not in potential_consequence:
            parts.append(f"Potential consequence severity: {potential_consequence}")
            
        return " ".join(parts)

    else: # NO
        parts = []
        parts.append(
            "Based on the available report information, this observation does not indicate a high-energy SIF precursor."
        )
        if hazard:
            parts.append(f"The documented situation relates to {hazard}.")
        parts.append(f"Barrier condition: {barrier_desc}")
        return " ".join(parts)
