import re
from typing import List, Dict, Any, Tuple

def tokenize_for_similarity(text: str) -> set:
    """Extracts informative content words from report text."""
    stop_words = {
        'the', 'and', 'was', 'were', 'for', 'with', 'that', 'this', 'from', 'have',
        'has', 'had', 'not', 'but', 'are', 'is', 'a', 'an', 'in', 'on', 'at', 'to',
        'of', 'by', 'as', 'into', 'during', 'while', 'when', 'report', 'observed'
    }
    words = re.findall(r'[a-zA-Z]{3,}', text.lower())
    return {w for w in words if w not in stop_words}

def compute_similarity(text1: str, text2: str) -> float:
    """Computes Jaccard semantic overlap between two safety reports."""
    tokens1 = tokenize_for_similarity(text1)
    tokens2 = tokenize_for_similarity(text2)
    if not tokens1 or not tokens2:
        return 0.0
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return round(len(intersection) / len(union), 3)

def find_similar_reports(
    target_text: str,
    all_reports: List[Dict[str, Any]],
    threshold: float = 0.15,
    max_results: int = 4
) -> List[Dict[str, Any]]:
    """
    Finds safety reports with high semantic similarity to detect recurring patterns.
    """
    matches = []
    for rep in all_reports:
        rep_text = f"{rep.get('description', '')} {rep.get('additional_context', '')}"
        sim = compute_similarity(target_text, rep_text)
        if sim >= threshold:
            matches.append({
                "report_id": rep.get("id"),
                "report_reference": rep.get("report_reference"),
                "location": rep.get("location"),
                "similarity_score": sim,
                "common_hazard": rep.get("identified_hazard"),
                "sif_precursor": rep.get("sif_precursor_assessment")
            })
    matches.sort(key=lambda x: x["similarity_score"], reverse=True)
    return matches[:max_results]
