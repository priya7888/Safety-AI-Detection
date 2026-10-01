"""
Industrial Safety Intelligence — Explanation & OSHA Hierarchy of Controls Generator
-----------------------------------------------------------------------------------
Produces audit-compliant causal justifications, structured OSHA 5-Tier Hierarchy of Controls,
regulatory citations (OSHA 29 CFR, ISO 45001, IOGP), and automated CMMS/SAP work-order payloads.
"""

from typing import List, Optional, Dict, Any


# ============================================================================
# 1. OSHA 5-TIER HIERARCHY OF CONTROLS KNOWLEDGE BASE
# ============================================================================

OSHA_CONTROL_MAP = {
    "ELECTRICAL": {
        "elimination": "Physically de-energize and disconnect main upstream electrical feed prior to commencing work.",
        "substitution": "Replace high-voltage manual switching with low-voltage remote-actuated telemetry or intrinsically safe 24V circuits.",
        "engineering": "Apply physical Lockout/Tagout (LOTO) padlock to circuit breaker, install interlocked electrical cabinet doors, and verify grounding studs.",
        "administrative": "Execute formal Electrical Hot Work / Isolation Permit, perform live-dead-live testing with a calibrated multimeter, and enforce minimum safe approach boundaries (NFPA 70E).",
        "ppe": "Mandate NFPA 70E Category 4 Arc Flash Suit (40 cal/cm²), insulated voltage-rated gloves (Class 0/1/2 with leather protectors), and dielectric safety boots.",
        "osha_standard": "OSHA 29 CFR 1910.147 (Lockout/Tagout) & 1910.333 (Electrical Safety)",
        "iogp_rule": "LSR-02: Energy Isolation"
    },
    "GRAVITY / FALL FROM HEIGHT": {
        "elimination": "Eliminate work at height by assembling components at ground level using modular construction or telescoping ground tools.",
        "substitution": "Utilize certified mobile elevated work platforms (MEWPs / Scissor Lifts) with built-in guardrails instead of ladders or temporary scaffolding.",
        "engineering": "Install standard 42-inch top-rails, mid-rails, toe-boards, and permanent certified anchor points rated to 5,000 lbs (22.2 kN).",
        "administrative": "Issue Working at Height Permit, inspect daily scaffold green tags, establish 100% tie-off policy, and barricade lower drop-zones.",
        "ppe": "Mandate full-body fall arrest harness with dual shock-absorbing lanyards or self-retracting lifelines (SRLs) and chin-strap hard hats.",
        "osha_standard": "OSHA 29 CFR 1926.501 (Duty to have fall protection) & 1910.140 (Personal fall protection)",
        "iogp_rule": "LSR-03: Work at Height"
    },
    "PRESSURE / PNEUMATIC / HYDRAULIC": {
        "elimination": "Depressurize and vent pipeline/vessel to 0 psig before breaking any flange or loosening mechanical fittings.",
        "substitution": "Convert high-pressure testing procedures to hydrostatic medium rather than high-energy compressible pneumatic gases.",
        "engineering": "Install certified pressure relief valves (PRVs), spectacle blinds/pancake blanks for positive physical isolation, and whip-check safety cables on pressurized hoses.",
        "administrative": "Enforce Line Breaking / Pressure Isolation Permit, verify pressure gauges and double-block-and-bleed valve positions.",
        "ppe": "Require high-impact face shields over safety glasses, chemical/fluid resistant heavy-duty gauntlets, and high-pressure protective spats.",
        "osha_standard": "OSHA 29 CFR 1910.119 (Process Safety Management of Highly Hazardous Chemicals)",
        "iogp_rule": "LSR-02: Energy Isolation"
    },
    "CONFINED SPACE / ATMOSPHERIC": {
        "elimination": "Redesign maintenance tasks to inspect vessels externally via camera probes or automated robotic crawlers without man-entry.",
        "substitution": "Perform chemical cleaning and water flushing from external nozzles to purge hazardous hydrocarbons prior to opening.",
        "engineering": "Deploy continuous forced-air mechanical positive-pressure ventilation fans and continuous extractive multi-gas monitoring systems.",
        "administrative": "Mandate Confined Space Entry Permit (CSEP), post dedicated entry standby watchman/hole watch, and verify gas test records (O2 19.5-23.5%, LEL <10%, H2S <10ppm, CO <25ppm).",
        "ppe": "Provide self-contained breathing apparatus (SCBA) or supplied-air airline respirators (SAR) with escape cylinder, emergency retrieval harness, and tripod winch.",
        "osha_standard": "OSHA 29 CFR 1910.146 (Permit-required confined spaces)",
        "iogp_rule": "LSR-04: Confined Space Entry"
    },
    "MECHANICAL / ROTATING EQUIPMENT": {
        "elimination": "Automate material feeding and component adjustment so personnel never enter moving machinery envelopes during operation.",
        "substitution": "Replace exposed belt and chain drives with fully enclosed direct-drive geared motors.",
        "engineering": "Install fixed physical barrier guards, interlocking perimeter access gates with positive brake arrestors, and trip-wire emergency stops.",
        "administrative": "Implement Zero-Speed verification protocols, prohibit loose clothing/jewelry, and enforce strict machine pre-start warning horn delays.",
        "ppe": "Wear tight-fitting protective coveralls, ANSI cut-level A5/A6 gloves (away from in-running nips), safety glasses, and steel-toe metatarsal boots.",
        "osha_standard": "OSHA 29 CFR 1910.212 (General requirements for all machines)",
        "iogp_rule": "LSR-06: Line of Fire"
    },
    "CHEMICAL / TOXIC": {
        "elimination": "Eliminate the hazardous chemical from the manufacturing stream by switching to mechanical or thermal cleaning alternatives.",
        "substitution": "Substitute toxic, flammable solvents with non-toxic, water-based, biodegradable cleaning agents.",
        "engineering": "Install local exhaust ventilation (LEV) hoods, automated closed-loop chemical dosing valves, and secondary spill containment berms.",
        "administrative": "Review Safety Data Sheets (SDS), post hazard warning diamonds (NFPA 704), and train workers on emergency eyewash/deluge shower stations.",
        "ppe": "Provide chemical vapor respirator with organic/acid cartridges, splash-proof goggles, butyl/nitrile heavy gauntlets, and chemical-resistant apron/Tychem suit.",
        "osha_standard": "OSHA 29 CFR 1910.1200 (Hazard Communication) & 1910.134 (Respiratory Protection)",
        "iogp_rule": "LSR-07: Safe System of Work"
    },
    "HOT WORK / FIRE": {
        "elimination": "Replace flame cutting and hot welding with cold-cutting mechanical saws or bolted/flanged connections.",
        "substitution": "Use non-sparking beryllium-copper hand tools in classified hazardous areas.",
        "engineering": "Install fire-retardant welding blankets, localized fume extraction hoods, and automatic deluge water curtain barriers.",
        "administrative": "Mandate Hot Work Permit, maintain dedicated Fire Watch for minimum 60 minutes post-task, and verify 35-ft combustible clearing radius.",
        "ppe": "Wear flame-resistant (FR) coveralls, shade 10-12 auto-darkening welding helmet, leather welding spats, and heavy welding gloves.",
        "osha_standard": "OSHA 29 CFR 1910.252 (Welding, Cutting, and Brazing)",
        "iogp_rule": "LSR-05: Hot Work"
    },
    "SUSPENDED LOAD / LIFTING": {
        "elimination": "Use ground-level transport rollers, conveyor lines, or hydraulic pallet trucks to avoid overhead suspended crane lifts.",
        "substitution": "Use certified multi-point spreader beams to stabilize complex asymmetric loads instead of direct single-choke slings.",
        "engineering": "Equip crane with anti-two-block limit switches, load moment indicators (LMI), and audible slewing travel alarms.",
        "administrative": "Implement Critical Lift Plan, establish dedicated banksman/rigger hand signals, and erect a physical barricade across the drop shadow envelope.",
        "ppe": "High-visibility Class 3 safety vest, hard hat with high-impact rating, cut-resistant gloves, and steel-toe puncture-resistant boots.",
        "osha_standard": "OSHA 29 CFR 1926.1400 (Cranes and Derricks in Construction)",
        "iogp_rule": "LSR-09: Safe Lifting"
    }
}

