"""
Safety Information Extraction Module
------------------------------------
Extracts structured industrial safety entities from report narratives using:
- Precise safety domain regular expressions
- RapidFuzz for robust spelling and variation matching
- Deterministic parsing for measurements (voltage, pressure, height, load)
- Explicit NULL / Unknown / Insufficient Information handling when evidence is absent
"""

import re
from typing import Dict, Any, Optional

try:
    from rapidfuzz import fuzz, process
    RAPIDFUZZ_AVAILABLE = True
except ImportError:
    RAPIDFUZZ_AVAILABLE = False


# Canonical equipment catalog for fuzzy matching
CANONICAL_EQUIPMENT = [
    "blowout preventer (BOP)", "mud pump", "drilling rig", "derrick", "top drive",
    "rotary table", "drawworks", "shale shaker", "degasser", "choke manifold",
    "wireline unit", "crane", "overhead hoist", "winch", "rigging sling",
    "shackle", "forklift", "mobile crane", "excavator", "air compressor",
    "centrifugal pump", "pressure vessel", "separator", "heat exchanger",
    "storage tank", "chemical injection skid", "transformer", "switchgear",
    "electrical panel", "circuit breaker", "scaffolding", "extension ladder",
    "catwalk", "flare stack", "pig launcher", "wellhead", "christmas tree"
]

# Canonical activity catalog for fuzzy matching
CANONICAL_ACTIVITIES = [
    "drilling operation", "tripping pipe", "casing installation", "cementing",
    "well logging", "wireline service", "workover operation", "well intervention",
    "hydrotesting", "pressure testing", "line breaking", "flange tightening",
    "hot work (welding/cutting)", "grinding operation", "confined space entry",
    "vessel internal cleaning", "scaffolding erection/dismantling", "work at height",
    "rigging and lifting", "heavy vehicle movement", "forklift transit",
    "electrical isolation (LOTO)", "breaker servicing", "chemical transfer"
]


def extract_measurements(text: str) -> Dict[str, Optional[str]]:
    """
    Extracts physical measurement parameters such as voltage, pressure,
    elevation/height, and load/weight if present in text.
    """
    measurements: Dict[str, Optional[str]] = {
        "voltage": None,
        "pressure": None,
        "elevation": None,
        "load_weight": None,
    }

    # Voltage: 11kV, 415V, 33 kV, 230 volts
    v_match = re.search(r'\b(\d+(?:\.\d+)?\s*(?:kv|v|volts?|kilovolts?))\b', text, re.IGNORECASE)
    if v_match:
        measurements["voltage"] = v_match.group(1)

    # Pressure: 1500 psi, 50 bar, 2.5 MPa, 100 kPa
    p_match = re.search(r'\b(\d+(?:\.\d+)?\s*(?:psi|bar|kpa|mpa|kg/cm2))\b', text, re.IGNORECASE)
    if p_match:
        measurements["pressure"] = p_match.group(1)

    # Elevation / Height: 10 meters, 6m, 15 feet, 20 ft
    h_match = re.search(r'\b(\d+(?:\.\d+)?\s*(?:meters?|metres?|ft|feet|m)\b(?!\w))', text, re.IGNORECASE)
    if h_match:
        measurements["elevation"] = h_match.group(1)

    # Load / Weight: 5 tons, 500 kg, 10 metric tons
    l_match = re.search(r'\b(\d+(?:\.\d+)?\s*(?:tons?|tonnes?|kg|kilograms?|lbs?|pounds?))\b', text, re.IGNORECASE)
    if l_match:
        measurements["load_weight"] = l_match.group(1)

    return measurements


