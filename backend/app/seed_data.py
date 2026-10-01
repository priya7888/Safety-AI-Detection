from sqlalchemy.orm import Session
from .database import SessionLocal, Base, engine
from .models.organization import Organization
from .models.user import User
from .models.safety_report import SafetyReport
from .models.ai_analysis import AIAnalysis
from .models.feedback import Feedback
from .ai_services.ai_service import analyze_safety_report
from .routers.auth import ensure_initial_seed

def seed_sample_data():
    """
    Initializes database schema and ensures preset organizations and authentication
    accounts exist for secure login. ZERO operational safety reports are populated.
    """
    db = SessionLocal()
    try:
        # 1. Create tables
        Base.metadata.create_all(bind=engine)
        
        # 2. Seed default 5 orgs and users so authentication is always available
        ensure_initial_seed(db)
    finally:
        db.close()

