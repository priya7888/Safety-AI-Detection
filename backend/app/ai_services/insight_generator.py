from typing import List, Dict, Any

def generate_safety_narrative(
    total_reports: int,
    sif_count: int,
    high_priority_count: int,
    top_barrier_failure: str,
    top_risk_area: str,
    precursor_density: float
) -> Dict[str, Any]:
    """
    Generates professional industrial AI safety narrative and targeted actionable insights.
    """
    if total_reports == 0:
        return {
            "headline": "Zero Operational Reports Logged",
            "narrative": "No safety observations are currently available for AI NLP precursor synthesis. Ingest reports from field shifts to activate live hazard pattern intelligence.",
            "insights": []
        }

    # Synthesize industrial narrative
    if precursor_density >= 50.0:
        exposure_tone = "ELEVATED CONCENTRATION"
        headline = f"High-Energy Exposure Alert: {sif_count} Potential SIF Precursors Flagged ({precursor_density}%)"
        narrative = (
            f"SIF Sentinel AI has analyzed {total_reports} industrial safety records and identified {sif_count} high-consequence "
            f"precursors across operational units. The predominant systemic vulnerability centers on {top_barrier_failure}, "
            f"with {top_risk_area} recording the highest exposure frequency. Multi-signal analysis indicates unmitigated hazardous "
            f"energy vectors where single-point defense failures could trigger irreversible personnel outcomes."
        )
    elif precursor_density > 0:
        exposure_tone = "MODERATE MONITORING"
        headline = f"Controlled Precursor Exposure: {sif_count} SIF Signals Detected ({precursor_density}%)"
        narrative = (
            f"Operational observations demonstrate an overall precursor density of {precursor_density}%. While lower-energy routine "
            f"observations comprise the majority of events, {high_priority_count} critical precursors require immediate barrier re-verification. "
            f"Focused surveillance is recommended at {top_risk_area} where localized defense degradation has been logged."
        )
    else:
        exposure_tone = "STABLE / LOW CONSEQUENCE"
        headline = f"Baseline Precursor Stability: 0 SIF Precursors Detected across {total_reports} Reports"
        narrative = (
            f"All {total_reports} ingested safety observations currently reflect low-energy routine hazards without immediate SIF exposure. "
            f"Continued reporting vigilance is encouraged across field teams to maintain active defense visibility."
        )

    # Actionable Industrial AI Insights
    insights = [
        {
            "id": 1,
            "category": "Barrier Defense",
            "title": f"Reinforce {top_barrier_failure} Controls",
            "detail": f"Field observations indicate recurring vulnerability in {top_barrier_failure}. Mandate pre-shift physical verification before high-energy tasks.",
            "impact": "CRITICAL" if high_priority_count > 0 else "MEDIUM"
        },
        {
            "id": 2,
            "category": "Area Surveillance",
            "title": f"Targeted Safety Walkdown at {top_risk_area}",
            "detail": f"Deploy HSE supervisory walkdowns to {top_risk_area} to inspect physical barricades, permit-to-work compliance, and equipment grounding.",
            "impact": "HIGH"
        },
        {
            "id": 3,
            "category": "Near-Miss Escalation",
            "title": "Cross-Shift Precursor Warning Briefing",
            "detail": f"Circulate latest precursor findings to shift supervisors. Near-miss energy levels indicate active line-of-fire exposure.",
            "impact": "MEDIUM"
        }
    ]

    return {
        "headline": headline,
        "exposure_tone": exposure_tone,
        "narrative": narrative,
        "insights": insights
    }
