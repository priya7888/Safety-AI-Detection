"""
SafetyReport model.

Represents a single Unsafe Act / Unsafe Condition / Near-Miss report along
with the results of the AI/NLP analysis performed on it.
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class SafetyReport(Base):
    __tablename__ = "safety_reports"

    id = Column(Integer, primary_key=True, index=True)

    # --- raw input ---
    report_text = Column(Text, nullable=False)
    report_type = Column(String(50), nullable=False)  # Unsafe Act / Unsafe Condition / Near Miss
    site = Column(String(100), nullable=True, index=True)
    location = Column(String(150), nullable=True)
    activity_input = Column(String(150), nullable=True)  # activity supplied by the user, if any
    report_date = Column(DateTime, nullable=True)

    # --- AI analysis output ---
    sif_potential = Column(Boolean, nullable=False, default=False, index=True)
    confidence_score = Column(Float, nullable=False, default=0.0)
    activity = Column(String(150), nullable=True, index=True)  # extracted/normalized activity / hazard
    extracted_location = Column(String(150), nullable=True)
    barrier_failure = Column(String(150), nullable=True, index=True)
    explanation = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="Completed")  # Completed / Processing / Pending / Failed

    # --- Human-in-the-Loop Review ---
    is_reviewed = Column(Boolean, nullable=False, default=False, index=True)
    reviewer_feedback = Column(Text, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    rule_mappings = relationship(
        "ReportRuleMapping",
        back_populates="report",
        cascade="all, delete-orphan",
    )

