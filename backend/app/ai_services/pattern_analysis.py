from typing import List, Dict, Any
from collections import defaultdict

def analyze_operational_patterns(reports: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyzes cross-report patterns:
    1. SIF Hotspot Matrix (Location x Hazard/Activity)
    2. Barrier degradation patterns
    3. Emerging precursor warning indicators
    """
    if not reports:
        return {
            "matrix": [],
            "top_locations": [],
            "barrier_trends": [],
            "emerging_risks": []
        }

    # 1. Location x Activity Matrix
    matrix_map = defaultdict(lambda: defaultdict(lambda: {"total": 0, "sif_count": 0, "barrier_failures": 0, "reports": []}))
    location_totals = defaultdict(lambda: {"total": 0, "sif_count": 0, "barrier_failures": 0})
    barrier_failures_count = defaultdict(int)

    for r in reports:
        loc = r.get("location") or "Unspecified Location"
        hazard = r.get("identified_hazard") or "General Operational Hazard"
        
        # Determine Activity category from hazard/text
        activity = "General Plant Ops"
        desc = (r.get("description") or "").lower()
        if any(w in desc for w in ["lift", "crane", "rigging", "sling", "hoist", "suspended"]):
            activity = "Lifting & Rigging"
        elif any(w in desc for w in ["height", "scaffold", "ladder", "grating", "fall"]):
            activity = "Work at Height"
        elif any(w in desc for w in ["electrical", "switchgear", "panel", "breaker", "arc"]):
            activity = "Electrical Energization"
        elif any(w in desc for w in ["confined", "tank", "vessel", "manhole", "gas"]):
            activity = "Confined Space Entry"
        elif any(w in desc for w in ["forklift", "vehicle", "truck", "dumper", "traffic"]):
            activity = "Mobile Plant & Transport"
        elif any(w in desc for w in ["pressure", "loto", "valve", "pipeline", "hydrotest"]):
            activity = "Pressurized Systems"

        is_sif = r.get("sif_precursor_assessment") == "YES"
        is_barrier_failed = r.get("barrier_information") in ["BARRIER_FAILED", "BARRIER_MISSING"]

        matrix_map[loc][activity]["total"] += 1
        if is_sif:
            matrix_map[loc][activity]["sif_count"] += 1
        if is_barrier_failed:
            matrix_map[loc][activity]["barrier_failures"] += 1
            barrier_failures_count[r.get("barrier_information") or "BARRIER_DEFECT"] += 1
        matrix_map[loc][activity]["reports"].append(r.get("report_reference"))

        location_totals[loc]["total"] += 1
        if is_sif:
            location_totals[loc]["sif_count"] += 1
        if is_barrier_failed:
            location_totals[loc]["barrier_failures"] += 1

    # Format Hotspot Matrix
    formatted_matrix = []
    for loc, activities in matrix_map.items():
        for act, data in activities.items():
            sif_density = round((data["sif_count"] / data["total"]) * 100, 1) if data["total"] > 0 else 0
            
            # Risk Level
            if data["sif_count"] >= 2 or (data["sif_count"] >= 1 and data["barrier_failures"] >= 1):
                risk_level = "CRITICAL"
            elif data["sif_count"] == 1 or data["barrier_failures"] >= 1:
                risk_level = "ELEVATED"
            else:
                risk_level = "CONTROLLED"

            formatted_matrix.append({
                "location": loc,
                "activity": act,
                "total_observations": data["total"],
                "sif_precursors": data["sif_count"],
                "barrier_failures": data["barrier_failures"],
                "sif_density_pct": sif_density,
                "risk_level": risk_level,
                "report_refs": data["reports"]
            })

    # Sort locations by risk
    sorted_locations = sorted(
        [{"location": k, **v} for k, v in location_totals.items()],
        key=lambda x: (x["sif_count"], x["barrier_failures"]),
        reverse=True
    )

    # Emerging Risks
    emerging_risks = []
    for item in formatted_matrix:
        if item["sif_precursors"] >= 1 and item["barrier_failures"] >= 1:
            emerging_risks.append({
                "location": item["location"],
                "activity": item["activity"],
                "headline": f"Precursor Hotspot in {item['location']}",
                "detail": f"{item['sif_precursors']} SIF precursor(s) and {item['barrier_failures']} barrier deficiency observed during {item['activity']}. Immediate management verification advised.",
                "severity": item["risk_level"]
            })

    return {
        "matrix": formatted_matrix,
        "top_locations": sorted_locations,
        "barrier_distribution": dict(barrier_failures_count),
        "emerging_risks": emerging_risks
    }