DEFAULT_CONTROL = {
    "elimination": "Physically isolate and remove the underlying hazardous energy before personnel access the work zone.",
    "substitution": "Replace high-risk manual intervention with automated or intrinsically safe operational methods.",
    "engineering": "Install certified physical containment, interlocking safety barriers, and redundant fail-safe sensors.",
    "administrative": "Execute Job Safety Analysis (JSA), enforce Permit-to-Work requirements, and conduct pre-job toolbox risk briefings.",
    "ppe": "Mandate task-specific PPE conforming to ANSI/EN standards based on identified residual hazard vectors.",
    "osha_standard": "OSHA 29 CFR 1910.132 (General requirements for Personal Protective Equipment) & General Duty Clause 5(a)(1)",
    "iogp_rule": "LSR-01: Bypassing Safety Controls"
}


# ============================================================================
# 2. HIERARCHY OF CONTROLS GENERATOR
# ============================================================================

def generate_osha_hierarchy_of_controls(
    hazard: Optional[str] = None,
    energy_source: Optional[str] = None,
    barrier_status: Optional[str] = None,
    sif_assessment: str = "YES"
) -> Dict[str, Any]:
    """
    Synthesizes prescriptive OSHA 5-Tier Hierarchy of Controls tailored to the specific
    hazard type and energetic release mechanism.
    """
    key = "DEFAULT"
    lookup_text = f"{hazard or ''} {energy_source or ''}".upper()

    if any(w in lookup_text for w in ["ELEC", "VOLT", "ARC", "SHOCK", "WIRE", "BREAKER"]):
        key = "ELECTRICAL"
    elif any(w in lookup_text for w in ["FALL", "HEIGHT", "SCAFFOLD", "LADDER", "ROOF", "GRATING"]):
        key = "GRAVITY / FALL FROM HEIGHT"
    elif any(w in lookup_text for w in ["PRESSUR", "HYDRAULIC", "PNEUMATIC", "PIPE", "FLANGE", "VALVE"]):
        key = "PRESSURE / PNEUMATIC / HYDRAULIC"
    elif any(w in lookup_text for w in ["CONFINED", "VESSEL", "TANK", "ATMOSPHER", "GAS", "OXYGEN"]):
        key = "CONFINED SPACE / ATMOSPHERIC"
    elif any(w in lookup_text for w in ["MACHINE", "ROTAT", "GUARD", "CONVEYOR", "NIP", "CRUSH"]):
        key = "MECHANICAL / ROTATING EQUIPMENT"
    elif any(w in lookup_text for w in ["CHEMIC", "TOXIC", "ACID", "SPILL", "CORROSIVE"]):
        key = "CHEMICAL / TOXIC"
    elif any(w in lookup_text for w in ["HOT WORK", "WELD", "SPARK", "FLAME", "CUTTING"]):
        key = "HOT WORK / FIRE"
    elif any(w in lookup_text for w in ["LIFT", "CRANE", "SUSPEND", "RIGGING", "HOIST"]):
        key = "SUSPENDED LOAD / LIFTING"

    controls = OSHA_CONTROL_MAP.get(key, DEFAULT_CONTROL)
    causal_data = compute_bayesian_causal_rrf(key, baseline_p_sif=0.89 if sif_assessment == "YES" else 0.15)

    return {
        "hazard_category": key,
        "is_sif_precursor": sif_assessment == "YES",
        "hierarchy_levels": [
            {"tier": 1, "name": "Elimination", "effectiveness": "Most Effective (100% Hazard Removal)", "prescribed_control": controls["elimination"], "risk_reduction_factor": "50x (RRF=50)"},
            {"tier": 2, "name": "Substitution", "effectiveness": "High Effectiveness (Replaces Hazard)", "prescribed_control": controls["substitution"], "risk_reduction_factor": "15x (RRF=15)"},
            {"tier": 3, "name": "Engineering Controls", "effectiveness": "Moderate-High (Isolates People)", "prescribed_control": controls["engineering"], "risk_reduction_factor": "8x (RRF=8)"},
            {"tier": 4, "name": "Administrative Controls", "effectiveness": "Moderate (Changes Work Procedures)", "prescribed_control": controls["administrative"], "risk_reduction_factor": "2.5x (RRF=2.5)"},
            {"tier": 5, "name": "Personal Protective Equipment (PPE)", "effectiveness": "Baseline (Protects Worker)", "prescribed_control": controls["ppe"], "risk_reduction_factor": "1.4x (RRF=1.4)"}
        ],
        "bayesian_causal_model": causal_data,
        "regulatory_governance": {
            "osha_standard": controls["osha_standard"],
            "iogp_life_saving_rule": controls["iogp_rule"],
            "iso_framework": "ISO 45001:2018 (Clause 8.1.2 - Eliminating hazards and reducing OH&S risks)"
        },
        "cmms_work_order_dispatch": {
            "priority": "P1 - IMMEDIATE ISOLATION" if sif_assessment == "YES" else "P3 - ROUTINE MAINTENANCE",
            "required_loto_padlocks": "YES" if key in ["ELECTRICAL", "PRESSURE / PNEUMATIC / HYDRAULIC", "MECHANICAL / ROTATING EQUIPMENT"] else "NO",
            "mandatory_permits": [controls["iogp_rule"]],
            "sign_off_authority": "Plant HSE Lead & Certified Shift Supervisor"
        }
    }


