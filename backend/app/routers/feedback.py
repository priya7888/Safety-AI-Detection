from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.safety_report import SafetyReport
from ..models.feedback import Feedback
from ..models.ai_analysis import AIAnalysis
from ..schemas.feedback import FeedbackCreate, FeedbackResponse
from ..schemas.safety_report import SafetyReportListItem
from ..dependencies import get_current_user
from ..services.report_service import get_report_by_id

router = APIRouter(prefix="/api/feedback", tags=["Human Review & Feedback"])

@router.post("/reports/{report_id}", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_report_feedback(
    report_id: int,
    payload: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submits human review & feedback on an AI analysis."""
    report = get_report_by_id(db, report_id, current_user.organization_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Safety report not found or access denied."
        )

    norm_status = payload.feedback_status.upper().strip()
    if norm_status not in ["CORRECT", "PARTIALLY_CORRECT", "INCORRECT"]:
        norm_status = "CORRECT"

    fb = Feedback(
        report_id=report.id,
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        feedback_status=norm_status,
        feedback_text=payload.feedback_text.strip() if payload.feedback_text else None,
        human_sif_decision=payload.human_sif_decision.strip() if payload.human_sif_decision else None,
        human_sif_score=payload.human_sif_score if payload.human_sif_score is not None else None,
        review_status=payload.review_status.strip() if payload.review_status else "COMPLETED"
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb

@router.get("/reports/{report_id}", response_model=List[FeedbackResponse])
def get_report_feedback(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves human review feedback for a given report."""
    report = get_report_by_id(db, report_id, current_user.organization_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Safety report not found or access denied."
        )
    return report.feedbacks

@router.get("/pending", response_model=List[SafetyReportListItem])
def get_pending_review_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns reports that have completed AI analysis but do not yet have human feedback.
    """
    # Subquery of report IDs that have feedback
    feedback_report_ids = db.query(Feedback.report_id).filter(
        Feedback.organization_id == current_user.organization_id
    ).subquery()

    pending_reports = db.query(SafetyReport).filter(
        SafetyReport.organization_id == current_user.organization_id,
        SafetyReport.analysis_status == "COMPLETED",
        ~SafetyReport.id.in_(feedback_report_ids)
    ).all()

    result = []
    for r in pending_reports:
        sif_assessment = r.ai_analysis.sif_precursor_assessment if r.ai_analysis else None
        identified_hazard = r.ai_analysis.identified_hazard if r.ai_analysis else None
        result.append(SafetyReportListItem(
            id=r.id,
            report_reference=r.report_reference,
            organization_id=r.organization_id,
            report_type=r.report_type,
            description=r.description,
            location=r.location,
            report_date=r.report_date,
            additional_context=r.additional_context,
            analysis_status=r.analysis_status,
            sif_precursor_assessment=sif_assessment,
            identified_hazard=identified_hazard,
            created_at=r.created_at
        ))
    return result

@router.get("/all", response_model=List[FeedbackResponse])
def get_all_organization_feedback(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns all human feedback records for the organization."""
    return db.query(Feedback).filter(
        Feedback.organization_id == current_user.organization_id
    ).all()
