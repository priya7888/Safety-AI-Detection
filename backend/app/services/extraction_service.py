"""
Information extraction service.

Extracts three structured attributes from free-text safety reports using
keyword matching + regex rules (no heavyweight NER model required for the
MVP). Rules are defined as ordered lists of (pattern, label) so new
keywords/labels can be added without touching the matching logic.

Each category is checked independently, in priority order -- the first
pattern that matches wins for that category. This keeps behaviour
predictable and easy to extend.
"""
import re
from typing import Optional, Dict

# ---------------------------------------------------------------------------
# Configurable keyword -> normalized label rules.
# Add new rows here to extend extraction without changing any code below.
# ---------------------------------------------------------------------------

ACTIVITY_RULES = [
    (r"\bconfined space\b|\bentered a?n? ?(vessel|tank|silo|manhole|pit|drum)\b", "Confined Space Entry"),
    (r"\bwelding\b|\bcutting\b|\bgrinding\b|\bhot work\b|\bbrazing\b|\btorch\b", "Hot Work"),
    (r"\blifting\b|\bcrane\b|\brigging\b|\bsling\b|\bhoist\b|\bsuspended load\b", "Lifting Operation"),
    (r"\bscaffold\b|\bworking at height\b|\bladder\b|\brooftop\b|\bfall protection\b|\bharness\b", "Working at Height"),
    (r"\belectric(al)?\b|\benergiz|\bpanel\b|\bcircuit\b|\blive wire\b", "Electrical Work"),
    (r"\bexcavat|\btrench\b", "Excavation"),
    (r"\bmaintenance\b|\brepair(ed|ing)?\b|\bservic(e|ing)\b", "Maintenance"),
    (r"\bdriving\b|\bvehicle\b|\bforklift\b|\btruck\b", "Vehicle Operation"),
    (r"\bhousekeeping\b|\bcleaning\b|\btidy\b", "Housekeeping"),
    (r"\bwalking\b|\bwalked\b|\boffice\b|\bcorridor\b", "General Office / Walking"),
]

LOCATION_RULES = [
    (r"\bvessel\b", "Vessel"),
    (r"\btank\b", "Tank"),
    (r"\bsilo\b", "Silo"),
    (r"\bmanhole\b", "Manhole"),
    (r"\bpit\b", "Pit"),
    (r"\brooftop\b|\broof\b", "Rooftop"),
    (r"\bscaffold(ing)?\b", "Scaffold"),
    (r"\bpanel\b|\belectrical room\b|\bsubstation\b", "Electrical Panel/Room"),
    (r"\bwarehouse\b", "Warehouse"),
    (r"\bworkshop\b", "Workshop"),
    (r"\boffice\b", "Office"),
    (r"\bcorridor\b|\bhallway\b", "Corridor"),
    (r"\bcar park\b|\bparking\b", "Parking Area"),
    (r"\btrench\b|\bexcavation\b", "Excavation Site"),
    (r"\bcafeteria\b|\bbreak room\b", "Cafeteria"),
]

BARRIER_FAILURE_RULES = [
    (r"without (proper )?(gas test(ing)?|atmospheric test(ing)?)", "Gas Testing Missing"),
    (r"without (isolat(ing|ion)|de-?energiz)", "Energy Isolation Missing"),
    (r"without a (proper )?(hot work )?permit|without permit", "Permit Missing"),
    (r"without (fall protection|a harness|harness)", "Fall Protection Missing"),
    (r"without (inspection|inspecting)|no inspection", "Inspection Missing"),
    (r"exceed(ing|ed)? (the )?rated capacity", "Load Limit Exceeded"),
    (r"damaged (sling|rigging|equipment)", "Defective Equipment Used"),
    (r"bypass(ed|ing)? (lockout|tagout|loto)", "Lockout-Tagout Bypassed"),
    (r"without (a )?(guard|guardrail)", "Guarding Missing"),
    (r"without (ventilation|monitoring)", "Ventilation/Monitoring Missing"),
]


def _first_match(text: str, rules) -> Optional[str]:
    lower_text = text.lower()
    for pattern, label in rules:
        if re.search(pattern, lower_text):
            return label
    return None


def extract_information(report_text: str, user_activity: Optional[str] = None,
                         user_location: Optional[str] = None) -> Dict[str, Optional[str]]:
    """
    Extract Activity, Location and Barrier Failure from a report.

    If the user already supplied `activity` / `location` in the form,
    that value is preferred (the free-text extraction is used mainly as a
    fallback and to normalize/validate).
    """
    activity = user_activity or _first_match(report_text, ACTIVITY_RULES)
    location = user_location or _first_match(report_text, LOCATION_RULES)
    barrier_failure = _first_match(report_text, BARRIER_FAILURE_RULES)

    return {
        "activity": activity,
        "location": location,
        "barrier_failure": barrier_failure,
    }
