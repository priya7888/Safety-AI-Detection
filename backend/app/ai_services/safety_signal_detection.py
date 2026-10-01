import re
from typing import List

def detect_safety_signals(text: str) -> List[str]:
    """
    Identifies meaningful safety precursor signals supported by the report text.
    Returns an empty list if no clear safety signals are detected.
    """
    lower_text = text.lower()
    signals: List[str] = []

    # 1. Drop zone / Suspended load positioning
    if re.search(r'\b(standing under|walked under|beneath load|drop zone|underneath|suspended over)\b', lower_text):
        signals.append("Personnel positioned within active suspended load drop zone")

    # 2. Work at height without tie-off
    if re.search(r'\b(without harness|no harness|not tied off|unsecured at height|leaning over edge|no fall arrest)\b', lower_text):
        signals.append("Personnel working at elevation without verified fall arrest tie-off")

    # 3. Energy isolation / LOTO failure
    if re.search(r'\b(no loto|without lockout|did not isolate|not de-energized|energized line|live circuit)\b', lower_text):
        signals.append("Hazardous energy isolation protocol (LOTO) omitted on active system")

    # 4. Machine Guarding missing/bypassed
    if re.search(r'\b(missing guard|guard removed|interlock bypassed|exposed nip|exposed rotating)\b', lower_text):
        signals.append("Primary physical machine guard or safety interlock missing/bypassed")

    # 5. Dropped object occurrence
    if re.search(r'\b(dropped|fell from height|narrowly missed|fell near|tool dropped)\b', lower_text):
        signals.append("Uncontrolled dropped object event in vicinity of personnel or assets")

    # 6. Open edge / Barricade failure
    if re.search(r'\b(missing handrail|open grating|unguarded opening|no barricade|unbarricaded)\b', lower_text):
        signals.append("Unguarded edge or floor opening lacking compliant physical barrier")

    # 7. Permit / Procedure bypass
    if re.search(r'\b(without permit|no ptw|unauthorized entry|bypassed procedure|violated procedure)\b', lower_text):
        signals.append("Safety procedure / Permit-To-Work requirement bypassed during high-risk task")

    # 8. Confined Space hazard
    if re.search(r'\b(no gas test|untested atmosphere|entered without standby|without breathing apparatus)\b', lower_text):
        signals.append("Confined space entry conducted without required gas clearance or standby")

    # 9. Vehicle Pedestrian Proximity
    if re.search(r'\b(near collision|almost struck|forklift near worker|blind spot|no spotter)\b', lower_text):
        signals.append("Mobile heavy equipment operating in unsegregated pedestrian zone")

    # 10. Damaged equipment
    if re.search(r'\b(damaged sling|cracked|frayed|worn out|faulty brake|malfunctioned)\b', lower_text):
        signals.append("Compromised or damaged safety-critical equipment in active operation")

    return signals
