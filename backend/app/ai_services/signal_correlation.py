import re
from typing import List, Dict, Any, Optional, Set, Tuple
from datetime import datetime, date, timedelta
from collections import defaultdict

# ============================================================================
# 1. HAZARD ROLE & FEATURE DEFINITIONS
# ============================================================================

ROLE_PATTERNS = {
    "GAS_LEAK": re.compile(
        r'\b((?:gas\b.{0,25}\b(?:leak\w*|escap\w*|hiss\w*|smell|odor|vent\w*|cloud|release\w*)|(?:leak\w*|escap\w*|hiss\w*|release\w*).{0,25}\bgas\b)|natural\s+gas|propane|lpg|methane|hydrocarbon\s+(?:gas|vapor)|flammable\s+gas|gas\s+detector|lel)\b',
        re.IGNORECASE
    ),
    "IGNITION_SOURCE": re.compile(
        r'\b(ignition\s*(?:source)?|spark\w*|welding|cutting\s+torch|grinding|hot\s*work|open\s+flame|naked\s+flame|torch|electrical\s+switch|arcing|arc\s+flash|heater|furnace|burners?|combustion)\b',
        re.IGNORECASE
    ),
    "POOR_VENTILATION": re.compile(
        r'\b(poor\s+ventilation|inadequate\s+ventilation|unventilated|confined\s+space|enclosed\s+(?:area|room|space|chamber)|no\s+air\s*flow|stagnant\s+air|low[\s-]lying|trench|under\s+awning|pit|basement|poor\s+airflow|stagnant\s+vapor)\b',
        re.IGNORECASE
    ),
    "OIL_FUEL_LEAK": re.compile(
        r'\b((?:(?:oil|fuel|diesel|hydraulic|lubricant|lube|solvent)\b.{0,25}\b(?:leak\w*|seep\w*|spill\w*|puddle|drip\w*|spray\w*)|(?:leak\w*|seep\w*|spill\w*|drip\w*).{0,25}\b(?:oil|fuel|diesel|hydraulic|lubricant|lube|solvent)\b)|flammable\s+liquid)\b',
        re.IGNORECASE
    ),
    "HOT_SURFACE": re.compile(
        r'\b(hot\s+surface|exhaust\s*(?:manifold)?|steam\s+pipe|boiler|operating\s+heater|turbocharger|radiator|hot\s+engine|uninsulated\s+pipe|high\s+surface\s+temp)\b',
        re.IGNORECASE
    ),
    "ELECTRICAL_FAULT": re.compile(
        r'\b(electrical\s+fault|short\s+circuit|sparking\s+(?:wire|cable)|loose\s+(?:connection|cable|lug|terminal)|overheated\s+cable|damaged\s+insulation|breaker\s+tripping|arcing\s+terminal|switchboard\s+spark|motor\s+fault|electrical\s+malfunction|insulation\s+breakdown)\b',
        re.IGNORECASE
    ),
    "FLAMMABLE_MATERIAL": re.compile(
        r'\b(flammable\s+material|combustible|solvent\s+drum|paint\s+can|wooden\s+pallet|cardboard|paper\s+waste|oily\s+rag|cleaning\s+solvent|chemical\s+thinner)\b',
        re.IGNORECASE
    ),
    "CHEMICAL_LEAK": re.compile(
        r'\b(chemical\s+(?:leak\w*|spill\w*|drip\w*|fumes?)|acid\s+(?:spill\w*|leak\w*|drip\w*|line)|caustic|toxic\s+(?:chemical|vapor|gas)|chlorine|ammonia|h2s|hydrogen\s+sulfide|benzene|hazardous\s+liquid|corrosive)\b',
        re.IGNORECASE
    ),
    "HUMAN_EXPOSURE": re.compile(
        r'\b(human\s+exposure|workers?\s+(?:present|nearby|walking|in\s+area)|personnel\s+(?:exposed|present|in\s+area|nearby)|operator\s+nearby|technicians?\s+(?:working|in\s+proximity)|without\s+ppe|no\s+respirator|line[\s-]of[\s-]fire|pedestrians?|roughnecks?|in\s+proximity)\b',
        re.IGNORECASE
    ),
    "PRESSURE_INCREASE": re.compile(
        r'\b(pressure\s+(?:increase|rise|rising|spike|surge|surging|anomalous)|overpressure|exceeded\s+setpoint|high\s+pressure|abnormal\s+pressure|gauge\s+rising|relief\s+valve\s+lift|\d+\s*bar)\b',
        re.IGNORECASE
    ),
    "EQUIPMENT_WEAKNESS": re.compile(
        r'\b(equipment\s+weakness|worn\s+gasket|thinned\s+pipe|fatigued\s+bolt|cracked\s+(?:casing|flange|weld)|degraded\s+seal|seal\s+weeping|seal\s+weep|loosened\s+flange|structural\s+degradation|compromised\s+joint|vibration|pulsation)\b',
        re.IGNORECASE
    ),
    "CORROSION": re.compile(
        r'\b(corrosion|corroded|severe\s+rust|metal\s+loss|pitting|wall\s+thinning|oxidation|pipe\s+corrosion|flange\s+corrosion)\b',
        re.IGNORECASE
    ),
    "HIGH_PRESSURE": re.compile(
        r'\b(high\s+pressure|pressurized\s+(?:line|pipeline|pipe|vessel|system|manifold|cylinder)|\d+\s*bar|high\s+psi)\b',
        re.IGNORECASE
    ),
    "BLOCKED_EXIT": re.compile(
        r'\b((?:emergency\s+exit|exit|escape\s+route|egress|fire\s+door)\b.{0,30}\b(?:blocked|obstructed|locked|padlocked|cluttered|impassable)\b|(?:blocked|obstructed|locked|padlocked|cluttered|impassable)\b.{0,30}\b(?:emergency\s+exit|exit|escape\s+route|egress|fire\s+door)\b)\b',
        re.IGNORECASE
    ),
    "FIRE_OR_SMOKE": re.compile(
        r'\b(fire|smoke|flames?|smoldering|burning|open\s+flame|flash\s+fire|conflagration)\b',
        re.IGNORECASE
    ),
    "DAMAGED_GUARD": re.compile(
        r'\b(damaged\s+(?:machine\s+)?guard|missing\s+guard|guard\s+removed|interlock\s+bypassed|nip\s+point\s+exposed|conveyor\s+guard\s+off|unprotected\s+rotating|safety\s+interlock\s+defeated|unguarded\s+machine)\b',
        re.IGNORECASE
    ),
    "MOVING_MACHINERY": re.compile(
        r'\b(moving\s+machinery|rotating\s+(?:equipment|shaft|parts?)|conveyor\s+belt|pump\s+shaft|compressor\s+rotor|motor\s+coupling|drill\s+string|spindle|crusher|spinning\s+drum)\b',
        re.IGNORECASE
    ),
    "VIBRATION": re.compile(
        r'\b(vibration|micro[\s-]vibration|pulsation|cyclic\s+thermal|chattering|resonant\s+vibration|shaking\s+pipe)\b',
        re.IGNORECASE
    ),
    "SEAL_WEEPING": re.compile(
        r'\b(seal\s+weeping|acoustic\s+weep|ultrasonic\s+(?:weep|leak)|flange\s+weeping|micro[\s-]seepage|gasket\s+weep|gasket\s+seepage)\b',
        re.IGNORECASE
    )
}

