from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..dependencies import get_current_user
from ..services.weak_signal_service import (
    get_weak_signals_for_organization,
    get_weak_signal_by_id,
    update_weak_signal_review,
    evaluate_custom_reports_correlation
)

router = APIRouter(prefix="/api/weak-signals", tags=["Weak Signals Intelligence"])

class WeakSignalReviewRequest(BaseModel):
    status: str
    notes: Optional[str] = None
    decision: Optional[str] = None  # Confirmed, Not Relevant / Incorrect, Relevant but Low Importance
    reviewer: Optional[str] = None


class CorrelateReportsRequest(BaseModel):
    reports: List[Dict[str, Any]]

@router.get("")
def list_weak_signals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns AI-correlated weak signals and KPI summary strictly isolated
    to the authenticated user's organization.
    """
    return get_weak_signals_for_organization(db, current_user.organization_id)

@router.get("/{signal_id}")
def get_weak_signal_details(
    signal_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns full forensic dossier for a specific weak signal including
    correlated multi-record identification, progression timeline, and mitigation protocol.
    """
    signal = get_weak_signal_by_id(db, current_user.organization_id, signal_id)
    if not signal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Weak signal '{signal_id}' not found."
        )
    return signal

@router.post("/{signal_id}/review")
def review_weak_signal(
    signal_id: str,
    payload: WeakSignalReviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Persists auditor review status, human classification decision, and directives in the database
    with strict completion locking enforcement.
    """
    try:
        reviewer_name = payload.reviewer or (current_user.email if current_user else "Auditor")
        return update_weak_signal_review(
            db=db,
            org_id=current_user.organization_id,
            signal_id=signal_id,
            status=payload.status,
            notes=payload.notes,
            decision=payload.decision,
            reviewer=reviewer_name
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/correlate")
def run_correlation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Triggers on-demand multi-report signal correlation across all analyzed reports.
    """
    return get_weak_signals_for_organization(db, current_user.organization_id)

@router.post("/correlate-reports")
def correlate_arbitrary_reports(
    payload: CorrelateReportsRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Evaluates a specific arbitrary list of safety reports (e.g. 2 or more reports)
    and determines whether they form an interacting compound hazard or SIF precursor.
    """
    return evaluate_custom_reports_correlation(payload.reports)
