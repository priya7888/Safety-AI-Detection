"""
IOGP Life-Saving Rule tagging service.

Maps a report's free text (plus its extracted activity / barrier failure)
to zero or more of the six MVP Life-Saving Rules. Rules are configurable
dictionaries of regex triggers so more rules -- or more triggers per rule
-- can be added without touching the matching logic.
"""
import re
from typing import List

# ---------------------------------------------------------------------------
# Configurable rule -> trigger patterns.
# A report can match more than one rule; all matches are returned.
# ---------------------------------------------------------------------------

LIFE_SAVING_RULES = [
    (
        "Energy Isolation",
        [
            r"without (isolat(ing|ion)|de-?energiz)",
            r"live (circuit|wire|line)",
            r"bypass(ed|ing)? (lockout|tagout|loto)",
            r"energiz(ed)? (equipment|panel|circuit)",
        ],
    ),
    (
        "Confined Space",
        [
            r"confined space",
            r"entered a?n? ?(vessel|tank|silo|manhole|pit|drum)",
            r"without (proper )?(gas test(ing)?|atmospheric test(ing)?)",
            r"without (ventilation|monitoring)",
        ],
    ),
    (
        "Hot Work",
        [
            r"hot work",
            r"welding|cutting|grinding|brazing|torch",
            r"without a (proper )?(hot work )?permit",
        ],
    ),
    (
        "Line of Fire",
        [
            r"line of fire",
            r"suspended load",
            r"standing (below|under)",
            r"walked under",
            r"drop zone",
        ],
    ),
    (
        "Working at Height",
        [
            r"work(ed|ing)? at height",
            r"scaffold",
            r"ladder",
            r"rooftop|roof edge|open edge",
            r"without (fall protection|a harness|harness)",
        ],
    ),
    (
        "Lifting Operations",
        [
            r"lifting operation",
            r"crane",
            r"rigging|rigger",
            r"sling",
            r"exceed(ing|ed)? (the )?rated capacity",
        ],
    ),
]


def map_life_saving_rules(report_text: str) -> List[str]:
    """Return the list of Life-Saving Rule names triggered by this report text."""
    lower_text = report_text.lower()
    matched = []
    for rule_name, patterns in LIFE_SAVING_RULES:
        if any(re.search(p, lower_text) for p in patterns):
            matched.append(rule_name)
    return matched


def all_rule_names() -> List[str]:
    """Return the full configured catalogue of Life-Saving Rule names."""
    return [name for name, _ in LIFE_SAVING_RULES]
