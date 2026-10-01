"""
Pydantic schemas for the dynamic /api/dashboard endpoint.
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


class ReportDistributionItem(BaseModel):
    report_type: str
    count: int


class ReportingTrendItem(BaseModel):
    date: str
    count: int
    sif_count: int


class SIFAssessmentItem(BaseModel):
    status: str
    count: int


class HazardItem(BaseModel):
    hazard: str
    count: int


class LocationItem(BaseModel):
    location: str
    count: int


class RecentReportItem(BaseModel):
    id: int
    reference: str
    report_type: str
    description: str
    location: Optional[str] = "General Facility"
    report_date: Optional[str] = None
    status: str = "Completed"
    sif_potential: bool = False


class PotentialSIFFindingItem(BaseModel):
    id: int
    reference: str
    report_type: str
    identified_hazard: str
    location: Optional[str] = "General Facility"
    key_safety_signal: str
    explanation: str
    created_at: Optional[str] = None


class AwaitingReviewItem(BaseModel):
    id: int
    reference: str
    report_type: str
    identified_hazard: str
    sif_assessment: str
    analysis_date: Optional[str] = None


class ReviewSubmitRequest(BaseModel):
    feedback: str
    agree_with_ai: Optional[bool] = True


class DashboardResponse(BaseModel):
    organization_name: str = "Apex Industrial Operations"
    total_reports: int
    completed_analysis: int
    potential_sif_findings: int
    awaiting_review: int

    report_distribution: List[ReportDistributionItem] = []
    reporting_trend: List[ReportingTrendItem] = []
    sif_assessment_distribution: List[SIFAssessmentItem] = []
    common_hazards: List[HazardItem] = []
    reports_by_location: List[LocationItem] = []

    recent_reports: List[RecentReportItem] = []
    potential_sif_findings_list: List[PotentialSIFFindingItem] = []
    reports_awaiting_review: List[AwaitingReviewItem] = []