def extract_safety_information(text: str, report_type: str = "NEAR_MISS") -> Dict[str, Any]:
    """
    Extracts comprehensive safety entities from report narrative.
    Strictly avoids hallucination: returns None or Insufficient Information when evidence is missing.
    """
    if not text or not isinstance(text, str):
        return {
            "unit": None,
            "location": None,
            "equipment": None,
            "activity": None,
            "hazard": None,
            "action": None,
            "condition": None,
            "event": None,
            "ppe": None,
            "permit": None,
            "isolation": None,
            "safety_control": None,
            "measurements": {"voltage": None, "pressure": None, "elevation": None, "load_weight": None}
        }

    lower_text = text.lower()
    measurements = extract_measurements(text)

    # 1. Unit & Location extraction
    location = None
    unit_match = re.search(r'\b(unit\s*[1-4]|rig[- ]\d+|well[- ]\w+|drilling\s+pad\s*\w*|compressor\s+station\s*\w*|tank\s+farm)\b', lower_text)
    if unit_match:
        location = unit_match.group(1).title()
    else:
        area_match = re.search(r'\b(?:at|near|in|around|by|on)\s+(?:the\s+)?(front\s+door|main\s+entrance|entrance|walkway|corridor|staircase|stairway|stairs|workshop|warehouse|loading\s+dock|substation|drill\s+floor|drill\s+deck|catwalk|compressor|switchgear\s+room|office)\b', lower_text)
        if area_match:
            location = area_match.group(1).title()
        else:
            direct_match = re.search(r'\b(front\s+door|main\s+entrance|emergency\s+exit|fire\s+exit)\b', lower_text)
            if direct_match:
                location = direct_match.group(1).title()
            else:
                location = "Unknown"
    unit = location if location != "Unknown" else None

    # 2. Equipment extraction (Regex + RapidFuzz)
    equipment = None
    equip_patterns = [
        (r'\b(blowout preventer|bop|annular|ram)\b', "Blowout Preventer (BOP) System"),
        (r'\b(mud pump|slush pump|liner|piston)\b', "High-Pressure Mud Pump"),
        (r'\b(crane|overhead crane|mobile crane|boom|hoist|winch|derrick)\b', "Crane / Hoisting Equipment"),
        (r'\b(forklift|loader|trailer|dump truck|flatbed|pickup|vehicle)\b', "Mobile Industrial Vehicle"),
        (r'\b(scaffold|ladder|catwalk|grating|work platform)\b', "Access Infrastructure / Scaffolding"),
        (r'\b(electrical panel|switchboard|transformer|switchgear|breaker|cable tray)\b', "Electrical Power Distribution System"),
        (r'\b(pipeline|flange|manifold|choke|valve|pressure vessel|tank|pipe)\b', "Pressurized Piping / Manifold Asset"),
        (r'\b(grinder|power tool|lathe|rotating shaft|conveyor|drill string)\b', "Rotating Machinery / Mechanical Tool"),
        (r'\b(chemical drum|acid tote|solvent tank|storage container)\b', "Chemical Storage Container / Vessel"),
    ]
    for pat, label in equip_patterns:
        if re.search(pat, lower_text):
            equipment = label
            break

    # If regex missed, try RapidFuzz against canonical equipment list
    if not equipment and RAPIDFUZZ_AVAILABLE:
        for word in lower_text.split():
            if len(word) >= 5:
                match = process.extractOne(word, CANONICAL_EQUIPMENT, scorer=fuzz.ratio, score_cutoff=82)
                if match:
                    equipment = match[0].title()
                    break

    # 3. Activity extraction
    activity = None
    act_patterns = [
        (r'\b(drilling|tripping|making up pipe|casing|cementing)\b', "Well Drilling & Casing Operations"),
        (r'\b(hot work|welding|grinding|gas cutting|torch)\b', "Hot Work / Welding & Cutting"),
        (r'\b(scaffolding|work at height|roof work|ladder inspection|elevation work)\b', "Work at Height / Scaffolding"),
        (r'\b(lifting|rigging|crane hoist|load movement|slinging)\b', "Rigging & Mechanical Lifting"),
        (r'\b(confined space|tank entry|vessel cleaning|pit entry)\b', "Confined Space Entry & Maintenance"),
        (r'\b(electrical work|cable pull|breaker racking|substation maintenance)\b', "Electrical Maintenance Operations"),
        (r'\b(pressure test|hydrotest|flange bolt|line break)\b', "Pressurized System Testing & Line Breaking"),
        (r'\b(excavation|trenching|earthmoving|digging)\b', "Excavation & Trenching Operations"),
        (r'\b(driving|forklift operation|truck transit|reversing)\b', "Vehicle Movement & Material Transit"),
        (r'\b(chemical handling|acid transfer|sampling|chemical dosing)\b', "Chemical Handling & Fluid Transfer"),
    ]
    for pat, label in act_patterns:
        if re.search(pat, lower_text):
            activity = label
            break

    if not activity and RAPIDFUZZ_AVAILABLE:
        for phrase in [lower_text[i:i+30] for i in range(0, len(lower_text), 20)]:
            match = process.extractOne(phrase, CANONICAL_ACTIVITIES, scorer=fuzz.partial_ratio, score_cutoff=85)
            if match:
                activity = match[0].title()
                break

    # 4. Action (Unsafe Act)
    action = None
    action_patterns = [
        (r'\b(without_wearing|without_ppe|without_helmet|without_harness|not_wearing)\b', "Operating without required personal protective equipment (PPE)"),
        (r'\b(without_permit|no_permit|unauthorized_action|no ptw)\b', "Performing safety-critical activity without authorized Permit-to-Work (PTW)"),
        (r'\b(without_isolation|not_locked_out|working without loto)\b', "Working on hazardous equipment without positive LOTO energy isolation"),
        (r'\b(standing under|beneath suspended load|walked under load)\b', "Entering line-of-fire beneath suspended dynamic load"),
        (r'\b(speeding|using mobile|reckless driving|distracted)\b', "Operating industrial vehicle in violation of safe transit protocols"),
        (r'\b(climbing without tie-off|overreaching|leaning over edge)\b', "Working at height without 100% positive tie-off anchorage"),
    ]
    for pat, label in action_patterns:
        if re.search(pat, lower_text):
            action = label
            break

    # 5. Condition (Unsafe Condition)
    condition = None
    cond_patterns = [
        (r'\b(guard_missing|missing guard|removed guard|exposed nip)\b', "Missing or defeated physical machinery safeguard"),
        (r'\b(frayed cable|exposed live conductor|bare wire|sparking)\b', "Damaged electrical insulation / exposed live electrical conductors"),
        (r'\b(open grating|missing handrail|unguarded floor opening|hole in floor)\b', "Unguarded floor opening / missing edge fall protection barrier"),
        (r'\b(oil leak|hydrocarbon spray|gas leak|hissing flange|dripping chemical)\b', "Uncontained fluid/gas leak or line seal degradation"),
        (r'\b(corroded pipe|metal loss|structural crack|fatigued bolt)\b', "Structural degradation / mechanical integrity compromise"),
        (r'\b(slippery|greasy floor|wet deck|spilled mud)\b', "Walking surface contaminated with slippery liquid/mud"),
    ]
    for pat, label in cond_patterns:
        if re.search(pat, lower_text):
            condition = label
            break

    # 6. Event (Near Miss event)
    event = None
    event_patterns = [
        (r'\b(dropped object|tool dropped|nearly hit|object fell|narrowly missed)\b', "Dropped object narrowly missing personnel in area"),
        (r'\b(near collision|almost struck|swerved|brake failure)\b', "Near-miss vehicle or mobile equipment collision"),
        (r'\b(arc flash|spark ignition|flash fire extinguished|small burst)\b', "Electrical arc flash or minor incipient flash ignition"),
        (r'\b(pressure surge|hose whipped|parted hose|gasket blowout)\b', "Pressurized hose parting or joint blowout"),
        (r'\b(lost balance|tripped|slipped|stumbled)\b', "Worker slip, trip, or stumble near edge"),
        (r'\b(load swung|rigging slipped|sling parted)\b', "Uncontrolled suspended load shift or rigging failure"),
    ]
    for pat, label in event_patterns:
        if re.search(pat, lower_text):
            event = label
            break

    # 7. PPE details
    ppe = None
    ppe_patterns = [
        (r'\b(without_harness|no harness|harness)\b', "Safety Harness / Fall Arrest Lanyard"),
        (r'\b(without_helmet|hard hat|helmet)\b', "Safety Helmet / Hard Hat"),
        (r'\b(safety glasses|goggles|face shield)\b', "Eye & Face Protection (Goggles/Shield)"),
        (r'\b(chemical suit|apron|acid gloves|respirator|breathing apparatus|scba)\b', "Specialized Chemical / Respiratory PPE"),
        (r'\b(safety shoes|steel toe boots)\b', "Protective Footwear"),
    ]
    for pat, label in ppe_patterns:
        if re.search(pat, lower_text):
            ppe = label
            break

    # 8. Permit (PTW)
    permit = None
    if re.search(r'\b(without_permit|no_permit|no ptw|without a permit)\b', lower_text):
        permit = "MISSING / NOT OBTAINED (Violation)"
    elif re.search(r'\b(hot work permit|confined space permit|cold work permit|ptw signed|valid permit)\b', lower_text):
        permit = "Permit-to-Work Verified"

    # 9. Isolation (LOTO)
    isolation = None
    if re.search(r'\b(without_isolation|not_locked_out|without loto|not isolated|not de-energized)\b', lower_text):
        isolation = "MISSING / NOT VERIFIED (Hazardous State)"
    elif re.search(r'\b(loto applied|locked out|tagged out|isolated and verified|zero energy confirmed)\b', lower_text):
        isolation = "Positive LOTO Isolation Applied & Verified"

    # 10. Worker involvement & injury extraction
    worker_involvement = "UNKNOWN"

    if re.search(r'\b(worker|technician|operator|crew|personnel|man|employee|contractor|helper|fitter|welder)\b', lower_text):
        worker_involvement = "Personnel Identified in Operational Zone"

    injury = "None Documented"
    if re.search(r'\b(fracture|amputation|burn|cut|laceration|wound|pain|sprain|bruise|contusion|hurt|bleeding|injured|injury)\b', lower_text):
        m = re.search(r'\b(fracture\w*|amputation\w*|burn\w*|cut\w*|laceration\w*|wound\w*|pain\w*|sprain\w*|bruise\w*|contusion\w*|hurt\w*|bleeding\w*|injur\w*)\b', lower_text)
        injury = m.group(1).title() if m else "Injury Documented"

    return {
        "unit": unit or "UNKNOWN",
        "operating_unit": unit or "UNKNOWN",
        "location": unit or "INSUFFICIENT_INFORMATION",
        "equipment": equipment or "UNKNOWN",
        "activity": activity or "UNKNOWN",
        "action": action or "UNKNOWN",
        "condition": condition or "UNKNOWN",
        "event": event or "UNKNOWN",
        "hazard": None,
        "worker_involvement": worker_involvement,
        "worker_exposure": None,
        "barrier": None,
        "injury": injury,
        "consequence": None,
        "ppe": ppe or "UNKNOWN",
        "permit": permit or "UNKNOWN",
        "isolation": isolation or "UNKNOWN",
        "measurements": measurements
    }

