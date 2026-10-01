"""
Orchestrates the full analysis pipeline for a single report:

  preprocessing -> TF-IDF classification -> information extraction
  -> life-saving rule mapping -> explanation -> persistence

Used by both the single-report analyze endpoint and the bulk CSV upload
endpoint so the two paths never drift apart.
"""
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.safety_report import SafetyReport
from app.models.life_saving_rule import LifeSavingRule, ReportRuleMapping
from app.ml.classifier import get_classifier
from app.services.extraction_service import extract_information
from app.services.rule_mapping_service import map_life_saving_rules
from app.services.explanation_service import generate_explanation


def _get_or_create_rule(db: Session, rule_name: str) -> LifeSavingRule:
    rule = db.query(LifeSavingRule).filter(LifeSavingRule.name == rule_name).first()
    if not rule:
        rule = LifeSavingRule(name=rule_name)
        db.add(rule)
        db.flush()  # obtain rule.id without a full commit
    return rule


def process_and_store_report(
    db: Session,
    report_text: str,
    report_type: str,
    site: Optional[str] = None,
    location: Optional[str] = None,
    activity: Optional[str] = None,
    report_date: Optional[datetime] = None,
) -> SafetyReport:
    """Run the full pipeline on one report and persist the result. Does not commit."""

    classifier = get_classifier()
    sif_potential, confidence_score = classifier.classify(report_text)

    extracted = extract_information(report_text, user_activity=activity, user_location=location)
    life_saving_rules = map_life_saving_rules(report_text)

    explanation = generate_explanation(
        sif_potential=sif_potential,
        activity=extracted["activity"],
        location=extracted["location"],
        barrier_failure=extracted["barrier_failure"],
        life_saving_rules=life_saving_rules,
    )

    db_report = SafetyReport(
        report_text=report_text,
        report_type=report_type,
        site=site,
        location=location,
        activity_input=activity,
        report_date=report_date,
        sif_potential=sif_potential,
        confidence_score=confidence_score,
        activity=extracted["activity"],
        extracted_location=extracted["location"],
        barrier_failure=extracted["barrier_failure"],
        explanation=explanation,
    )
    db.add(db_report)
    db.flush()  # obtain db_report.id

    for rule_name in life_saving_rules:
        rule = _get_or_create_rule(db, rule_name)
        db.add(ReportRuleMapping(report_id=db_report.id, rule_id=rule.id))

    return db_report


def get_report_rule_names(report: SafetyReport):
    return [m.rule.name for m in report.rule_mappings]
