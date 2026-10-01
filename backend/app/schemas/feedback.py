from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class FeedbackCreate(BaseModel):
    feedback_status: str = Field(..., description="CORRECT, PARTIALLY_CORRECT, INCORRECT")
    feedback_text: Optional[str] = None
    human_sif_decision: Optional[str] = None # SIF-potential, Non-SIF-potential, CONFIRMED, REJECTED
    human_sif_score: Optional[int] = None
    review_status: Optional[str] = "COMPLETED"

class FeedbackResponse(BaseModel):
    id: int
    report_id: int
    organization_id: str
    user_id: Optional[int] = None
    feedback_status: str
    feedback_text: Optional[str] = None
    human_sif_decision: Optional[str] = None
    human_sif_score: Optional[int] = None
    review_status: Optional[str] = "COMPLETED"
    created_at: datetime

    class Config:
        from_attributes = True
