import re
from typing import Dict, Any, Optional

def extract_safety_information(text: str, report_type: str) -> Dict[str, Optional[str]]:
    """
    Extracts structured safety entities from report text.
    Returns None for any element not supported by the available report information.
    """
    lower_text = text.lower()
    
    extracted: Dict[str, Optional[str]] = {
        "activity": None,
        "equipment": None,
        "action": None,
        "condition": None,
        "event": None,
        "safety_control": None,
        "ppe": None,
    }

    # 1. Activities
    activity_patterns = [
        (r'\b(hot work|welding|grinding|cutting)\b', "Hot work / Welding & Grinding operations"),
        (r'\b(scaffolding|working at height|height work|roof work|ladder work|erecting scaffold)\b', "Work at height / Scaffolding activity"),
        (r'\b(lifting|rigging|crane operation|hoisting|loading|unloading)\b', "Lifting and crane hoisting operations"),
        (r'\b(confined space|tank entry|vessel cleaning|vessel inspection)\b', "Confined space entry / vessel inspection"),
        (r'\b(electrical work|cable laying|panel maintenance|switchgear|breaker maintenance)\b', "Electrical maintenance and servicing"),
        (r'\b(pressure test|hydrotest|flange tightening|line break|pipe fitting)\b', "Pressurized line maintenance / Hydrotesting"),
        (r'\b(excavation|trenching|digging|earthmoving)\b', "Excavation and trenching work"),
        (r'\b(driving|forklift operation|truck transit|heavy vehicle movement)\b', "Vehicle transit and mobile equipment operation"),
        (r'\b(chemical handling|acid transfer|solvent washing|sampling)\b', "Hazardous chemical handling / transfer"),
    ]
    for pattern, label in activity_patterns:
        if re.search(pattern, lower_text):
            extracted["activity"] = label
            break

    # 2. Equipment / Objects
    equipment_patterns = [
        (r'\b(crane|boom|hoist|winch|sling|rigging gear|shackle)\b', "Crane & Lifting Rigging Gear"),
        (r'\b(forklift|loader|excavator|dump truck|trailer|vehicle)\b', "Mobile Heavy Equipment / Vehicle"),
        (r'\b(scaffold|ladder|platform|aerial lift|manlift|cherry picker)\b', "Access Equipment / Scaffolding / Ladder"),
        (r'\b(electrical panel|switchboard|transformer|cable|breaker|junction box)\b', "Electrical Infrastructure / Switchgear"),
        (r'\b(pipeline|flange|valve|compressor|pump|pressure vessel|manifold)\b', "Pressurized Piping / Mechanical Asset"),
        (r'\b(grinder|power tool|lathe|rotating machine|conveyor belt)\b', "Rotating Machinery / Power Tool"),
        (r'\b(chemical drum|tanker|acid line|storage tank)\b', "Chemical Storage Container / Process Vessel"),
    ]
    for pattern, label in equipment_patterns:
        if re.search(pattern, lower_text):
            extracted["equipment"] = label
            break

    # 3. Actions (especially for Unsafe Acts)
    action_patterns = [
        (r'\b(not wearing|without wearing|failed to wear|refused to wear|no helmet|no harness)\b', "Operating without required PPE / harness"),
        (r'\b(bypassed|ignored|violated|did not follow|without permit|no ptw|unauthorized)\b', "Bypassing standard safety procedure / PTW protocol"),
        (r'\b(standing under|walked beneath|positioned under|near suspended load)\b', "Positioning personnel within suspended load drop zone"),
        (r'\b(operating while|speeding|reckless driving|using mobile phone)\b', "Unsafe operation of vehicle / equipment"),
        (r'\b(working without loto|did not isolate|not de-energized|energized state)\b', "Working on active system without Lock-Out/Tag-Out (LOTO) isolation"),
        (r'\b(climbing without|leaning over|overreaching|unsecured climbing)\b', "Unsecured climbing / work at elevation without tie-off"),
    ]
    for pattern, label in action_patterns:
        if re.search(pattern, lower_text):
            extracted["action"] = label
            break

    # 4. Conditions (especially for Unsafe Conditions)
    condition_patterns = [
        (r'\b(missing guard|no guard|removed guard|exposed blade|exposed gear)\b', "Missing or removed machine safeguard"),
        (r'\b(frayed wire|damaged cable|exposed live conductor|bare wire|sparking)\b', "Damaged electrical insulation / exposed live conductors"),
        (r'\b(unsecured opening|missing handrail|open grating|hole in floor|missing grating)\b', "Unguarded floor opening / missing fall protection barricade"),
        (r'\b(oil leak|oil spill|grease on floor|slippery walkway|wet surface)\b', "Hydrocarbon / fluid contamination on walking surface"),
        (r'\b(corroded|corrosion|cracked|degraded|damaged structural)\b', "Structural degradation / mechanical integrity compromise"),
        (r'\b(inadequate ventilation|toxic gas buildup|low oxygen|gas accumulation)\b', "Hazardous atmospheric accumulation in enclosed workspace"),
        (r'\b(unstable stack|leaning material|overloaded rack|unsecured gas cylinder)\b', "Unsecured or unstable heavy material storage"),
    ]
    for pattern, label in condition_patterns:
        if re.search(pattern, lower_text):
            extracted["condition"] = label
            break

    # 5. Events (especially for Near-Misses)
    event_patterns = [
        (r'\b(dropped|fell from|object fell|tool slipped|pipe dropped|nearly hit)\b', "Falling / dropped object narrowly missing personnel"),
        (r'\b(near collision|almost hit|narrowly avoided|swerved|brake failure)\b', "Near-collision / vehicle proximity breach"),
        (r'\b(flashover|arc flash|spark ignition|small fire extinguished|popping sound)\b', "Electrical arc flash / minor incipient ignition event"),
        (r'\b(pressure surge|pipe burst|hose detached|gasket blowout|flange release)\b', "Pressurized fluid/gas release from joint or hose"),
        (r'\b(lost balance|slipped on|tripped on|almost fell)\b', "Slip, trip, or loss of balance near elevation edge"),
        (r'\b(load swung|sling slipped|cable snapped|uncontrolled movement)\b', "Uncontrolled load swing or rigging displacement"),
    ]
    for pattern, label in event_patterns:
        if re.search(pattern, lower_text):
            extracted["event"] = label
            break

    # 6. Safety Controls / PPE
    control_patterns = [
        (r'\b(harness|safety belt|lanyard|fall arrester|lifeline)\b', "Fall arrest system / Full body harness"),
        (r'\b(loto|lockout|tagout|energy isolation|breaker lock)\b', "Lock-Out / Tag-Out (LOTO) Energy Isolation"),
        (r'\b(permit to work|ptw|hot work permit|confined space permit)\b', "Permit-To-Work (PTW) System"),
        (r'\b(barricade|warning sign|exclusion zone|caution tape|safety net)\b', "Physical Barricades & Exclusion Zone Controls"),
        (r'\b(machine guard|interlock|safety shield|emergency stop)\b', "Machine Safeguards & Emergency Interlocks"),
        (r'\b(gas detector|multi-gas monitor|flame detector)\b', "Atmospheric Gas Monitoring Device"),
    ]
    for pattern, label in control_patterns:
        if re.search(pattern, lower_text):
            extracted["safety_control"] = label
            break

    return extracted
