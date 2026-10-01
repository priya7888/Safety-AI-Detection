"""
Recurring precursor pattern detection.

Queries historical SIF-potential reports and computes frequency counts by
Activity, Location and Barrier Failure, so safety teams can see which
precursors keep recurring across the organization.
"""
from typing import List, Dict
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.safety_report import SafetyReport


def _top_counts(db: Session, column, limit: int = 10) -> List[Dict]:
    """Generic helper: group SIF-potential reports by `column` and count."""
    rows = (
        db.query(column.label("label"), func.count(SafetyReport.id).label("count"))
        .filter(SafetyReport.sif_potential.is_(True))
        .filter(column.isnot(None))
        .group_by(column)
        .order_by(func.count(SafetyReport.id).desc())
        .limit(limit)
        .all()
    )
    return [{"label": r.label, "count": r.count} for r in rows]


def recurring_activities(db: Session, limit: int = 10) -> List[Dict]:
    """Recurring SIF Precursor Activity, e.g. Maintenance = 15 SIF reports."""
    return _top_counts(db, SafetyReport.activity, limit)


def recurring_locations(db: Session, limit: int = 10) -> List[Dict]:
    """High SIF Precursor Concentration by location/site."""
    return _top_counts(db, SafetyReport.site, limit)


def recurring_barrier_failures(db: Session, limit: int = 10) -> List[Dict]:
    """Recurring Barrier Failure, e.g. Energy Isolation Missing = 12 reports."""
    return _top_counts(db, SafetyReport.barrier_failure, limit)


def get_all_recurring_patterns(db: Session, limit: int = 10) -> Dict[str, List[Dict]]:
    return {
        "activities": recurring_activities(db, limit),
        "locations": recurring_locations(db, limit),
        "barrier_failures": recurring_barrier_failures(db, limit),
    }
