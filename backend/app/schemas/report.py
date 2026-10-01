"""
Pydantic schemas for the SafetyReport API surface.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class ReportType:
    UNSAFE_ACT = "Unsafe Act"
    UNSAFE_CONDITION = "Unsafe Condition"
    NEAR_MISS = "Near Miss"


class ReportCreate(BaseModel):
    """Payload for POST /api/reports/analyze"""

    report_text: str = Field(..., min_length=5, description="Free text of the safety report")
    report_type: str = Field(..., description="Unsafe Act | Unsafe Condition | Near Miss")
    site: Optional[str] = None
    location: Optional[str] = None
    activity: Optional[str] = None
    report_date: Optional[datetime] = None


class ReportResponse(BaseModel):
    """Full analysis result returned after processing a report."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    report_text: str
    report_type: str
    site: Optional[str] = None
    location: Optional[str] = None
    activity: Optional[str] = None
    barrier_failure: Optional[str] = None
    sif_potential: bool
    confidence_score: float
    explanation: Optional[str] = None
    life_saving_rules: List[str] = []
    created_at: Optional[datetime] = None


class ReportListItem(BaseModel):
    """Lightweight shape used in the Report History table."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    report_text: str
    report_type: str
    site: Optional[str] = None
    activity: Optional[str] = None
    sif_potential: bool
    confidence_score: float
    life_saving_rules: List[str] = []
    created_at: Optional[datetime] = None


class UploadSummary(BaseModel):
    """Response returned after a bulk CSV upload."""

    total_processed: int
    sif_potential_count: int
    non_sif_count: int
    failed_rows: int
    errors: List[str] = []
    reports: List[ReportResponse] = []
