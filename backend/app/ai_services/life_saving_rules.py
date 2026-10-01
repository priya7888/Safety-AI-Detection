"""
9 IOGP Life-Saving Rules Semantic Matcher & Control Verification Engine.

Combines Regex trigger patterns with Dense Semantic Embeddings (all-MiniLM-L6-v2)
and Cosine Similarity to accurately identify applicable Life-Saving Rules even
when field reports use synonyms, jargon, or non-standard phrasing.
"""
import re
from typing import Dict, Any, Optional, List
import numpy as np

# Standard 9 IOGP / OSHA Life-Saving Rules Catalogue
LSR_DEFINITIONS = {
    "ENERGY_ISOLATION": {
        "code": "LSR-01",
        "name": "Energy Isolation (LOTO)",
        "tagline": "Verify isolation and zero energy before starting work",
        "description": "Isolate all hazardous energy sources (electrical, mechanical, hydraulic, pneumatic, chemical, thermal) and verify zero energy state with physical locks and tags before performing maintenance.",
        "keywords": [r'\bloto\b', r'\blockout\b', r'\btagout\b', r'\bisolat\w+', r'\bzero energy\b', r'\bpressur\w+', r'\bde-energiz\w+', r'\belectrical panel\b', r'\bbreaker\b', r'\blive wire\b'],
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
        "description": "Wear an approved fall arrest harness, maintain 100% tie-off above 1.8m (6ft), inspect scaffolding, and ensure guardrails and floor hole covers are secured.",
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
        "description": "Never walk or stand under a suspended load. Establish exclusion barricades, inspect rigging slings, and verify crane capacity before lifting.",
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
        "description": "Position yourself outside the trajectory of moving equipment, pressurized hoses, swinging loads, recoil paths, and falling objects.",
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
        "description": "Verify atmospheric gas testing (oxygen, toxic H2S, flammable gas), obtain valid confined space permit, station dedicated hole-watch standby, and prepare rescue tripod.",
        "keywords": [r'\bconfined space\b', r'\btank entry\b', r'\bvessel\b', r'\bmanhole\b', r'\bh2s\b', r'\btoxic gas\b', r'\boxygen\b', r'\bgas test\b', r'\bbreathing apparatus\b', r'\bsilo\b'],
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
        "description": "Do not bypass, override, bridge, or defeat critical safety interlocks, emergency shutdown valves (ESD), pressure relief valves, or machine guards without formal authorization.",
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
        "description": "Perform hot work (welding, cutting, grinding, torching) only with a hot work permit, active fire watch with charged extinguisher, and verified gas-free atmosphere.",
        "keywords": [r'\bhot work\b', r'\bwelding\b', r'\bgrinding\b', r'\bsparks\b', r'\bflammable\b', r'\bcombustible\b', r'\btorch\b', r'\bfire watch\b', r'\bbrazing\b'],
        "mandatory_controls": [
            "Fire watch posted with charged fire extinguisher for 30 min post-work",
            "Hydrocarbon gas testing completed within 15m radius",
            "Fire-retardant habitat / containment blankets installed"
        ],
        "category": "Thermal Energy"
    },
    "DRIVING_SAFETY": {
        "code": "LSR-08",
        "name": "Driving & Mobile Equipment",
        "tagline": "Follow road safety rules and maintain pedestrian segregation",
        "description": "Fasten seatbelt, obey speed limits, maintain pedestrian exclusion zones around mobile equipment (forklifts, cranes, trucks), and never use mobile phones while driving.",
        "keywords": [r'\bforklift\b', r'\bvehicle\b', r'\btruck\b', r'\bwheel loader\b', r'\bpedestrian\b', r'\bblind spot\b', r'\breversing\b', r'\bspeed\w*', r'\bdriving\b'],
        "mandatory_controls": [
            "Physical pedestrian walkways separated with bollards/barriers",
            "Seatbelt fastened, beacon lamp and reverse alarm operational",
            "Designated marshaller during reversing in confined yard areas"
        ],
        "category": "Kinetic Energy"
    },
    "WORK_AUTHORIZATION": {
        "code": "LSR-09",
        "name": "Work Authorization (Permit to Work)",
        "tagline": "Work with a valid permit when required",
        "description": "Verify permit to work (PTW) is authorized, risk assessment (JSA/TRA) is conducted, toolbox talk is delivered to all crew members, and work scope boundaries are understood.",
        "keywords": [r'\bpermit to work\b', r'\bptw\b', r'\bwork permit\b', r'\bjsa\b', r'\bjob safety analysis\b', r'\btoolbox talk\b', r'\bwork authorization\b', r'\bunauthorized work\b'],
        "mandatory_controls": [
            "Valid authorized Permit to Work (PTW) signed at worksite",
            "Job Safety Analysis (JSA) reviewed and acknowledged by entire crew",
            "Daily pre-task Toolbox Talk (TBT) documented before work starts"
        ],
        "category": "Administrative Control"
    }
}

# Lazy-loaded transformer model for semantic embeddings
_embedding_model = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception:
            _embedding_model = False
    return _embedding_model if _embedding_model is not False else None


def map_life_saving_rules(text: str) -> Optional[Dict[str, Any]]:
    """
    Evaluates free-text safety report against the 9 standard IOGP Life-Saving Rules.
    Returns matched rule details, compliance status, and mandatory controls.
    """
    lower_text = text.lower()
    
    # Priority 1: Regex Trigger Matching
    for rule_key, rule_meta in LSR_DEFINITIONS.items():
        for pattern in rule_meta["keywords"]:
            if re.search(pattern, lower_text):
                violation = bool(re.search(
                    r'\b(not used|without|unclipped|unsecured|bypassed|failed|defective|missing|did not|no permit|ignored|unauthorized|loose|struck)\b',
                    lower_text
                ))
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
    
    # Priority 2: Dense Semantic Embedding Cosine Similarity (Fallback for novel phrasing)
    model = get_embedding_model()
    if model:
        try:
            report_vec = model.encode(text, normalize_embeddings=True)
            best_sim = -1.0
            best_rule_key = None
            
            for rule_key, rule_meta in LSR_DEFINITIONS.items():
                rule_desc = f"{rule_meta['name']}: {rule_meta['tagline']} {rule_meta['description']}"
                rule_vec = model.encode(rule_desc, normalize_embeddings=True)
                sim = float(np.dot(report_vec, rule_vec))
                if sim > best_sim:
                    best_sim = sim
                    best_rule_key = rule_key
            
            # Semantic threshold for rule triggering
            if best_sim >= 0.42 and best_rule_key:
                rule_meta = LSR_DEFINITIONS[best_rule_key]
                violation = bool(re.search(
                    r'\b(not used|without|unclipped|unsecured|bypassed|failed|defective|missing|did not|no permit|ignored|unauthorized|loose|struck)\b',
                    lower_text
                ))
                return {
                    "rule_key": best_rule_key,
                    "rule_code": rule_meta["code"],
                    "rule_name": rule_meta["name"],
                    "tagline": rule_meta["tagline"],
                    "category": rule_meta["category"],
                    "semantic_similarity": round(best_sim, 3),
                    "status": "COMPROMISED / VIOLATION DETECTED" if violation else "RELEVANT / VERIFICATION REQUIRED",
                    "severity": "CRITICAL" if violation else "MONITORED",
                    "mandatory_controls": rule_meta["mandatory_controls"]
                }
        except Exception:
            pass

    return None
