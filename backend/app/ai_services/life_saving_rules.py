import re
from typing import Dict, Any, Optional, List

# Standard IOGP / OSHA Life-Saving Rules mapping
LSR_DEFINITIONS = {
    "ENERGY_ISOLATION": {
        "code": "LSR-01",
        "name": "Energy Isolation (LOTO)",
        "tagline": "Verify isolation and zero energy before starting work",
        "keywords": [r'\bloto\b', r'\blockout\b', r'\btagout\b', r'\bisolat\w+', r'\bzero energy\b', r'\bpressur\w+', r'\bde-energiz\w+', r'\belectrical panel\b', r'\bbreaker\b'],
        "mandatory_controls": [
            "Physical lock and tag applied at isolation point",
            "Zero energy verification (try-step / voltage test / pressure bleed)",
            "Authorized isolation certificate in place"
        ],
        "category": "High-Energy Control"
    },
    "WORK_AT_HEIGHT": {
        "code": "LSR-02",
        "name": "Work at Height",
        "tagline": "Protect yourself against a fall when working at height",
        "keywords": [r'\bheight\b', r'\bscaffold\w*', r'\bladder\b', r'\bharness\b', r'\blanyard\b', r'\bfall arrest\b', r'\bguardrail\b', r'\bgrating\b', r'\broof\b', r'\bedge\b', r'\bmanlift\b'],
        "mandatory_controls": [
            "100% tie-off using approved double lanyard harness above 1.8m",
            "Inspected and certified scaffolding with green tag",
            "Toe-boards and mid-rails secured on all working decks"
        ],
        "category": "Fall Protection"
    },
    "SAFE_MECHANICAL_LIFTING": {
        "code": "LSR-03",
        "name": "Safe Mechanical Lifting",
        "tagline": "Plan lifting operations and control the lift zone",
        "keywords": [r'\bcrane\b', r'\blift\w+', r'\brigg\w+', r'\bsling\b', r'\bshackle\b', r'\bsuspended load\b', r'\bhoist\b', r'\btagline\b', r'\boverhead\b'],
        "mandatory_controls": [
            "Exclusion zone established beneath suspended load path",
            "Certified lifting gear with valid color code inspection",
            "Competent rigger and designated banksman directing the lift"
        ],
        "category": "Gravity & Kinetic Hazard"
    },
    "LINE_OF_FIRE": {
        "code": "LSR-04",
        "name": "Line of Fire",
        "tagline": "Keep yourself and others out of the line of fire",
        "keywords": [r'\bline of fire\b', r'\bpound\w*', r'\bstruck by\b', r'\bpinch point\b', r'\bdropped object\b', r'\bstored energy\b', r'\bpressurized hose\b', r'\bwhipping\b', r'\btension\b'],
        "mandatory_controls": [
            "Barricades and clear warning signs around dynamic zones",
            "Body positioning clear of potential projectile or recoil paths",
            "Tool tethering and secondary retention nets in overhead works"
        ],
        "category": "Mechanical Energy"
    },
    "CONFINED_SPACE": {
        "code": "LSR-05",
        "name": "Confined Space Entry",
        "tagline": "Obtain authorization before entering a confined space",
        "keywords": [r'\bconfined space\b', r'\btank entry\b', r'\bvessel\b', r'\bmanhole\b', r'\bh2s\b', r'\btoxic gas\b', r'\boxygen\b', r'\bgas test\b', r'\bbreathing apparatus\b'],
        "mandatory_controls": [
            "Continuous atmospheric gas monitoring calibrated for multi-gas",
            "Dedicated hole-watch standby personnel outside entry",
            "Emergency rescue plan and extraction tripod stationed"
        ],
        "category": "Atmospheric Hazard"
    },
    "BYPASS_SAFETY_CONTROLS": {
        "code": "LSR-06",
        "name": "Bypassing Safety Controls",
        "tagline": "Obtain authorization before overriding or disabling safety controls",
        "keywords": [r'\bbypass\w*', r'\boverrid\w*', r'\bbridg\w*', r'\bdefeat\w*', r'\binterlock\b', r'\bsafety guard\b', r'\besd\b', r'\balarm defeat\b', r'\bdisconnected\b', r'\btamper\w*'],
        "mandatory_controls": [
            "Formal management of change (MOC) and bypass permit signed",
            "Compensatory controls manned continuously",
            "Clear physical signage at bypassed instrumentation"
        ],
        "category": "Engineering Defenses"
    },
    "HOT_WORK": {
        "code": "LSR-07",
        "name": "Hot Work & Fire Prevention",
        "tagline": "Control flammables and ignition sources in hazardous zones",
        "keywords": [r'\bhot work\b', r'\bwelding\b', r'\bgrinding\b', r'\bsparks\b', r'\bflammable\b', r'\bcombustible\b', r'\btorch\b', r'\bfire watch\b'],
        "mandatory_controls": [
            "Fire watch posted with charged fire extinguisher for 30 min post-work",
            "Hydrocarbon gas testing completed within 15m radius",
            "Fire-retardant habitat / containment blankets installed"
        ],
        "category": "Thermal Energy"
    },
    "MOBILE_EQUIPMENT": {
        "code": "LSR-08",
        "name": "Driving & Mobile Equipment",
        "tagline": "Follow road safety rules and maintain pedestrian segregation",
        "keywords": [r'\bforklift\b', r'\bvehicle\b', r'\btruck\b', r'\bwheel loader\b', r'\bpedestrian\b', r'\bblind spot\b', r'\breversing\b', r'\bspeed\w*'],
        "mandatory_controls": [
            "Physical pedestrian walkways separated with bollards/barriers",
            "Seatbelt fastened, beacon lamp and reverse alarm operational",
            "Designated marshaller during reversing in confined yard areas"
        ],
        "category": "Kinetic Energy"
    }
}

def map_life_saving_rules(text: str) -> Optional[Dict[str, Any]]:
    """
    Evaluates free-text safety report against standard industrial Life-Saving Rules.
    Returns matched rule details, compliance status, and mandatory controls.
    """
    lower_text = text.lower()
    
    for rule_key, rule_meta in LSR_DEFINITIONS.items():
        for pattern in rule_meta["keywords"]:
            if re.search(pattern, lower_text):
                # Detect compliance or violation indicators
                violation = bool(re.search(r'\b(not used|without|unclipped|unsecured|bypassed|failed|defective|missing|did not|no permit|ignored|unauthorized|loose|struck)\b', lower_text))
                
                return {
                    "rule_key": rule_key,
                    "rule_code": rule_meta["code"],
                    "rule_name": rule_meta["name"],
                    "tagline": rule_meta["tagline"],
                    "category": rule_meta["category"],
                    "status": "COMPROMISED / VIOLATION DETECTED" if violation else "RELEVANT / VERIFICATION REQUIRED",
                    "severity": "CRITICAL" if violation else "MONITORED",
                    "mandatory_controls": rule_meta["mandatory_controls"]
                }
                
    return None
