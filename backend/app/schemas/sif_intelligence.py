from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

class SIFFindingResponse(BaseModel):
    id: int
    organization_id: str
    related_report_ids: List[str]
    common_hazard: str
    common_safety_signals: List[str]
    barrier_issues: str
    related_location: str
    explanation: str
    created_at: datetime

    class Config:
        from_attributes = True

class SIFIntelligenceSummary(BaseModel):
    total_analyzed_reports: int
    findings: List[SIFFindingResponse]
    status_message: str

class SIFPatternsResponse(BaseModel):
    total_reports: int
    sif_density_pct: float
    high_priority_precursors: int
    most_frequent_barrier_failure: str
    highest_risk_area: str
    hotspot_matrix: List[Dict[str, Any]]
    top_locations: List[Dict[str, Any]]
    emerging_risks: List[Dict[str, Any]]
    safety_narrative: Dict[str, Any]
    status_message: str
