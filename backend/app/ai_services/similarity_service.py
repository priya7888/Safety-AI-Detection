"""
Narrative Similarity — Jaccard Token Similarity
-----------------------------------------------
Provides transparent, explainable lexical token overlap calculation for comparing
safety report narratives and identifying recurring operational issues.

Important:
This method computes exact lexical token overlap (Jaccard token similarity),
NOT black-box vector/semantic embeddings, ensuring complete auditability for industrial safety.
"""

import re
from typing import List, Dict, Any, Set
from .preprocessing import safety_aware_tokenize

# Neutral syntax stopwords for lexical comparison (strictly keeping safety nouns/verbs)
SIMILARITY_STOPWORDS = {
    'the', 'and', 'was', 'were', 'for', 'with', 'that', 'this', 'from', 'have',
    'has', 'had', 'are', 'is', 'a', 'an', 'in', 'on', 'at', 'to', 'of', 'by',
    'as', 'into', 'during', 'while', 'when', 'report', 'observed', 'noted',
    'been', 'being', 'there', 'their', 'they', 'which', 'who', 'whom'
}


def tokenize_for_similarity(text: str) -> Set[str]:
    """
    Extracts informative safety tokens for lexical overlap calculation,
    preserving compound safety terms and equipment references.
    """
    tokens = safety_aware_tokenize(text)
    return {w for w in tokens if len(w) >= 3 and w not in SIMILARITY_STOPWORDS}


def compute_similarity(text1: str, text2: str) -> float:
    """
    Computes Narrative Similarity — Jaccard Token Similarity between two safety reports.
    Formula: |Tokens(A) ∩ Tokens(B)| / |Tokens(A) ∪ Tokens(B)|
    """
    tokens1 = tokenize_for_similarity(text1)
    tokens2 = tokenize_for_similarity(text2)
    if not tokens1 or not tokens2:
        return 0.0
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return round(len(intersection) / len(union), 4)


def find_similar_reports(
    target_text: str,
    all_reports: List[Dict[str, Any]],
    threshold: float = 0.15,
    max_results: int = 4
) -> List[Dict[str, Any]]:
    """
    Finds safety reports with high lexical token overlap using
    'Narrative Similarity — Jaccard Token Similarity'.
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
                "similarity_method": "Narrative Similarity — Jaccard Token Similarity",
                "similarity_score": sim,
                "common_hazard": rep.get("identified_hazard"),
                "sif_precursor": rep.get("sif_precursor_assessment")
            })
    matches.sort(key=lambda x: x["similarity_score"], reverse=True)
    return matches[:max_results]
