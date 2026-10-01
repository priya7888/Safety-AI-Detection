import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class FeedbackStatusEnum(str, enum.Enum):
    CORRECT = "CORRECT"
    PARTIALLY_CORRECT = "PARTIALLY_CORRECT"
    INCORRECT = "INCORRECT"

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("safety_reports.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(String(50), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    feedback_status = Column(String(50), nullable=False) # CORRECT, PARTIALLY_CORRECT, INCORRECT
    feedback_text = Column(Text, nullable=True)
    human_sif_decision = Column(String(50), nullable=True) # SIF-potential, Non-SIF-potential, CONFIRMED, REJECTED
    human_sif_score = Column(Integer, nullable=True) # 0 to 100
    review_status = Column(String(50), default="COMPLETED", nullable=False) # COMPLETED, PENDING
    created_at = Column(DateTime, default=datetime.utcnow)

    safety_report = relationship("SafetyReport", back_populates="feedbacks")
    user = relationship("User", back_populates="feedbacks")
