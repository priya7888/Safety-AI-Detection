"""
LifeSavingRule and ReportRuleMapping models.

LifeSavingRule stores the fixed catalogue of IOGP Life-Saving Rules.
ReportRuleMapping is the many-to-many join between SafetyReport and
LifeSavingRule, since a single report may trigger more than one rule.
"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class LifeSavingRule(Base):
    __tablename__ = "life_saving_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)

    report_mappings = relationship(
        "ReportRuleMapping",
        back_populates="rule",
        cascade="all, delete-orphan",
    )


class ReportRuleMapping(Base):
    __tablename__ = "report_rule_mappings"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("safety_reports.id"), nullable=False, index=True)
    rule_id = Column(Integer, ForeignKey("life_saving_rules.id"), nullable=False, index=True)

    report = relationship("SafetyReport", back_populates="rule_mappings")
    rule = relationship("LifeSavingRule", back_populates="report_mappings")
