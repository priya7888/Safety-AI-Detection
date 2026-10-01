from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id = Column(String(50), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password = Column(String(200), nullable=False) # In production we hash; matching simple auth credentials
    full_name = Column(String(100), default="Safety Officer")
    role = Column(String(50), default="HSE_OFFICER")
    mode = Column(String(50), default="Field Operations")
    permissions = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="users")
    safety_reports = relationship("SafetyReport", back_populates="user")
    feedbacks = relationship("Feedback", back_populates="user")
