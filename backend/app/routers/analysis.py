import re
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..schemas.ai_analysis import AIAnalysisResponse, AIAnalysisRequest, AIAnalysisExecuteResponse
from ..dependencies import get_current_user
from ..services.analysis_service import get_organization_analyses, execute_direct_analysis
from ..ai_services.ai_service import analyze_safety_report
from ..ai_services.signal_correlation import detect_latent_weak_signals_in_text
from ..ai_services.safety_validity import classify_safety_observation_validity

router = APIRouter(prefix="/api/analysis", tags=["AI Analysis"])
ai_analysis_router = APIRouter(prefix="/api/ai-analysis", tags=["AI Analysis"])

class LiveAnalysisRequest(BaseModel):
    report_text: str
    report_name: Optional[str] = None
    report_type: Optional[str] = "Near Miss"
    location: Optional[str] = None
    site: Optional[str] = None
    report_date: Optional[str] = None

def generate_dynamic_recommendations(hazard: Optional[str], text: str) -> List[str]:
    h_low = (hazard or "").lower()
    t_low = text.lower()
    if "slip" in h_low or "slip" in t_low or "slippery" in t_low:
        return [
            "Inspect and rectify the slippery surface, identify the source of moisture/oil.",
            "Provide warning signage and prevent pedestrian exposure until corrected.",
            "Clean and dry the affected area immediately with appropriate absorbent.",
            "Verify the area during routine post-shift safety inspection."
        ]
    elif "water" in t_low and ("electrical" in t_low or "panel" in t_low):
        return [
            "De-energize electrical panel immediately and establish barrier cordon.",
            "Identify and isolate the source of water leakage.",
            "Inspect panel enclosure for water ingress and perform insulation resistance test.",
            "Verify dry, safe conditions before restoring electrical power."
        ]
    elif "electrical" in h_low or "arc" in h_low or "cable" in h_low:
        return [
            "De-energize electrical circuit and perform Lockout/Tagout (LOTO).",
            "Verify zero voltage using a calibrated test instrument before contact.",
            "Inspect enclosure, insulation, and conductors for thermal or physical damage.",
            "Secure loose cables into protective conduit away from walkways."
        ]
    elif "exit" in t_low or "egress" in h_low or "blocked" in t_low:
        return [
            "Immediately clear designated emergency exit and evacuation route.",
            "Remove all stored obstructions, boxes, and materials from doorway.",
            "Conduct walkdown of all emergency egress pathways in facility.",
            "Brief area shift personnel on maintaining 100% unobstructed exit access."
        ]
    elif "helmet" in t_low or "head" in h_low or ("ppe" in h_low and "without" in t_low):
        return [
            "Provide required safety helmet immediately before worker continues task.",
            "Brief frontline team on mandatory 100% PPE compliance in operational areas.",
            "Verify all personnel on shift are equipped with inspected PPE.",
            "Document observation in shift safety briefing log."
        ]
    elif "tools" in t_low or "housekeeping" in h_low or "stacked" in t_low:
        return [
            "Clear unattended tools and materials from walkway immediately.",
            "Restack materials and boxes within designated weight and height limits.",
            "Conduct routine housekeeping walkdown across working area.",
            "Ensure tools are stored in designated tool racks or containers."
        ]
    elif "gas" in h_low or "pressure" in h_low or "pipe" in h_low or "leak" in h_low:
        return [
            "Isolate upstream supply valve and depressurize affected line segment.",
            "Evacuate area upwind and perform continuous atmospheric gas testing (0% LEL).",
            "Inspect flange gasket, valve seals, and fittings for degradation.",
            "Establish safety exclusion perimeter until re-pressurization tests pass."
        ]
    elif "guard" in t_low or "machine" in h_low or "mechanical" in h_low:
        return [
            "Isolate equipment and install compliant machine guard before operation.",
            "Inspect interlock switches and secure physical fastenings.",
            "Tag equipment out-of-service until safety guarding is verified intact.",
            "Review machine safeguard pre-use checklist with operators."
        ]
    elif "forklift" in t_low or "vehicle" in h_low or "pedestrian" in t_low:
        return [
            "Reinforce pedestrian and mobile vehicle segregation barriers.",
            "Verify forklift reverse horn, beacon lamp, and operator speed compliance.",
            "Designate dedicated marshaller during vehicle movement in congested zones.",
            "Review line-of-sight and blind spot awareness during toolbox talk."
        ]
    elif "height" in h_low or "fall" in h_low or "scaffold" in h_low:
        return [
            "Ensure certified 100% tie-off with inspected harness and lanyard.",
            "Install top-rail, mid-rail, and toe-board fall protection barriers.",
            "Red-tag scaffold or ladder until certified inspection sign-off.",
            "Clear walkway of trip hazards and verify secure planking."
        ]
    elif "load" in h_low or "crane" in h_low or "rigging" in h_low:
        return [
            "Barricade drop zone and prohibit personnel from walking under suspended loads.",
            "Inspect rigging slings, hooks, and shackles for wear before lifting.",
            "Verify crane operator and rigger certifications and review lift plan.",
            "Use tag lines to control load swing from a safe distance."
        ]
    elif "chemical" in h_low:
        return [
            "Deploy chemical spill kit and contain runoff with compatible absorbent.",
            "Wear appropriate chemical-resistant gloves, goggles, and respiratory PPE.",
            "Review Safety Data Sheet (SDS) for specific neutralization protocols.",
            "Ventilate area and verify integrity of primary chemical containers."
        ]
    else:
        return [
            "Conduct immediate walkdown inspection to identify hazard root cause.",
            "Implement appropriate physical controls and warning demarcation.",
            "Verify area condition during regular shift safety inspections.",
            "Log findings in facility safety maintenance tracking register."
        ]


