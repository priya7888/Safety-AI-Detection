from typing import Dict, Any, Optional
from .preprocessing import preprocess_text
from .context_analyzer import get_category_context
from .information_extraction import extract_safety_information
from .hazard_detection import detect_hazard
from .safety_signal_detection import detect_safety_signals
from .energy_exposure_analysis import analyze_energy_and_exposure
from .barrier_analysis import analyze_barriers
from .sif_assessment import assess_sif_precursor
from .explanation_generator import generate_explanation

def analyze_safety_report(
    report_type: str,
    description: str,
    additional_context: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes the modular 10-step AI/NLP Safety Intelligence Pipeline:
    1. Preprocess text (preserving negations)
    2. Category Context Loading
    3. Structured Information Extraction
    4. Hazard Detection
    5. Safety Signal Detection
    6. Energy & Exposure Analysis
    7. Barrier / Control Analysis
    8. Category-Aware Reasoning
    9. SIF Precursor Assessment (YES, NO, INSUFFICIENT_INFORMATION)
    10. Explainable Result Generation
    """
    # Combine description and additional context for complete textual context
    full_text = description
    if additional_context and additional_context.strip():
        full_text += f". Additional Context: {additional_context.strip()}"
    
    # 1. Text Preprocessing
    cleaned_text = preprocess_text(full_text)

    # 2. Category Context
    cat_context = get_category_context(report_type)

    # 3. Information Extraction
    extracted_info = extract_safety_information(cleaned_text, report_type)

    # 4. Hazard Identification
    identified_hazard = detect_hazard(cleaned_text)

    # 5. Safety Signal Detection
    safety_signals = detect_safety_signals(cleaned_text)

    # 6. Energy & Exposure Analysis
    energy_exposure = analyze_energy_and_exposure(cleaned_text)

    # 7. Barrier / Control Analysis
    barrier_eval = analyze_barriers(cleaned_text)

    # 8 & 9. SIF Precursor Assessment & Consequence determination
    sif_result = assess_sif_precursor(
        report_type=report_type,
        text=cleaned_text,
        hazard=identified_hazard,
        energy_source=energy_exposure.get("energy_source"),
        exposure=energy_exposure.get("exposure"),
        barrier_status=barrier_eval.get("status", "BARRIER_UNKNOWN"),
        signals=safety_signals
    )

    # 10. Explainable Result Generation
    explanation = generate_explanation(
        sif_assessment=sif_result["assessment"],
        hazard=identified_hazard,
        signals=safety_signals,
        energy_source=energy_exposure.get("energy_source"),
        exposure=energy_exposure.get("exposure"),
        barrier_desc=barrier_eval.get("description", "Not identified"),
        potential_consequence=sif_result.get("potential_consequence"),
        report_type=report_type
    )

    # Structured Output (fields allow None when not identified)
    return {
        "analysis_context": cat_context["description"],
        "identified_action": extracted_info.get("action"),
        "identified_condition": extracted_info.get("condition"),
        "identified_event": extracted_info.get("event"),
        "identified_hazard": identified_hazard,
        "safety_signals": safety_signals,
        "energy_source": energy_exposure.get("energy_source"),
        "exposure": energy_exposure.get("exposure"),
        "barrier_information": barrier_eval.get("status"),
        "potential_consequence": sif_result.get("potential_consequence"),
        "sif_precursor_assessment": sif_result["assessment"],
        "explanation": explanation
    }