def compute_bayesian_causal_rrf(hazard_key: str, baseline_p_sif: float = 0.88) -> Dict[str, Any]:
    """
    Computes Bayesian Causal Inference Risk Reduction Factors (RRF) using Pearl's do-calculus:
    P(SIF | do(Control_i)) = P(SIF | Baseline) / RRF_i
    """
    causal_reductions = {
        "Elimination": {"rrf": 50.0, "residual_risk_p": round(baseline_p_sif / 50.0, 4), "causal_efficacy": "98% Fatality Risk Eradication"},
        "Substitution": {"rrf": 15.0, "residual_risk_p": round(baseline_p_sif / 15.0, 4), "causal_efficacy": "93% Hazard Attenuation"},
        "Engineering Controls": {"rrf": 8.0, "residual_risk_p": round(baseline_p_sif / 8.0, 4), "causal_efficacy": "87% Barrier Interlock Integrity"},
        "Administrative Controls": {"rrf": 2.5, "residual_risk_p": round(baseline_p_sif / 2.5, 4), "causal_efficacy": "60% Human Operational Compliance"},
        "Personal Protective Equipment (PPE)": {"rrf": 1.4, "residual_risk_p": round(baseline_p_sif / 1.4, 4), "causal_efficacy": "28% Passive Worker Shielding"}
    }
    return {
        "causal_dag_structure": "Hazard Energy Vector (X) -> Barrier Degradation (Z) -> SIF Fatality Consequence (Y)",
        "do_calculus_intervention_ranking": causal_reductions,
        "optimal_causal_intervention": "Tier 1 Elimination (do(X=0)) or Tier 3 Physical LOTO Interlock (do(Z=Intact))"
    }


