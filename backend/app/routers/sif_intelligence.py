from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..schemas.sif_intelligence import SIFIntelligenceSummary, SIFPatternsResponse
from ..dependencies import get_current_user
from ..services.sif_intelligence_service import generate_sif_intelligence, get_sif_patterns_and_dashboard_data

router = APIRouter(prefix="/api/sif-intelligence", tags=["SIF Intelligence"])

@router.get("", response_model=SIFIntelligenceSummary)
def get_sif_intelligence(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns evidence-based SIF intelligence synthesized from real completed
    reports for the authenticated organization.
    """
    return generate_sif_intelligence(db, current_user.organization_id)

@router.get("/patterns", response_model=SIFPatternsResponse)
def get_sif_patterns(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns intelligence cards data, SIF Hotspot Matrix, emerging risks,
    and synthesized AI safety narrative for command center dashboard.
    """
    return get_sif_patterns_and_dashboard_data(db, current_user.organization_id)