# ============================================================================
# 2. HAZARD INTERACTION RULES KNOWLEDGE BASE
# ============================================================================

INTERACTION_RULES = [
    # 1. Gas Leak + Ignition Source -> Fire/Explosion
    {
        "id": "RULE_GAS_IGNITION",
        "name": "Gas Leak + Ignition Source",
        "primary_roles": {"GAS_LEAK", "IGNITION_SOURCE"},
        "potential_consequence": "Fire/Explosion",
        "combined_risk": "CRITICAL",
        "base_score": 95,
        "category": "Gas Containment & Fire Explosion Prevention",
        "reason": (
            "A flammable gas release directly co-located with an active or potential ignition source "
            "satisfies the combustion triangle. Escaped hydrocarbon vapor mixed with ambient oxygen creates "
            "an immediate risk of flash fire, atmospheric vapor ignition, or catastrophic vapor cloud explosion (VCE)."
        ),
        "recommended_action": (
            "Immediately shut down all hot work and ignition sources, trip Emergency Shutdown (ESD) valves to isolate "
            "the gas supply, evacuate non-essential personnel, and verify 0% LEL with continuous atmospheric gas monitors."
        ),
        "expansion": {
            "role": "POOR_VENTILATION",
            "expanded_name": "Gas Leak + Poor Ventilation + Ignition Source",
            "expanded_consequence": "Gas Accumulation leading to Catastrophic Explosion",
            "expanded_risk": "CRITICAL",
            "expanded_score": 99,
            "expanded_reason": (
                "Gas leak trapped within an unventilated or confined area allows flammable concentration to rapidly accumulate "
                "within the explosive envelope (LEL to UEL). The presence of an ignition source provides the activation energy "
                "for a catastrophic confined vapor cloud explosion with extreme blast overpressure."
            )
        }
    },
    # 2. Gas Leak + Poor Ventilation -> Gas Accumulation / Explosion Potential
    {
        "id": "RULE_GAS_VENTILATION",
        "name": "Gas Leak + Poor Ventilation",
        "primary_roles": {"GAS_LEAK", "POOR_VENTILATION"},
        "potential_consequence": "Gas Accumulation / Explosion Potential",
        "combined_risk": "HIGH",
        "base_score": 91,
        "category": "Gas Containment & Atmospheric Control",
        "reason": (
            "Escaping flammable gas within an enclosed, unventilated, or low-lying area prevents natural convective dilution. "
            "The gas steadily accumulates past the Lower Explosive Limit (LEL), transforming the entire enclosure into an explosive volume."
        ),
        "recommended_action": (
            "Isolate the gas source, deploy portable explosion-proof ventilation fans to clear the space, and prohibit entry "
            "until multi-gas testing confirms clean atmosphere (<5% LEL and >19.5% O2)."
        ),
        "expansion": None
    },
    # 3. Oil/Fuel Leak + Hot Surface -> Fire
    {
        "id": "RULE_OIL_HOT_SURFACE",
        "name": "Oil/Fuel Leak + Hot Surface",
        "primary_roles": {"OIL_FUEL_LEAK", "HOT_SURFACE"},
        "potential_consequence": "Thermal Ignition & Surface / Pool Fire",
        "combined_risk": "HIGH",
        "base_score": 90,
        "category": "Hot Work & Fire Prevention",
        "reason": (
            "Leaking combustible fuel or pressurized hydraulic oil dripping onto an uninsulated hot surface exceeding the fluid's "
            "auto-ignition temperature causes immediate thermal vaporization and open flame flashover."
        ),
        "recommended_action": (
            "Depressurize and isolate the leaking oil line, install temporary spray deflectors and permanent thermal insulation "
            "on hot manifolds, and position dry chemical fire extinguishing media."
        ),
        "expansion": None
    },
    # 4. Electrical Fault + Flammable Material -> Fire/Explosion
    {
        "id": "RULE_ELECTRICAL_FLAMMABLE",
        "name": "Electrical Fault + Flammable Material",
        "primary_roles": {"ELECTRICAL_FAULT", "FLAMMABLE_MATERIAL"},
        "potential_consequence": "Electrical Fire & Rapid Flame Spread",
        "combined_risk": "HIGH",
        "base_score": 91,
        "category": "Electrical Fire Safety & Prevention",
        "reason": (
            "Electrical arcing, terminal lug overheating, or short-circuit sparks in direct proximity to combustible rags, open "
            "solvent drums, or waste materials ignite an immediate localized fire that rapidly spreads to surrounding plant assets."
        ),
        "recommended_action": (
            "De-energize electrical circuit under Lockout/Tagout (LOTO), clear all flammable and combustible stores beyond a 10m "
            "exclusion radius, and re-torque electrical connections with a calibrated torque wrench."
        ),
        "expansion": None
    },
    # 5. Chemical Leak + Human Exposure -> Toxic Exposure
    {
        "id": "RULE_CHEMICAL_HUMAN",
        "name": "Chemical Leak + Human Exposure",
        "primary_roles": {"CHEMICAL_LEAK", "HUMAN_EXPOSURE"},
        "potential_consequence": "Acute Toxic Exposure & Inhalation Injury",
        "combined_risk": "HIGH",
        "base_score": 92,
        "category": "Chemical & Toxic Hazard Management",
        "reason": (
            "Escape of hazardous chemical fluid or toxic vapor in populated operational areas without verified respiratory barriers "
            "causes direct chemical burns, toxic gas inhalation, and potential permanent pulmonary or ocular impairment."
        ),
        "recommended_action": (
            "Evacuate personnel immediately upwind, cordon off an exclusion zone, mandate Level B chemical PPE with supplied-air respirators, "
            "and deploy neutralizing absorbent."
        ),
        "expansion": None
    },
    # 6. Pressure Increase + Equipment Weakness -> Rupture/Failure
    {
        "id": "RULE_PRESSURE_WEAKNESS",
        "name": "Pressure Increase + Equipment Weakness",
        "primary_roles": {"PRESSURE_INCREASE", "EQUIPMENT_WEAKNESS"},
        "potential_consequence": "Pressure Vessel / Pipe Rupture",
        "combined_risk": "CRITICAL",
        "base_score": 96,
        "category": "Pressurized Systems Integrity",
        "reason": (
            "Operational pressure spikes or surging working fluid acting against mechanically weakened flanges, fatigued fasteners, or "
            "degraded gaskets exceed residual structural burst margins, triggering catastrophic line rupture and flying metal shrapnel."
        ),
        "recommended_action": (
            "Reduce process pressure to safe operating envelope, test and calibrate Pressure Safety Valves (PSVs), and conduct "
            "ultrasonic wall thickness and bolt torque verification across the affected segment."
        ),
        "expansion": None
    },
    # 7. Corrosion + High Pressure -> Equipment Failure / Rupture
    {
        "id": "RULE_CORROSION_PRESSURE",
        "name": "Corrosion + High Pressure",
        "primary_roles": {"CORROSION", "HIGH_PRESSURE"},
        "potential_consequence": "Catastrophic Equipment Rupture / Pressurized Blowout",
        "combined_risk": "CRITICAL",
        "base_score": 95,
        "category": "Pressurized Systems Integrity",
        "reason": (
            "Severe localized corrosion wall-thinning diminishes hoop-stress resistance in high-pressure lines. The high internal energy "
            "causes sudden ductile tear or pinhole rupture, leading to explosive decompression."
        ),
        "recommended_action": (
            "Derate system pressure, execute phased-array ultrasonic thickness inspection (UT), and install an engineered metallic repair "
            "sleeve or replace the degraded pipe spool."
        ),
        "expansion": None
    },
    # 8. Blocked Emergency Exit + Fire -> Severe Evacuation Risk
    {
        "id": "RULE_BLOCKED_EXIT_FIRE",
        "name": "Blocked Emergency Exit + Fire",
        "primary_roles": {"BLOCKED_EXIT", "FIRE_OR_SMOKE"},
        "potential_consequence": "Severe Evacuation Trap / Life Safety Threat",
        "combined_risk": "CRITICAL",
        "base_score": 98,
        "category": "Emergency Preparedness & Life Safety",
        "reason": (
            "A fire or smoke outbreak occurring while emergency exits, escape doors, or evacuation routes are obstructed or locked creates a "
            "deadly human trap, multiplying smoke inhalation casualties and preventing safe egress."
        ),
        "recommended_action": (
            "Instantly clear obstructions from all emergency exits, unlock escape hardware, activate facility evacuation alarm, and verify "
            "redundant secondary egress routes are completely unimpeded."
        ),
        "expansion": None
    },
    # 9. Damaged Machine Guard + Moving Machinery -> Serious Injury
    {
        "id": "RULE_GUARD_MACHINERY",
        "name": "Damaged Machine Guard + Moving Machinery",
        "primary_roles": {"DAMAGED_GUARD", "MOVING_MACHINERY"},
        "potential_consequence": "Severe Entanglement / Amputation / Serious Injury",
        "combined_risk": "HIGH",
        "base_score": 90,
        "category": "Mechanical Safety & Machine Guarding",
        "reason": (
            "Operating high-speed rotating equipment or moving conveyors with defeated interlocks or missing physical guards exposes worker "
            "clothing and limbs directly to lethal in-running nip points and entanglement zones."
        ),
        "recommended_action": (
            "Initiate emergency stop, perform Lockout/Tagout (LOTO) on machinery drive, replace damaged physical mesh guards, and test safety "
            "interlock cutoff switches before restarting operations."
        ),
        "expansion": None
    },
    # 10. Piping Vibration + Seal Weeping -> Joint Blowout (Seed Benchmark)
    {
        "id": "RULE_VIBRATION_WEEPING",
        "name": "Piping Micro-Vibration + Flange Seal Weepage",
        "primary_roles": {"VIBRATION", "SEAL_WEEPING"},
        "potential_consequence": "Catastrophic Flange Blowout & Hydrocarbon Release",
        "combined_risk": "HIGH",
        "base_score": 93,
        "category": "Pressurized Hydrocarbons & Gas Containment",
        "reason": (
            "Continuous micro-vibration induces cyclic mechanical bolt relaxation and fastener fatigue. Combined with seal weepage, the "
            "accelerated gasket degradation leads to sudden catastrophic gasket blowout on Joint B-12."
        ),
        "recommended_action": (
            "Install vibration dampening pipe supports, depressurize line, and replace gasket with spiral-wound metallic seal torqued to spec."
        ),
        "expansion": None
    }
]

