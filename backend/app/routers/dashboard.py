"""
Router for GET /api/dashboard and Human-in-the-Loop review endpoints.
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.safety_report import SafetyReport
from app.schemas.dashboard import DashboardResponse, ReviewSubmitRequest
from app.services.dashboard_service import get_dynamic_dashboard

router = APIRouter(tags=["dashboard"])


@router.get("/api/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    """
    Returns real, dynamic organization dashboard analytics for SafetyAI SIH PS 165.
    Contains zero hardcoded mock data.
    """
    return get_dynamic_dashboard(db)


@router.post("/api/reports/{report_id}/review")
def submit_human_review(
    report_id: int = Path(..., description="ID of report to review"),
    payload: ReviewSubmitRequest = ...,
    db: Session = Depends(get_db),
):
    """
    Submits a human safety professional review/feedback for a completed AI analysis.
    """
    report = db.query(SafetyReport).filter(SafetyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Safety report not found")

    report.is_reviewed = True
    report.reviewer_feedback = payload.feedback
    report.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(report)

    return {
        "status": "success",
        "message": "Human review recorded successfully",
        "report_id": report.id,
        "is_reviewed": report.is_reviewed,
    }
