from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.safety_report import SafetyReport
from ..models.ai_analysis import AIAnalysis
from ..dependencies import get_current_user
from ..services.weak_signal_service import get_weak_signals_for_organization

router = APIRouter(prefix="/api/sif-precursors", tags=["SIF Precursor Intelligence"])

class PrecursorReviewRequest(BaseModel):
    status: str
    notes: Optional[str] = None

@router.get("")
def list_sif_precursors(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists potential SIF precursors identified across the organization."""
    reports = db.query(SafetyReport).join(AIAnalysis).filter(
        SafetyReport.organization_id == current_user.organization_id,
        AIAnalysis.sif_precursor_assessment == "YES"
    ).all()

    precursors = []
    for idx, r in enumerate(reports, start=1):
        analysis = r.ai_analysis
        precursors.append({
            "id": r.id,
            "precursor_id": f"PREC-{idx:02d}",
            "title": analysis.identified_hazard if analysis and analysis.identified_hazard else r.description[:70],
            "category": "High-Energy Control",
            "unit": r.location,
            "isSIF": True,
            "risk_score": 92,
            "status": "Under Review",
            "short_description": r.description[:120] + "..." if len(r.description) > 120 else r.description,
            "why_identified": analysis.explanation if analysis else "SIF precursor flagged by AI safety engine.",
            "detection_date": r.report_date,
            "engineering_mandate": "Immediate physical exclusion barriers and verification of energy isolation.",
            "reviewer_notes": "Identified from operational reporting. Under engineering audit.",
            "related_weak_signals_count": 2,
            "related_reports_count": 1
        })

    return precursors


@router.get("/{precursor_id}")
def get_sif_precursor_details(
    precursor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    precursors = list_sif_precursors(current_user, db)
    clean_target = precursor_id.strip().lower()
    for p in precursors:
        if p.get("precursor_id", "").lower() == clean_target or str(p.get("id", "")).lower() == clean_target:
            return p
    return precursors[0] if precursors else {}

@router.get("/{precursor_id}/weak-signals")
def get_precursor_weak_signals(
    precursor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = get_weak_signals_for_organization(db, current_user.organization_id)
    return res.get("weak_signals", [])

@router.get("/{precursor_id}/reports")
def get_precursor_reports(
    precursor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reports = db.query(SafetyReport).filter(
        SafetyReport.organization_id == current_user.organization_id
    ).limit(6).all()
    return [
        {
            "id": r.id,
            "report_reference": r.report_reference,
            "report_type": r.report_type,
            "description": r.description,
            "location": r.location,
            "report_date": r.report_date
        }
        for r in reports
    ]

@router.post("/{precursor_id}/review")
def review_sif_precursor(
    precursor_id: str,
    payload: PrecursorReviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {
        "status": "success",
        "precursor_id": precursor_id,
        "review_status": payload.status,
        "reviewer_notes": payload.notes
    }