# ============================================================================
# 3. FEATURE EXTRACTION & NORMALIZATION
# ============================================================================

def normalize_location(loc: Optional[str]) -> str:
    """Normalizes location strings to support robust spatial matching (e.g., 'Unit 1', 'Unit 01', 'unit-1' -> 'unit-1')."""
    if not loc:
        return "general-facility"
    s = str(loc).strip().lower()
    m = re.search(r'unit\s*[-_#]?\s*0*(\d+)', s, re.IGNORECASE)
    if m:
        return f"unit-{int(m.group(1))}"
    s = re.sub(r'[-_]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()

def extract_equipment_tag(text: str) -> Optional[str]:
    """Extracts explicit equipment/component tags like 'Joint B-12', 'Pipeline A-101', 'Pump P-202'."""
    m = re.search(r'\b(joint\s+[a-zA-Z0-9-]+|pipeline\s+[a-zA-Z0-9-]+|switchgear\s+[a-zA-Z0-9-]+|pump\s+[a-zA-Z0-9-]+|compressor\s+[a-zA-Z0-9-]+|panel\s+[a-zA-Z0-9-]+|tank\s+[a-zA-Z0-9-]+)\b', text, re.IGNORECASE)
    if m:
        return re.sub(r'\s+', ' ', m.group(0)).strip().title()
    return None

def extract_report_features(report: Dict[str, Any]) -> Dict[str, Any]:
    """Extracts semantic safety roles, equipment tags, location keys, and date from an observation report."""
    desc = report.get("description") or report.get("report_text") or ""
    add_ctx = report.get("additional_context") or ""
    full_text = f"{desc} {add_ctx}".strip()
    
    # Identify hazard roles
    detected_roles: Set[str] = set()
    for role_name, pattern in ROLE_PATTERNS.items():
        if pattern.search(full_text):
            detected_roles.add(role_name)
    
    # If explicit identified_hazard exists in report, cross-match
    hazard_str = (report.get("identified_hazard") or "").lower()
    for role_name, pattern in ROLE_PATTERNS.items():
        if pattern.search(hazard_str):
            detected_roles.add(role_name)

    loc_raw = report.get("location") or report.get("site") or "Unit 1"
    norm_loc = normalize_location(loc_raw)
    equip = extract_equipment_tag(full_text)

    # Date parsing
    date_val = report.get("report_date") or report.get("date") or str(date.today())
    
    # Severity
    sev = (report.get("observed_severity") or report.get("risk_level") or "Moderate").title()
    sif_assessment = report.get("sif_precursor_assessment") or ("YES" if report.get("sif_potential") == "SIF-potential" else "NO")

    return {
        "report_id": report.get("report_reference") or report.get("report_id") or f"REP-{report.get('id', '000')}",
        "raw_text": desc,
        "full_text": full_text,
        "location_raw": loc_raw,
        "location_norm": norm_loc,
        "equipment_tag": equip,
        "roles": detected_roles,
        "date": date_val,
        "severity": sev,
        "sif_assessment": sif_assessment,
        "report_type": report.get("report_type") or "Near Miss"
    }

# ============================================================================
# 4. SPATIAL & TEMPORAL PROXIMITY CHECK
# ============================================================================

def calculate_proximity(feat1: Dict[str, Any], feat2: Dict[str, Any]) -> Tuple[bool, float]:
    """
    Evaluates whether two reports are in reasonable physical and temporal proximity to interact.
    Returns (is_proximity_valid, proximity_weight).
    """
    # 1. Equipment Match: Exact shared equipment overrides broad location differences
    if feat1["equipment_tag"] and feat2["equipment_tag"]:
        if feat1["equipment_tag"].lower() == feat2["equipment_tag"].lower():
            return True, 1.0

    # 2. Location Match
    loc_match = feat1["location_norm"] == feat2["location_norm"]
    
    # Check text mentions (e.g., Report 2 explicitly mentions "near the pipeline in Unit 1")
    if not loc_match:
        if feat1["location_norm"] in feat2["full_text"].lower() or feat2["location_norm"] in feat1["full_text"].lower():
            loc_match = True

    # If neither equipment nor location match, they are in physically disconnected areas!
    if not loc_match:
        return False, 0.0

    # 3. Temporal Proximity (within 30 days)
    try:
        d1 = datetime.strptime(str(feat1["date"])[:10], "%Y-%m-%d").date()
        d2 = datetime.strptime(str(feat2["date"])[:10], "%Y-%m-%d").date()
        days_apart = abs((d1 - d2).days)
        if days_apart > 30:
            # Still valid if same equipment, but lower weight
            if feat1["equipment_tag"] and feat1["equipment_tag"] == feat2["equipment_tag"]:
                return True, 0.7
            return False, 0.0
        time_weight = max(0.6, 1.0 - (days_apart / 60.0))
        return True, time_weight
    except Exception:
        return True, 0.85

# ============================================================================
# 5. CORE CORRELATION ENGINE IMPLEMENTATION
# ============================================================================

def evaluate_report_pair_or_group(reports: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Evaluates a specific pair or group of safety reports (e.g., Report 1: Gas Leak, Report 2: Ignition Source).
    Returns the exact structured response required by the specification:
    {
      "cluster_detected": bool,
      "signals": [...],
      "relationship": str,
      "potential_consequence": str,
      "combined_risk": str,
      "correlation_score": int,
      "reason": str,
      "recommended_action": str
    }
    """
    if not reports or len(reports) < 2:
        return {
            "cluster_detected": False,
            "signals": [],
            "relationship": "Insufficient Reports",
            "potential_consequence": "At least 2 reports required to determine cross-report interaction",
            "combined_risk": "LOW",
            "correlation_score": 0,
            "reason": "Single observation analyzed in isolation. Correlation requires multiple observations.",
            "recommended_action": "Evaluate observation independently."
        }

    features = [extract_report_features(r) for r in reports]

    # Verify spatial proximity across reports
    # (Reports must share location or equipment to physically interact)
    has_spatial_cohesion = True
    base_loc = features[0]["location_norm"]
    for f in features[1:]:
        is_prox, _ = calculate_proximity(features[0], f)
        if not is_prox:
            has_spatial_cohesion = False
            break

    if not has_spatial_cohesion:
        return {
            "cluster_detected": False,
            "signals": [
                {
                    "report_id": f["report_id"],
                    "description": f["raw_text"],
                    "location": f["location_raw"],
                    "detected_roles": list(f["roles"])
                }
                for f in features
            ],
            "relationship": "None (Spatially Disconnected Hazards)",
            "potential_consequence": "No compound escalation detected across separate locations",
            "combined_risk": "LOW",
            "correlation_score": 0,
            "reason": f"Reports are in disconnected facility areas ({', '.join(set(f['location_raw'] for f in features))}) with no shared equipment.",
            "recommended_action": "Treat observations as separate routine safety items."
        }

    # Aggregate all detected roles across the reports
    all_roles: Set[str] = set()
    role_to_reports: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for f in features:
        for role in f["roles"]:
            all_roles.add(role)
            role_to_reports[role].append(f)

    # Evaluate against interaction rules
    best_rule: Optional[Dict[str, Any]] = None
    best_score = 0
    matched_expansion = False

    for rule in INTERACTION_RULES:
        req = rule["primary_roles"]
        if req.issubset(all_roles):
            # Check if expansion matches (e.g., Gas Leak + Ignition Source + POOR_VENTILATION)
            exp = rule.get("expansion")
            score = rule["base_score"]
            is_expanded = False
            
            if exp and exp["role"] in all_roles:
                score = exp["expanded_score"]
                is_expanded = True

            if score > best_score:
                best_score = score
                best_rule = rule
                matched_expansion = is_expanded

    if not best_rule:
        # No physical interaction rule matched (e.g. slip hazard + micro-vibration)
        return {
            "cluster_detected": False,
            "signals": [
                {
                    "report_id": f["report_id"],
                    "description": f["raw_text"],
                    "location": f["location_raw"],
                    "detected_roles": list(f["roles"])
                }
                for f in features
            ],
            "relationship": "None (Independent Hazards Without Interaction)",
            "potential_consequence": "No compound escalation detected",
            "combined_risk": "LOW",
            "correlation_score": 0,
            "reason": "The submitted observations do not share physical hazard interaction, equipment, or co-located energy vectors that would compound into a serious precursor.",
            "recommended_action": "Treat observations as separate routine safety items."
        }

    # Format successful correlation result
    exp = best_rule.get("expansion")
    if matched_expansion and exp:
        rel_name = exp["expanded_name"]
        pot_consequence = exp["expanded_consequence"]
        comb_risk = exp["expanded_risk"]
        reason_text = exp["expanded_reason"]
        final_score = exp["expanded_score"]
    else:
        rel_name = best_rule["name"]
        pot_consequence = best_rule["potential_consequence"]
        comb_risk = best_rule["combined_risk"]
        reason_text = best_rule["reason"]
        final_score = best_rule["base_score"]

    # Compile contributing signals
    contributing_signals = [
        {
            "report_id": f["report_id"],
            "description": f["raw_text"],
            "location": f["location_raw"],
            "assigned_role": list(f["roles"])
        }
        for f in features
    ]

    return {
        "cluster_detected": True,
        "signals": contributing_signals,
        "relationship": rel_name,
        "potential_consequence": pot_consequence,
        "combined_risk": comb_risk,
        "correlation_score": final_score,
        "reason": reason_text,
        "recommended_action": best_rule["recommended_action"]
    }

# ============================================================================
# 6. MULTI-REPORT DATASET CORRELATION FOR PLATFORM DASHBOARDS
# ============================================================================

def build_progression_steps(relationship: str, consequence: str) -> List[Dict[str, str]]:
    """Builds a realistic 5-stage progression timeline based on the relationship and consequence."""
    rel_low = relationship.lower()
    
    if "gas" in rel_low and "ignition" in rel_low and "ventilation" in rel_low:
        return [
            {"step": "1. Gas Leakage", "trend": "Increasing", "status": "Flange or pipeline develops pressurized gas release"},
            {"step": "2. Poor Ventilation", "trend": "Increasing", "status": "Vapor unable to disperse, accumulating in low-lying area"},
            {"step": "3. Gas Accumulation", "trend": "Increasing", "status": "Atmospheric concentration reaches explosive Lower Explosive Limit (LEL)"},
            {"step": "4. Ignition Proximity", "trend": "Increasing", "status": "Hot work or electrical fault provides active ignition source"},
            {"step": "5. Catastrophic Explosion", "trend": "Increasing", "status": "Unconfined or confined vapor explosion (VCE) with extreme overpressure"}
        ]
    elif "gas" in rel_low and "ignition" in rel_low:
        return [
            {"step": "1. Hydrocarbon Release", "trend": "Increasing", "status": "Gas leaking from pressurized pipeline or flange"},
            {"step": "2. Vapor Plume Dispersion", "trend": "Increasing", "status": "Flammable vapor plume travels toward active work zone"},
            {"step": "3. Ignition Proximity", "trend": "Increasing", "status": "Open flame, spark, or arcing contact identified nearby"},
            {"step": "4. Flash Fire Threshold", "trend": "Increasing", "status": "Mixture reaches auto-ignition envelope"},
            {"step": "5. Catastrophic Explosion", "trend": "Increasing", "status": "Immediate flash fire and structural explosion hazard"}
        ]
    elif "hot surface" in rel_low or "oil" in rel_low:
        return [
            {"step": "1. Fluid Loss", "trend": "Increasing", "status": "Combustible oil or fuel leaking from line/fitting"},
            {"step": "2. Thermal Migration", "trend": "Increasing", "status": "Fluid seeps onto uninsulated hot exhaust surface"},
            {"step": "3. Thermal Vaporization", "trend": "Increasing", "status": "Oil vaporizes rapidly at auto-ignition temperature"},
            {"step": "4. Surface Ignition", "trend": "Increasing", "status": "Localized flash fire erupts along pipe trench"},
            {"step": "5. Conflagration", "trend": "Increasing", "status": "Open pool fire spreads toward bulk fuel storage"}
        ]
    elif "electrical" in rel_low or "flammable" in rel_low:
        return [
            {"step": "1. Electrical Fault", "trend": "Increasing", "status": "Terminal overheating, loose lug, or wire micro-arcing"},
            {"step": "2. Thermal Hotspot", "trend": "Increasing", "status": "Insulation charring and ozone odor detected"},
            {"step": "3. Combustible Contact", "trend": "Increasing", "status": "Sparks land on nearby solvent or combustible supplies"},
            {"step": "4. Flashover", "trend": "Increasing", "status": "Rapid flame propagation across workshop floor"},
            {"step": "5. Facility Conflagration", "trend": "Increasing", "status": "Full switchboard and structural conflagration"}
        ]
    elif "exit" in rel_low or "fire" in rel_low:
        return [
            {"step": "1. Egress Obstruction", "trend": "Increasing", "status": "Emergency door or walkway padlocked or cluttered"},
            {"step": "2. Fire Outbreak", "trend": "Increasing", "status": "Smoke or open flame erupts in operational bay"},
            {"step": "3. Evacuation Attempt", "trend": "Increasing", "status": "Personnel attempt emergency exit but find path blocked"},
            {"step": "4. Toxic Inhalation", "trend": "Increasing", "status": "Heavy smoke accumulation creates immediate asphyxiation"},
            {"step": "5. Mass Casualty Risk", "trend": "Increasing", "status": "Critical life-safety emergency with zero primary escape route"}
        ]
    elif "guard" in rel_low or "machinery" in rel_low:
        return [
            {"step": "1. Guard Deficiency", "trend": "Increasing", "status": "Physical mesh barrier damaged or interlock bypassed"},
            {"step": "2. Continuous Rotation", "trend": "Stable", "status": "High-speed machinery operates with exposed nip point"},
            {"step": "3. Operator Proximity", "trend": "Increasing", "status": "Worker conducts manual task within line-of-fire"},
            {"step": "4. Pinch Point Exposure", "trend": "Increasing", "status": "Clothing or limb drawn into rotating mechanism"},
            {"step": "5. Amputation Precursor", "trend": "Increasing", "status": "Catastrophic mechanical crushing and amputation risk"}
        ]
    else:
        return [
            {"step": "1. Latent Deviation", "trend": "Increasing", "status": "Minor operating irregularity or barrier wear logged"},
            {"step": "2. Cumulative Degradation", "trend": "Increasing", "status": "Secondary safeguard or physical barrier compromised"},
            {"step": "3. Hazard Interaction", "trend": "Increasing", "status": "Co-occurring energy vector activates latent vulnerability"},
            {"step": "4. Escalation Proximity", "trend": "Increasing", "status": "Unmitigated cumulative risk approaching trip threshold"},
            {"step": "5. High SIF Precursor", "trend": "Increasing", "status": "Credible high-energy consequence pathway established"}
        ]

def correlate_reports_into_weak_signals(reports: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Scans an arbitrary list of safety reports from an organization and extracts all
    meaningful hazard interaction clusters (supporting 2-signal and 3+ signal combinations).
    """
    if not reports or len(reports) < 2:
        return []

    features = [extract_report_features(r) for r in reports]

    # Cluster reports by location
    loc_groups: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for f in features:
        loc_groups[f["location_norm"]].append(f)

    correlated_results: List[Dict[str, Any]] = []
    seen_report_pairs = set()
    sig_counter = 1

    for loc_key, group in loc_groups.items():
        if len(group) < 2:
            continue

        # 1. Try Group Evaluation (Check if 3+ reports form an expanded multi-signal cluster)
        group_eval = evaluate_report_pair_or_group([r for r in reports if extract_report_features(r)["location_norm"] == loc_key])
        if group_eval["cluster_detected"] and len(group_eval["signals"]) >= 2:
            # Check if this is a distinct multi-signal cluster
            source_reps = [
                {
                    "report_id": s["report_id"],
                    "report_type": next((f["report_type"] for f in group if f["report_id"] == s["report_id"]), "Near Miss"),
                    "date_submitted": next((str(f["date"]) for f in group if f["report_id"] == s["report_id"]), str(date.today())),
                    "short_description": s["description"][:100] + ("..." if len(s["description"]) > 100 else ""),
                    "unit": s["location"],
                    "excerpt": s["description"]
                }
                for s in group_eval["signals"]
            ]

            title = f"{group[0]['location_raw']} {group_eval['relationship']}"
            progression = build_progression_steps(group_eval["relationship"], group_eval["potential_consequence"])

            correlated_results.append({
                "cluster_detected": True,
                "id": sig_counter,
                "signal_id": f"WS-{sig_counter:02d}",
                "title": title,
                "category": group_eval.get("category", "Process Safety & Hazard Interaction"),
                "relationship": group_eval["relationship"],
                "potential_consequence": group_eval["potential_consequence"],
                "potential_sif_precursor": group_eval["potential_consequence"],
                "combined_risk": group_eval["combined_risk"],
                "risk_level": group_eval["combined_risk"].title(),
                "risk_score": group_eval["correlation_score"],
                "correlation_score": group_eval["correlation_score"],
                "reason": group_eval["reason"],
                "why_identified": group_eval["reason"],
                "recommended_action": group_eval["recommended_action"],
                "first_detected_date": source_reps[0]["date_submitted"] if source_reps else str(date.today()),
                "source": f"Multi-Report Interaction ({len(source_reps)} Correlated Records)",
                "connected_signals": [f"{s['report_id']}: {s['description'][:70]}" for s in group_eval["signals"]],
                "progression_steps": progression,
                "source_reports": source_reps,
                "review_status": "Under Review",
                "reviewer_notes": f"Correlated by AI Interaction Engine: {group_eval['relationship']} in {group[0]['location_raw']}.",
                "key_learnings": f"Enforce immediate controls for {group_eval['relationship']}.",
                "energy_source": "Co-Occurring Energetic Vectors",
                "barrier_status": "DEFENSIVE CONTROLS COMPROMISED",
                "signals": group_eval["signals"]
            })
            sig_counter += 1

            # Mark pairs in this group as seen
            for i in range(len(group)):
                for j in range(i + 1, len(group)):
                    seen_report_pairs.add((group[i]["report_id"], group[j]["report_id"]))
            continue

        # 2. Pairwise Evaluation
        for i in range(len(group)):
            for j in range(i + 1, len(group)):
                f1 = group[i]
                f2 = group[j]
                pair_key = (f1["report_id"], f2["report_id"])
                if pair_key in seen_report_pairs:
                    continue

                pair_eval = evaluate_report_pair_or_group([
                    next(r for r in reports if (r.get("report_reference") or r.get("report_id") or f"REP-{r.get('id', '000')}") == f1["report_id"]),
                    next(r for r in reports if (r.get("report_reference") or r.get("report_id") or f"REP-{r.get('id', '000')}") == f2["report_id"])
                ])

                if pair_eval["cluster_detected"]:
                    seen_report_pairs.add(pair_key)
                    source_reps = [
                        {
                            "report_id": s["report_id"],
                            "report_type": f1["report_type"] if s["report_id"] == f1["report_id"] else f2["report_type"],
                            "date_submitted": str(f1["date"]) if s["report_id"] == f1["report_id"] else str(f2["date"]),
                            "short_description": s["description"][:100] + ("..." if len(s["description"]) > 100 else ""),
                            "unit": s["location"],
                            "excerpt": s["description"]
                        }
                        for s in pair_eval["signals"]
                    ]

                    title = f"{f1['location_raw']} {pair_eval['relationship']}"
                    progression = build_progression_steps(pair_eval["relationship"], pair_eval["potential_consequence"])

                    correlated_results.append({
                        "cluster_detected": True,
                        "id": sig_counter,
                        "signal_id": f"WS-{sig_counter:02d}",
                        "title": title,
                        "category": "Hazard Interaction & Precursor Correlation",
                        "relationship": pair_eval["relationship"],
                        "potential_consequence": pair_eval["potential_consequence"],
                        "potential_sif_precursor": pair_eval["potential_consequence"],
                        "combined_risk": pair_eval["combined_risk"],
                        "risk_level": pair_eval["combined_risk"].title(),
                        "risk_score": pair_eval["correlation_score"],
                        "correlation_score": pair_eval["correlation_score"],
                        "reason": pair_eval["reason"],
                        "why_identified": pair_eval["reason"],
                        "recommended_action": pair_eval["recommended_action"],
                        "first_detected_date": source_reps[0]["date_submitted"] if source_reps else str(date.today()),
                        "source": f"Two-Signal Interaction ({len(source_reps)} Records)",
                        "connected_signals": [f"{s['report_id']}: {s['description'][:70]}" for s in pair_eval["signals"]],
                        "progression_steps": progression,
                        "source_reports": source_reps,
                        "review_status": "Under Review",
                        "reviewer_notes": f"Correlated by AI Interaction Engine: {pair_eval['relationship']} in {f1['location_raw']}.",
                        "key_learnings": f"Immediate mitigation required for {pair_eval['relationship']}.",
                        "energy_source": "Compound Energy Vector",
                        "barrier_status": "CRITICAL BARRIERS INTERLINKED",
                        "signals": pair_eval["signals"]
                    })
                    sig_counter += 1

    return correlated_results

def detect_latent_weak_signals_in_text(text: str) -> List[Dict[str, str]]:
    """Extracts latent weak signals from single report text for live analysis."""
    t_low = text.lower()
    detected = []
    
    for role_name, pattern in ROLE_PATTERNS.items():
        if pattern.search(t_low):
            detected.append({
                "category": role_name.replace("_", " ").title(),
                "signal": f"Latent {role_name.replace('_', ' ').lower()} condition detected in observation",
                "energy": "Latent Operational Energy",
                "barrier": "BARRIER LATENT DEFECT"
            })

    return detected
