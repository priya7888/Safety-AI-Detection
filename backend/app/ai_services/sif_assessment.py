"""
Hybrid SIF Decision Engine
==========================
Combines deterministic Rule-Based Safety Assessment with Supervised Machine Learning
Probabilities and Feature Evidence into an auditable, explainable safety decision.

Architecture:
Rule-Based SIF Assessment (High Energy + Exposure + Barrier Gap)
        +
ML Model Inference (TF-IDF + Logistic Regression calibrated probability)
        +
Feature Evidence (Active terms & log-odds weights)
        ↓
Hybrid Decision Engine

Output Schema (Kept Separately per Requirements):
- ai_classification: "SIF-potential" | "Non-SIF-potential" | "Insufficient Information"
- ai_sif_score: MAUT-grounded Multi-Hazard Risk Score (0 to 100)
- ai_confidence: Model certainty and evidence completeness (0 to 100%)
- rule_based_assessment: "YES" | "NO" | "INSUFFICIENT_INFORMATION"
- ml_probability: Float probability (0.0 to 1.0)
- final_ai_decision: "CONFIRMED SIF PRECURSOR" | "NON-SIF OBSERVATION" | "INSUFFICIENT INFORMATION"
- contributing_features: List of active terms and weights
"""

import logging
from typing import Dict, List, Optional, Any

logger = logging.getLogger("sif_assessment")

try:
    from .sif_ml_inference import predict_sif_potential
except (ImportError, ValueError):
    try:
        from sif_ml_inference import predict_sif_potential
    except ImportError:
        predict_sif_potential = None

try:
    from .hazard_detection import detect_all_hazards, HAZARD_SEVERITY_WEIGHTS
except (ImportError, ValueError):
    try:
        from hazard_detection import detect_all_hazards, HAZARD_SEVERITY_WEIGHTS
    except ImportError:
        detect_all_hazards = None
        HAZARD_SEVERITY_WEIGHTS = {}


