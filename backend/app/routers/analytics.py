"""
GET /api/analytics/dashboard - aggregated data powering the React dashboard.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.analytics import DashboardAnalytics
from app.services.analytics_service import get_dashboard_analytics

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardAnalytics)
def dashboard(db: Session = Depends(get_db)):
    return get_dashboard_analytics(db)
