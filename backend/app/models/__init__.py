"""
Import all models here so that Base.metadata is aware of every table
when `Base.metadata.create_all(engine)` is called from main.py.
"""
from app.models.safety_report import SafetyReport  # noqa: F401
from app.models.life_saving_rule import LifeSavingRule, ReportRuleMapping  # noqa: F401
