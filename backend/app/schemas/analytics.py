"""
Pydantic schemas for the analytics / dashboard API.
"""
from typing import List, Optional
from pydantic import BaseModel


class DensityItem(BaseModel):
    label: str
    total_reports: int
    sif_reports: int
    density_percent: float


class RuleDistributionItem(BaseModel):
    rule: str
    count: int


class BarrierFailureItem(BaseModel):
    barrier_failure: str
    count: int


class RecurringPatternItem(BaseModel):
    label: str
    count: int


class RecurringPatterns(BaseModel):
    activities: List[RecurringPatternItem] = []
    locations: List[RecurringPatternItem] = []
    barrier_failures: List[RecurringPatternItem] = []


class DashboardAnalytics(BaseModel):
    total_reports: int
    sif_reports: int
    non_sif_reports: int
    overall_density_percent: float

    density_by_site: List[DensityItem] = []
    density_by_activity: List[DensityItem] = []

    life_saving_rule_distribution: List[RuleDistributionItem] = []
    recurring_barrier_failures: List[BarrierFailureItem] = []

    recurring_patterns: Optional[RecurringPatterns] = None