def handle_live_analysis(payload: LiveAnalysisRequest) -> Dict[str, Any]:
    text = payload.report_text.strip()
    r_type = payload.report_type or "Near Miss"

    # Multi-Stage Step 1: Safety Observation Validity Layer
    validity = classify_safety_observation_validity(text)

    if validity["is_unrelated"]:
        return {
            "is_unrelated": True,
            "report_name": "Unrelated Input",
            "determination_status": "UNRELATED INPUT",
            "sif_precursor": "NO",
            "sif_potential_score": 0,
            "confidence": 0,
            "detected_hazards": [
                "Observation does not contain a recognized workplace safety hazard or condition"
            ],
            "energy_vector": "None Identified",
            "worker_exposure": "Not Applicable",
            "barrier_status": "Not Applicable (Unrelated Input)",
            "life_saving_rule": "Not Applicable",
            "recommendations": [
                "Please describe a safety hazard, unsafe condition, unsafe act, or near-miss observation."
            ],
            "corrective_actions": [
                "Enter an operational safety observation with details of conditions or hazards."
            ],
            "explanation": validity["explanation"],
            "why_identified": {"summary": validity["explanation"]}
        }

    # Run Multi-Stage AI NLP Pipeline
    raw_result = analyze_safety_report(
        report_type=r_type,
        description=text,
        additional_context=f"Location: {payload.location or 'Not Specified'}"
    )

    hazard = raw_result.get("identified_hazard") or validity.get("primary_category") or "Insufficient Information"
    energy = raw_result.get("energy_source") or "Not identified / Insufficient Information"
    exposure = raw_result.get("exposure") or "Possible"
    barrier_raw = raw_result.get("barrier_information") or "BARRIER_INSUFFICIENT_INFO"

    if barrier_raw == "BARRIER_FAILED":
        barrier_display = "Failed"
    elif barrier_raw == "BARRIER_MISSING":
        barrier_display = "Missing / Not Deployed"
    elif barrier_raw == "BARRIER_BYPASSED":
        barrier_display = "Bypassed / Overridden"
    elif barrier_raw == "BARRIER_COMPROMISED":
        barrier_display = "Compromised / Degraded"
    elif barrier_raw == "BARRIER_PRESENT":
        barrier_display = "Intact / Functioning"
    else:
        barrier_display = "Insufficient Information"

    sif_val = raw_result.get("sif_precursor_assessment", "NO")
    final_decision = raw_result.get("final_ai_decision", "NON-SIF OBSERVATION")
    risk_score = raw_result.get("ai_sif_score", 20)
    confidence = raw_result.get("ai_confidence", 85.0)

    # Dynamic Location: from extracted location or payload or Unknown
    extracted_loc = raw_result.get("extracted_entities", {}).get("location")
    if extracted_loc and extracted_loc != "Unknown":
        report_location = extracted_loc
    elif payload.location and payload.location.strip():
        report_location = payload.location.strip()
    else:
        report_location = "Unknown"

    recommendations = generate_dynamic_recommendations(hazard, text)

    detected_items = [
        f"Hazard: {hazard}",
        f"Location: {report_location}",
        f"Energy Vector: {energy}",
        f"Worker Exposure: {exposure}",
        f"Barrier Status: {barrier_display}"
    ]

    lsr_obj = raw_result.get("life_saving_rule")
    lsr_display = lsr_obj.get("rule_name") if isinstance(lsr_obj, dict) else (
        "Line of Fire (LSR-04)" if sif_val == "YES" else "General Workplace Housekeeping Standards"
    )

    return {
        "report_name": payload.report_name or f"{hazard} ({report_location})",
        "determination_status": final_decision,
        "sif_precursor": sif_val,
        "sif_potential_score": risk_score,
        "confidence": confidence,
        "hazard": hazard,
        "location": report_location,
        "energy_vector": energy,
        "worker_exposure": exposure,
        "barrier_status": barrier_display,
        "detected_high_energy_vectors": [energy] if energy not in ["Not identified / Insufficient Information", "None Identified"] else [],
        "detected_hazards": detected_items,
        "recommended_controls": recommendations,
        "recommended_actions": {
            "immediate_actions": [{"action": a} for a in recommendations[:2]],
            "corrective_actions": [{"action": a} for a in recommendations[2:]]
        },
        "why_identified": {
            "summary": raw_result.get("explanation", "Observation evaluated through Multi-Stage Safety NLP Engine.")
        },
        "explanation": raw_result.get("explanation", "Observation evaluated through Multi-Stage Safety NLP Engine."),
        "life_saving_rule": lsr_display,
        "ai_classification": raw_result.get("ai_classification", "Non-SIF-potential"),
        "ai_sif_score": risk_score,
        "ai_confidence": confidence,
        "rule_based_assessment": raw_result.get("rule_based_assessment", "NO"),
        "ml_probability": raw_result.get("ml_probability", 0.0),
        "final_ai_decision": final_decision,
        "contributing_features": raw_result.get("contributing_features", []),
        "human_classification": None,
        "human_sif_score": None,
        "reviewer_feedback": None,
        "review_status": "Pending Review",
        "weak_signals": [
            {
                "signal_id": f"WS-LIVE-{i+1:02d}",
                "title": f"{ls.get('category', 'Process Safety')} Latent Deviation",
                "category": ls.get("category", "Process Safety Precursor"),
                "signal": ls.get("signal", "Latent operational irregularity"),
                "energy_source": ls.get("energy", energy),
                "barrier_status": ls.get("barrier", barrier_display),
                "risk_score": risk_score,
                "potential_sif_precursor": f"Cumulative escalation toward {hazard}"
            }
            for i, ls in enumerate(detect_latent_weak_signals_in_text(text))
        ]
    }