def compute_maut_risk_score(
    hazard: Optional[str],
    energy_source: Optional[str],
    exposure: Optional[str],
    barrier_status: str,
    text: str,
    all_hazards: Optional[List[str]] = None,
    all_energy_sources: Optional[List[str]] = None
) -> int:
    """
    Computes Multi-Attribute Utility Theory (MAUT) Risk Score (0 - 100)
    using a maximum-severity + cumulative-risk approach across:
    1. Multi-Hazard Severity & Cumulative Factor Boost (0 - 35)
    2. Energy Vector Severity (0 - 28)
    3. Worker Exposure Pathway (0 - 22)
    4. Safety Barrier Condition (0 - 20)
    5. Compound SIF Precursor Synergy Escalation (0 - 15)
    """
    t_low = (text or "").lower()
    h_low = (hazard or "").lower()
    e_low = (energy_source or "").lower()
    ex_low = (exposure or "").lower()

    # Discover all hazards if not explicitly passed
    detected_hazards = list(all_hazards or [])
    if not detected_hazards and detect_all_hazards is not None:
        detected_hazards = detect_all_hazards(text)
    if not detected_hazards and hazard:
        detected_hazards = [hazard]

    # 1. Multi-Hazard Severity & Cumulative Factor Boost (0 - 35)
    has_critical_context = any(
        k in t_low for k in [
            "loto", "lockout", "pressure", "high-pressure", "high pressure",
            "confined space", "electrical", "voltage", "suspended load",
            "flammable", "gas leak", "h2s"
        ]
    )

    hazard_weights: List[int] = []
    for hz in detected_hazards:
        hz_l = hz.lower()
        if any(k in hz_l for k in ["loto", "lockout", "isolation", "confined space", "atmospheric"]):
            hazard_weights.append(30)
        elif any(k in hz_l for k in ["line-of-fire", "line of fire", "high-pressure", "pressure", "suspended load", "dropped object", "electrical", "arc flash", "gas leakage", "fire"]):
            hazard_weights.append(28)
        elif any(k in hz_l for k in ["fall", "height", "trench", "excavation"]):
            hazard_weights.append(26)
        elif any(k in hz_l for k in ["chemical", "mobile equipment", "pedestrian", "safeguard", "guard"]):
            hazard_weights.append(22)
        elif any(k in hz_l for k in ["ppe", "protective equipment", "head protection", "glasses", "goggles"]):
            hazard_weights.append(22 if has_critical_context else 14)
        elif any(k in hz_l for k in ["slip", "trip", "housekeeping", "lighting"]):
            hazard_weights.append(8)
        else:
            hazard_weights.append(12)

    if not hazard_weights:
        hazard_weights = [10]

    hazard_weights.sort(reverse=True)
    primary_hazard_sev = hazard_weights[0]

    # Cumulative Multi-Hazard Boost: each additional concurrent hazard adds cumulative risk
    cumulative_boost = 0
    for w in hazard_weights[1:]:
        if w >= 26:
            cumulative_boost += 6
        elif w >= 20:
            cumulative_boost += 4
        else:
            cumulative_boost += 2

    hazard_score = min(35, primary_hazard_sev + cumulative_boost)

    # 2. Energy Vector Severity (0 - 28)
    energy_score = 6
    detected_energies = list(all_energy_sources or [])
    if any(k in e_low or any(k in src.lower() for src in detected_energies) or k in t_low for k in ["pressure", "pneumatic", "hydraulic", "high_pressure", "high-pressure", "high pressure", "blowout"]):
        energy_score = 28
    elif any(k in e_low or any(k in src.lower() for src in detected_energies) or k in t_low for k in ["electrical", "high-voltage", "11kv", "415v", "arc flash"]):
        energy_score = 28
    elif any(k in e_low or any(k in src.lower() for src in detected_energies) or k in t_low for k in ["toxic", "atmospheric", "confined space", "h2s"]):
        energy_score = 26
    elif any(k in e_low or any(k in src.lower() for src in detected_energies) or k in t_low for k in ["gravity", "suspended load", "dropped object", "fall from height", "work at height"]):
        energy_score = 25
    elif any(k in e_low or any(k in src.lower() for src in detected_energies) or k in t_low for k in ["thermal", "fire", "flame", "heat"]):
        energy_score = 24
    elif any(k in e_low or any(k in src.lower() for src in detected_energies) or k in t_low for k in ["kinetic", "mobile equipment", "forklift", "vehicle", "rotating machinery"]):
        energy_score = 20
    elif any(k in e_low or any(k in src.lower() for src in detected_energies) for k in ["chemical"]):
        energy_score = 18
    elif "multiple" in e_low:
        energy_score = 26
    elif any(k in h_low for k in ["slip", "trip", "housekeeping"]):
        energy_score = 5

    # 3. Worker Exposure Severity (0 - 22)
    exposure_score = 6
    if any(k in ex_low or k in t_low for k in ["line-of-fire", "line of fire", "in the line of fire", "stood in the line of fire", "standing in line of fire", "standing under suspended load", "under suspended load", "under load"]):
        exposure_score = 22
    elif any(k in ex_low or k in t_low for k in ["confined space", "inside vessel", "tank entry"]):
        exposure_score = 20
    elif any(k in ex_low or k in t_low for k in ["touching live", "live panel", "direct physical proximity", "fall edge", "unprotected edge"]):
        exposure_score = 20
    elif any(k in ex_low for k in ["trajectory", "rotating machinery", "restricted area", "thermal"]):
        exposure_score = 16
    elif any(k in ex_low for k in ["not exposed", "not_exposed", "zero exposure"]):
        exposure_score = 2
    elif any(k in ex_low for k in ["slip", "walking", "door"]):
        exposure_score = 5
    else:
        exposure_score = 8

    # 4. Safety Barrier Condition (0 - 20)
    barrier_score = 4
    b_norm = (barrier_status or "").upper()
    if any(k in b_norm for k in ["FAILED", "RUPTURE"]):
        barrier_score = 20
    elif any(k in b_norm for k in ["BYPASSED", "OVERRIDDEN"]):
        barrier_score = 20
    elif any(k in b_norm for k in ["MISSING", "NOT DEPLOYED"]):
        if any(k in t_low for k in ["loto", "lockout", "isolation", "gas test", "gas testing", "guard"]):
            barrier_score = 18
        else:
            barrier_score = 10
    elif any(k in b_norm for k in ["COMPROMISED", "DEGRADED"]):
        barrier_score = 10
    elif any(k in b_norm for k in ["PRESENT", "INTACT", "FUNCTIONING"]):
        barrier_score = 2
    else:
        barrier_score = 5

    # 5. Compound Multi-Precursor SIF Synergy / Escalation (0 - 15)
    synergy_score = 0
    has_loto = any(k in t_low for k in ["loto", "lockout", "tagout", "energy isolation"])
    has_line_of_fire = any(k in t_low for k in ["line of fire", "line-of-fire", "in the line of fire", "stood in the line of fire", "under suspended load", "under load"])
    has_pressure = any(k in t_low for k in ["pressure", "high-pressure", "high pressure", "pressurized", "hydraulic"])
    has_confined = any(k in t_low for k in ["confined space", "tank entry", "vessel entry"])
    has_gas_test_issue = any(k in t_low for k in ["gas testing", "gas test", "atmospheric"])
    has_suspended = any(k in t_low for k in ["suspended load", "dropped object", "crane lift"])

    if has_loto and has_line_of_fire and has_pressure:
        synergy_score = 12
    elif has_confined and (has_loto or has_gas_test_issue):
        synergy_score = 12
    elif has_suspended and has_line_of_fire:
        synergy_score = 10
    elif has_loto and has_pressure:
        synergy_score = 8
    elif has_pressure and has_line_of_fire:
        synergy_score = 8
    elif has_loto and any(k in t_low for k in ["electrical", "voltage"]):
        synergy_score = 10

    raw_score = hazard_score + energy_score + exposure_score + barrier_score + synergy_score

    # Normalized score ranges:
    # 0–20 Low
    # 21–40 Moderate
    # 41–60 High
    # 61–80 Very High
    # 81–100 Critical
    if raw_score >= 100:
        scaled_score = min(95, 85 + int((raw_score - 100) * 0.6))
    elif raw_score >= 80:
        scaled_score = min(88, 75 + int((raw_score - 80) * 0.65))
    elif raw_score >= 60:
        scaled_score = min(74, 55 + int((raw_score - 60) * 0.95))
    elif raw_score >= 40:
        scaled_score = min(54, 38 + int((raw_score - 40) * 0.8))
    else:
        scaled_score = max(5, int(raw_score * 0.85))

    return max(0, min(100, scaled_score))


