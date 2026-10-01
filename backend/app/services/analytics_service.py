"""
Analytics service backing GET /api/analytics/dashboard.

Computes:
  - overall totals and SIF Precursor Density
  - SIF Precursor Density ranked by Site and by Activity
  - Life-Saving Rule distribution across all reports
  - recurring barrier failures (delegates to pattern_analysis_service)
"""
from typing import List, Dict
from sqlalchemy import func, Integer
from sqlalchemy.orm import Session

from app.models.safety_report import SafetyReport
from app.models.life_saving_rule import LifeSavingRule, ReportRuleMapping
from app.services import pattern_analysis_service


def _density_by(db: Session, column) -> List[Dict]:
    """
    Compute SIF Precursor Density (SIF reports / total reports) grouped by
    the given column (e.g. site or activity), ranked descending by density.
    """
    rows = (
        db.query(
            column.label("label"),
            func.count(SafetyReport.id).label("total"),
            func.sum(func.cast(SafetyReport.sif_potential, Integer)).label("sif_count"),
        )
        .filter(column.isnot(None))
        .group_by(column)
        .all()
    )

    result = []
    for r in rows:
        total = r.total or 0
        sif_count = r.sif_count or 0
        density = round((sif_count / total) * 100, 2) if total else 0.0
        result.append(
            {
                "label": r.label,
                "total_reports": total,
                "sif_reports": sif_count,
                "density_percent": density,
            }
        )

    result.sort(key=lambda x: x["density_percent"], reverse=True)
    return result


def density_by_site(db: Session) -> List[Dict]:
    return _density_by(db, SafetyReport.site)


def density_by_activity(db: Session) -> List[Dict]:
    return _density_by(db, SafetyReport.activity)


def life_saving_rule_distribution(db: Session) -> List[Dict]:
    rows = (
        db.query(LifeSavingRule.name.label("rule"), func.count(ReportRuleMapping.id).label("count"))
        .join(ReportRuleMapping, ReportRuleMapping.rule_id == LifeSavingRule.id)
        .group_by(LifeSavingRule.name)
        .order_by(func.count(ReportRuleMapping.id).desc())
        .all()
    )
    return [{"rule": r.rule, "count": r.count} for r in rows]


def get_dashboard_analytics(db: Session) -> Dict:
    total_reports = db.query(func.count(SafetyReport.id)).scalar() or 0
    sif_reports = (
        db.query(func.count(SafetyReport.id)).filter(SafetyReport.sif_potential.is_(True)).scalar() or 0
    )
    non_sif_reports = total_reports - sif_reports
    overall_density = round((sif_reports / total_reports) * 100, 2) if total_reports else 0.0

    recurring = pattern_analysis_service.get_all_recurring_patterns(db)
    recurring_barriers = [
        {"barrier_failure": item["label"], "count": item["count"]}
        for item in recurring["barrier_failures"]
    ]

    return {
        "total_reports": total_reports,
        "sif_reports": sif_reports,
        "non_sif_reports": non_sif_reports,
        "overall_density_percent": overall_density,
        "density_by_site": density_by_site(db),
        "density_by_activity": density_by_activity(db),
        "life_saving_rule_distribution": life_saving_rule_distribution(db),
        "recurring_barrier_failures": recurring_barriers,
        "recurring_patterns": {
            "activities": [{"label": i["label"], "count": i["count"]} for i in recurring["activities"]],
            "locations": [{"label": i["label"], "count": i["count"]} for i in recurring["locations"]],
            "barrier_failures": [{"label": i["label"], "count": i["count"]} for i in recurring["barrier_failures"]],
        },
    }
