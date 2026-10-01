import re
from typing import Dict

def analyze_barriers(text: str) -> Dict[str, str]:
    """
    Analyzes safety controls and barriers mentioned in the report.
    Returns barrier status (BARRIER_PRESENT, BARRIER_MISSING, BARRIER_FAILED, BARRIER_UNKNOWN)
    and a descriptive explanation of barrier health.
    """
    lower_text = text.lower()

    # 1. Missing Barriers
    if re.search(r'\b(no harness|without harness|missing guard|no guard|no barricade|unbarricaded|without permit|no ptw|no loto|did not lock|without isolation|no tag|no gas test)\b', lower_text):
        return {
            "status": "BARRIER_MISSING",
            "description": "Primary safety barrier or control was missing, omitted, or not deployed during task execution."
        }
    
    # 2. Failed Barriers
    if re.search(r'\b(snapped|broke|failed|slipped|malfunctioned|cracked|gave way|detached|dislodged|faulty)\b', lower_text):
        return {
            "status": "BARRIER_FAILED",
            "description": "A safety barrier or equipment mechanism experienced physical failure, degradation, or operational malfunction."
        }
    
    # 3. Present / Functioning Barriers
    if re.search(r'\b(safety net caught|harness arrested|interlock stopped|emergency stop activated|tripped breaker|prevented injury|alarm sounded|gas detector alerted)\b', lower_text):
        return {
            "status": "BARRIER_PRESENT",
            "description": "A secondary safety barrier or warning control successfully activated and prevented actual severe contact/harm."
        }
    
    # 4. Unknown / Insufficient Barrier Data
    return {
        "status": "BARRIER_UNKNOWN",
        "description": "Information regarding safety controls or barriers was not identified or specified in the available report text."
    }