@router.post("/analyze", response_model=AIAnalysisExecuteResponse)
def analyze_safety_observation(
    payload: AIAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Canonical direct AI Analysis endpoint:
    Uses the Safety Observation Validity Layer to accurately accept legitimate
    operational and environmental safety reports, executes the multi-stage AI pipeline,
    and returns dynamic structured results.
    Accepts checklist-only, description-only, or combined observations.
    """
    text = (payload.report_text or "").strip()

    # Safely extract checklist_items from additional_context regardless of combination
    checklist_items: List[str] = []
    if payload.additional_context:
        ctx_val = payload.additional_context if isinstance(payload.additional_context, str) else ", ".join(str(x) for x in payload.additional_context)
        factors_text = ctx_val.replace("Safety Factors:", "").strip()
        checklist_items = [f.strip() for f in re.split(r'[,;]\s*', factors_text) if f.strip()]

    # Backend validation rule:
    # VALID if: description != empty OR checklist_items.length > 0
    # INVALID only if: description is empty AND checklist_items is empty
    if not text and len(checklist_items) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide at least one safety observation or select at least one checklist factor."
        )

    # Multi-Stage Step 1: Safety Observation Validity Layer
    validity_input = f"{text} {payload.additional_context or ''}".strip()
    validity = classify_safety_observation_validity(validity_input)

    if validity["is_unrelated"]:
        return AIAnalysisExecuteResponse(
            report_name="Unrelated Input",
            determination_status="UNRELATED INPUT",
            sif_precursor="NO",
            confidence=0,
            risk_score=0,
            sif_potential_score=0,
            classification=payload.report_type or "Near Miss",
            detected_hazards=[
                "Observation does not contain a recognized workplace safety hazard or condition"
            ],
            energy_source="None Identified",
            barrier_status="Not Applicable (Unrelated Input)",
            life_saving_rule="Not Applicable",
            iogp_rule="Not Applicable",
            explainable_reasoning=validity["explanation"],
            explanation=validity["explanation"],
            why_identified={"summary": validity["explanation"]},
            recommended_controls=[
                "Please describe a safety hazard, unsafe condition, unsafe act, or near-miss observation."
            ],
            corrective_actions=[
                "Enter an operational safety observation with details of conditions or hazards."
            ],
            is_unrelated=True,
            message="Unrelated or conversational input. No safety report created."
        )

    try:
        return execute_direct_analysis(db, current_user, payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI analysis execution failed: {str(e)}"
        )


@ai_analysis_router.post("/analyze", response_model=AIAnalysisExecuteResponse)
def analyze_safety_observation_alias(
    payload: AIAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compatibility alias routing to canonical analysis handler."""
    return analyze_safety_observation(payload, current_user, db)


@router.get("", response_model=List[AIAnalysisResponse])
def list_completed_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all completed AI analyses belonging to the authenticated organization."""
    return get_organization_analyses(db, current_user.organization_id)