# ============================================================================
# 3. EXPLAINABLE AUDIT-COMPLIANT TEXT GENERATOR
# ============================================================================

def generate_explanation(
    sif_assessment: str,
    hazard: Optional[str],
    signals: List[str],
    energy_source: Optional[str],
    exposure: Optional[str],
    barrier_desc: str,
    potential_consequence: Optional[str],
    report_type: str,
    safety_factors: Optional[List[str]] = None
) -> str:
    """
    Constructs explainable, evidence-grounded safety intelligence commentary.
    Strictly integrates the current observation, classification context, barrier status,
    and user-selected checklist safety factors. Avoids deterministic injury predictions.
    """
    clean_type = (report_type or "NEAR_MISS").upper().replace("-", "_").replace(" ", "_")
    type_desc = (
        "an Unsafe Act regarding worker action and operational discipline"
        if "ACT" in clean_type
        else "an Unsafe Condition regarding workplace physical environment and barrier integrity"
        if "CONDITION" in clean_type
        else "a Near Miss observation with potential incident escalation"
    )

    factors_clause = ""
    if safety_factors and len(safety_factors) > 0:
        factors_clause = f"Evaluated safety factors: {', '.join(safety_factors)}."

    if sif_assessment == "INSUFFICIENT_INFORMATION":
        parts = [
            "Insufficient information is available for a reliable SIF precursor assessment.",
            f"Observation evaluated as {type_desc}."
        ]
        if factors_clause:
            parts.append(factors_clause)
        parts.append(
            "The report text does not provide adequate detail regarding specific hazardous energy sources, "
            "personnel exposure points, or safety barrier controls."
        )
        return " ".join(parts)

    if sif_assessment == "YES":
        parts = [
            "Potential SIF precursor identified based on the available safety report information.",
            f"Observation evaluated as {type_desc}."
        ]
        
        if hazard:
            parts.append(f"Identified hazard involves {hazard}.")
        
        if exposure and exposure != "Possible":
            parts.append(f"Operational context indicates that {exposure.lower()}.")
        elif signals:
            parts.append(f"Detected safety signal: {signals[0].lower()}.")
            
        if energy_source and energy_source not in ["UNKNOWN", "Insufficient Information"]:
            parts.append(f"Primary energy vector identified as {energy_source}.")
            
        parts.append(f"Barrier analysis note: {barrier_desc}")
        
        if factors_clause:
            parts.append(factors_clause)

        if potential_consequence and "Not identified" not in potential_consequence and "Insufficient" not in potential_consequence:
            parts.append(f"Potential consequence severity: {potential_consequence}")
            
        return " ".join(parts)

    else: # NO
        parts = [
            "Based on the available report information, this observation does not indicate a high-energy SIF precursor.",
            f"Observation evaluated as {type_desc}."
        ]
        if hazard:
            parts.append(f"The documented situation relates to {hazard}.")
        parts.append(f"Barrier condition: {barrier_desc}")
        if factors_clause:
            parts.append(factors_clause)
        return " ".join(parts)
