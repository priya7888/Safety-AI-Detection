"""
Deterministic Barrier Diagnostics Module
----------------------------------------
Evaluates whether physical or administrative safety barriers were present,
missing, failed, bypassed, or compromised based strictly on factual evidence.

States:
- BARRIER_MISSING: Barrier omitted, absent, or not deployed
- BARRIER_FAILED: Barrier physically ruptured, snapped, broke, or malfunctioned
- BARRIER_BYPASSED: Interlock, guard, or safety switch deliberately overridden
- BARRIER_COMPROMISED: Barrier degraded, incomplete, loose, or partially damaged
- BARRIER_PRESENT: Secondary defense or barrier successfully activated
- BARRIER_INSUFFICIENT_INFO: No barrier evidence provided (default; never infer failure from hazard alone)
"""

import re
from typing import Dict

def analyze_barriers(text: str) -> Dict[str, str]:
    """
    Analyzes safety controls and barriers mentioned in the report.
    Strictly deterministic. Never infers 'barrier failed' merely because a hazard exists
    (e.g., 'At front door it is very slippery' -> BARRIER_INSUFFICIENT_INFO).
    """
    if not text or not isinstance(text, str):
        return {
            "status": "BARRIER_INSUFFICIENT_INFO",
            "description": "Insufficient information available to evaluate barrier condition."
        }

    lower_text = text.lower()

    # 1. Bypassed Barriers (Deliberate override, defeat, or intentional disregard of safety controls)
    if re.search(r'\b(bypass\w*|overrid\w*|bridg\w*|defeat\w*|interlock\s+bypassed|safety\s+switch\s+defeated|tamper\w*|bypassing safety control)\b', lower_text):
        return {
            "status": "BARRIER_BYPASSED",
            "description": "An engineered safety barrier, interlock, or safety control was deliberately bypassed or overridden."
        }

    # 2. Missing Barriers (Omission, lack of required control, procedural non-compliance, ignored safety rules)
    has_missing_barrier = re.search(
        r'(\b(?:ignored|bypassed|without|no|not following|failed to follow)\s+(?:proper\s+)?(?:loto|lockout|tagout|isolation)\b'
        r'|\blockout\s*/\s*tagout not followed|\bloto not followed|\bnot[\s_]locked[\s_]out'
        r'|gas testing\s+was\s+not\s+completed|without\s+atmospheric\s+monitoring|without\s+gas\s+test|\bno[\s_]gas test'
        r'|\bwithout[\s_]harness|\bwithout[\s_]helmet|\bwithout[\s_]ppe|\bno[\s_]ppe|\bwithout proper ppe'
        r'|\bppe not used|\bincorrect ppe|\bppe issue|\bwithout[\s_]permit|\bno[\s_]permit'
        r'|\bprocedure not followed|\bptw violation|\bpermit-to-work violation'
        r'|\bguard[\s_]missing|\bno guard|\bmissing guard|\bmissing machine guard|\bremoving machine guard'
        r'|\bunbarricaded|\bno barricade|\bmissing barricade|\bno lifeline|\bno toe[- ]board'
        r'|\bentering restricted area|\bworking at height without protection)',
        lower_text
    )

    if has_missing_barrier:
        # Prioritize Critical Barrier Omissions: LOTO & Atmospheric Monitoring over generic PPE
        if re.search(r'(loto|lockout|tagout|without isolation|not locked out|energy isolation)', lower_text):
            desc = "Hazardous energy isolation (LOTO) barrier was not established or verified."
        elif re.search(r'(gas test|atmospheric monitor|entering the vessel|entered the vessel|confined space)', lower_text):
            desc = "Gas testing / atmospheric monitoring not completed before entering the vessel or confined space."
        elif re.search(r'(guard[\s_]missing|no guard|missing guard|missing machine guard|removing machine guard|unbarricaded|no barricade|missing barricade)', lower_text):
            desc = "Physical machine guard, containment barricade, or safety barrier defense was missing or removed."
        elif re.search(r'(procedure not followed|ptw violation|permit-to-work violation|entering restricted area)', lower_text):
            desc = "Mandatory safe operating procedure, exclusion barrier, or administrative work authorization was not followed."
        elif re.search(r'(ppe not used|without[\s_]ppe|no[\s_]ppe|without proper ppe|without[\s_]helmet|without[\s_]harness|incorrect ppe|ppe issue)', lower_text):
            desc = "Required personal protective equipment (PPE) barrier was omitted or not worn."
        else:
            desc = "A required safety barrier, personal protective control, or procedural authorization was omitted or not deployed."
        
        return {
            "status": "BARRIER_MISSING",
            "description": desc
        }

    # 3. Failed Barriers (Physical failure, structural breakdown, rupture, snapping)
    if re.search(r'\b(barrier failed|snapped|parted|ruptured|burst|cable broke|hose detached|gasket blowout|brake failure|grating collapsed|weld gave way|shackle sheared)\b', lower_text):
        return {
            "status": "BARRIER_FAILED",
            "description": "A primary physical safety barrier or containment mechanism suffered sudden mechanical rupture or operational failure."
        }

    # 4. Compromised Barriers (Degraded, corroded, loose, partial deficiency)
    if re.search(r'\b(corroded|frayed|loose bolt|cracked weld|smudged tag|unpinned|partially open|damaged netting|overdue bump test|faded pictogram)\b', lower_text):
        return {
            "status": "BARRIER_COMPROMISED",
            "description": "Safety barrier integrity was compromised, degraded, or in need of restorative maintenance."
        }

    # 5. Present / Functioning Barriers (Arrested, stopped, prevented)
    if re.search(r'\b(safety net caught|harness arrested|interlock stopped|emergency stop activated|tripped breaker|prevented injury|alarm sounded|gas detector alerted|stopped the job|hazard contained)\b', lower_text):
        return {
            "status": "BARRIER_PRESENT",
            "description": "An operational safety barrier or emergency defense successfully functioned as intended."
        }

    # 6. Default: Insufficient Information
    return {
        "status": "BARRIER_INSUFFICIENT_INFO",
        "description": "No explicit barrier or control status was identified in the report information."
    }
