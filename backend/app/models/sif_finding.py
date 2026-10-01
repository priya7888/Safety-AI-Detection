from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..database import Base

class SIFFinding(Base):
    __tablename__ = "sif_findings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id = Column(String(50), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    
    related_report_ids = Column(JSON, nullable=False) # List of report reference IDs, e.g. ["REP-001", "REP-003"]
    common_hazard = Column(String(200), nullable=False)
    common_safety_signals = Column(JSON, nullable=False) # List of signal strings
    barrier_issues = Column(Text, nullable=False)
    related_location = Column(String(200), nullable=False)
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="sif_findings")