def assess_sif_precursor(
    report_type: str,
    text: str,
    hazard: Optional[str],
    energy_source: Optional[str],
    exposure: Optional[str],
    barrier_status: str,
    signals: List[str],
    all_hazards: Optional[List[str]] = None,
    all_energy_sources: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Executes the Hybrid SIF Decision Engine.
    Combines rule-based assessment with supervised ML probabilities and
    Multi-Hazard MAUT scoring.
    """
    cleaned_len = len((text or "").strip().split())

    # 1. Check for Insufficient Information
    if cleaned_len < 4 and (hazard is None and not signals and (energy_source is None or energy_source in ["UNKNOWN", "Insufficient Information"])):
        return {
            "assessment": "INSUFFICIENT_INFORMATION",
            "rule_based_assessment": "INSUFFICIENT_INFORMATION",
            "ai_classification": "Insufficient Information",
            "final_ai_decision": "INSUFFICIENT INFORMATION",
            "ml_probability": 0.0,
            "ai_sif_score": 15,
            "ai_confidence": 0.0,
            "potential_consequence": "Insufficient information available to evaluate potential consequence severity.",
            "reason": "The report description lacks sufficient operational details regarding hazards, energy sources, or controls for a reliable SIF precursor assessment.",
            "contributing_features": []
        }

    # 2. Supervised ML Inference
    ml_sif_prediction: Optional[str] = None
    ml_sif_confidence: Optional[float] = None
    ml_probability: float = 0.5
    ml_model: Optional[str] = None
    contributing_features: List[Dict[str, Any]] = []

    if predict_sif_potential is not None and text and text.strip():
        try:
            ml_res = predict_sif_potential(text)
            if isinstance(ml_res, dict) and ml_res.get("status") == "SUCCESS":
                ml_sif_prediction = ml_res.get("predicted_class")
                ml_sif_confidence = ml_res.get("confidence")
                ml_probability = float(ml_res.get("sif_probability", 0.5))
                ml_model = ml_res.get("model_name")
                contributing_features = ml_res.get("contributing_features", [])
        except Exception as exc:
            logger.warning(f"ML inference fallback triggered: {exc}")

    # 3. Rule-Based Safety Evidence Evaluation
    h_low = (hazard or "").lower()
    e_low = (energy_source or "").lower()
    t_low = text.lower()

    detected_sources = all_energy_sources or []
    has_high_energy_source = (
        energy_source in [
            "GRAVITY", "KINETIC", "ELECTRICAL", "THERMAL", "CHEMICAL",
            "HIGH_PRESSURE / PNEUMATIC / HYDRAULIC", "TOXIC / ATMOSPHERIC", "MULTIPLE",
            "Electrical", "Pneumatic / High Pressure", "Chemical", "Thermal", "Gravity"
        ] or
        len(detected_sources) > 0 or
        any(k in h_low or k in e_low or k in t_low for k in [
            "suspended load", "dropped object", "fall from height", "work at height",
            "arc flash", "electrical", "confined space", "atmospheric", "high pressure",
            "high-pressure", "pressurized", "gas leak", "blowout", "toxic gas", "vehicle",
            "crane", "flame", "thermal", "heat", "line of fire", "line-of-fire", "loto", "lockout"
        ])
    )
    is_minor_slip = any(k in h_low for k in ["slip", "trip", "surface housekeeping"]) and not has_high_energy_source

    has_exposure = (
        (exposure is not None and "not exposed" not in exposure.lower() and exposure != "Insufficient Information") or
        len(signals) > 0 or
        any(k in t_low for k in ["line of fire", "line-of-fire", "under load", "confined space", "standing"])
    )
    has_barrier_deficiency = barrier_status in [
        "BARRIER_MISSING", "BARRIER_FAILED", "BARRIER_BYPASSED", "BARRIER_COMPROMISED"
    ]

    # Rule Assessment Determination
    if has_high_energy_source and (has_exposure or has_barrier_deficiency):
        rule_assessment = "YES"
        rule_reason = "Report presents evidence of hazardous high energy combined with personnel exposure or barrier deficiency."
    elif is_minor_slip:
        rule_assessment = "NO"
        rule_reason = "Report describes localized low-severity slip/trip condition without high-energy hazard or severe consequence potential."
    elif has_high_energy_source and not has_exposure and barrier_status == "BARRIER_PRESENT":
        rule_assessment = "NO"
        rule_reason = "High-energy vector was present but verified active barriers successfully prevented personnel exposure."
    elif has_high_energy_source:
        rule_assessment = "YES"
        rule_reason = "High-energy operational hazard identified with potential unmitigated exposure pathways."
    else:
        rule_assessment = "NO"
        rule_reason = "Available information does not indicate high-energy exposure or potential serious consequence precursors."

    # 4. Hybrid Decision Synthesis
    if rule_assessment == "YES":
        final_decision = "CONFIRMED SIF PRECURSOR"
        ai_class = "SIF-potential"
    elif rule_assessment == "NO" and ml_probability >= 0.75 and has_high_energy_source:
        final_decision = "CONFIRMED SIF PRECURSOR"
        ai_class = "SIF-potential"
        rule_reason += " (Escalated by high ML precursor probability)."
    else:
        final_decision = "NON-SIF OBSERVATION"
        ai_class = "Non-SIF-potential"

    # 5. Multi-Hazard MAUT Risk Score
    risk_score = compute_maut_risk_score(
        hazard=hazard,
        energy_source=energy_source,
        exposure=exposure,
        barrier_status=barrier_status,
        text=text,
        all_hazards=all_hazards,
        all_energy_sources=all_energy_sources
    )

    # Dynamic AI Confidence represents model/evidence certainty (distinct from risk score)
    conf_base = 82.0
    if ml_sif_confidence:
        conf_base = max(conf_base, ml_sif_confidence * 100)
    if hazard and hazard != "Insufficient Information":
        conf_base += 4.0
    if energy_source and energy_source not in ["UNKNOWN", "Insufficient Information"]:
        conf_base += 4.0
    if barrier_status != "BARRIER_INSUFFICIENT_INFO":
        conf_base += 3.0
    ai_confidence = min(96.8, round(conf_base, 1))

    # Consequence summary: explicitly captures high-energy combinations and avoids 'low-to-moderate' for severe precursors
    if any(k in t_low for k in ["high pressure", "high-pressure", "pressurized", "hydraulic"]) and any(k in t_low for k in ["line of fire", "line-of-fire", "in the line of fire", "loto", "lockout"]):
        potential_consequence = "High probability of fatal line-of-fire projectile impact, high-pressure fluid injection, or sudden dynamic energy release."
    elif any(k in t_low for k in ["confined space", "tank entry", "vessel entry"]):
        potential_consequence = "High probability of fatal atmospheric asphyxiation, toxic gas inhalation, or engulfment in enclosed space."
    elif any(k in t_low for k in ["suspended load", "under load", "dropped object", "under suspended load"]):
        potential_consequence = "High probability of fatal blunt-force crush injury or catastrophic struck-by trauma from falling heavy mass."
    elif any(k in e_low for k in ["electrical"]) or any(k in t_low for k in ["electrical", "live wire", "switchgear", "arc flash"]):
        potential_consequence = "Potential high-voltage electrocution, severe arc flash thermal burns, or fatal electrical shock."
    elif has_high_energy_source and any(k in e_low or k in t_low for k in ["pressure", "pneumatic", "hydraulic"]):
        potential_consequence = "Potential high-pressure fluid injection, line blowout impact, or mechanical strike."
    elif has_high_energy_source and any(k in e_low or k in t_low for k in ["gravity", "height", "scaffold"]):
        potential_consequence = "Potential severe blunt force trauma, crush injury, or fatality from falling mass or fall from height."
    elif has_high_energy_source and any(k in e_low or k in t_low for k in ["toxic", "atmospheric"]):
        potential_consequence = "Potential acute toxic gas asphyxiation or oxygen deficiency in confined space."
    elif has_high_energy_source and any(k in e_low or k in t_low for k in ["chemical"]):
        potential_consequence = "Potential hazardous chemical contamination or chemical burns."
    elif has_high_energy_source and any(k in e_low or k in t_low for k in ["thermal", "fire"]):
        potential_consequence = "Potential severe thermal burns or flash fire injuries from extreme heat exposure."
    elif has_high_energy_source and any(k in e_low or k in t_low for k in ["kinetic"]):
        potential_consequence = "Potential heavy impact trauma, crushing injury, or caught-between machinery trauma."
    elif has_high_energy_source:
        potential_consequence = "Potential severe life-threatening trauma from unmitigated high-energy release."
    elif is_minor_slip:
        potential_consequence = "Potential low-severity surface slip or minor localized contusion."
    else:
        potential_consequence = "Localized operational hazard without immediate life-threatening potential."

    return {
        "assessment": "YES" if ai_class == "SIF-potential" else "NO",
        "ai_classification": ai_class,
        "final_ai_decision": final_decision,
        "rule_based_assessment": rule_assessment,
        "ml_probability": round(ml_probability, 4),
        "ai_sif_score": risk_score,
        "ai_confidence": ai_confidence,
        "potential_consequence": potential_consequence,
        "reason": rule_reason,
        "contributing_features": contributing_features,
        "ml_model": ml_model or "sif_tfidf_logistic_regression"
    }
