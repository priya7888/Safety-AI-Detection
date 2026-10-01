"""
Rule-based, human-readable explanation generator.

Produces the plain-English sentence shown on the Report Details page,
built from the extracted attributes rather than a generative model. This
keeps behaviour deterministic and auditable for an MVP; it can later be
swapped for an LLM-generated explanation without changing callers.
"""
from typing import List, Optional


def generate_explanation(
    sif_potential: bool,
    activity: Optional[str],
    location: Optional[str],
    barrier_failure: Optional[str],
    life_saving_rules: List[str],
) -> str:
    if not sif_potential:
        return (
            "This report does not indicate a recognized Serious Injury or "
            "Fatality (SIF) precursor pattern. No critical barrier failure "
            "or high-energy exposure was identified in the text."
        )

    parts = []
    if barrier_failure:
        parts.append(f"a critical safety barrier failure ({barrier_failure.lower()})")
    if activity:
        parts.append(f"during {activity.lower()}")
    if location:
        parts.append(f"at/in a {location.lower()}")

    detail = " ".join(parts) if parts else "a high-energy exposure situation"

    rule_text = ""
    if life_saving_rules:
        rule_text = f" This aligns with the '{', '.join(life_saving_rules)}' IOGP Life-Saving Rule(s)."

    return (
        f"This report indicates {detail}, which is consistent with known "
        f"Serious Injury or Fatality (SIF) precursor patterns.{rule_text} "
        "Immediate review and corrective action are recommended."
    )
