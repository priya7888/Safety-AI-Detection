"""
Industrial Safety Narrative Similarity & Dense Embedding Engine
----------------------------------------------------------------
Provides multi-modal incident matching:
1. Dense Continuous Transformer Embeddings (SentenceTransformer 'all-MiniLM-L6-v2', 384-D) with Cosine Similarity.
2. Transparent Lexical Token Overlap (Jaccard Token Similarity with safety-token preservation).
3. Hybrid Top-K historical incident retrieval with root cause and corrective action grounding.
"""

import re
import numpy as np
from typing import List, Dict, Any, Set, Optional, Tuple
from .preprocessing import safety_aware_tokenize

# Neutral syntax stopwords for lexical comparison (strictly keeping safety nouns/verbs)
SIMILARITY_STOPWORDS = {
    'the', 'and', 'was', 'were', 'for', 'with', 'that', 'this', 'from', 'have',
    'has', 'had', 'are', 'is', 'a', 'an', 'in', 'on', 'at', 'to', 'of', 'by',
    'as', 'into', 'during', 'while', 'when', 'report', 'observed', 'noted',
    'been', 'being', 'there', 'their', 'they', 'which', 'who', 'whom'
}

# Lazy-loaded transformer model singleton
_TRANSFORMER_MODEL = None
_MODEL_LOAD_FAILED = False


def _get_transformer_model():
    """Lazy-loads and caches the SentenceTransformer model for 384-D embeddings."""
    global _TRANSFORMER_MODEL, _MODEL_LOAD_FAILED
    if _TRANSFORMER_MODEL is not None:
        return _TRANSFORMER_MODEL
    if _MODEL_LOAD_FAILED:
        return None

    try:
        from sentence_transformers import SentenceTransformer
        _TRANSFORMER_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
        return _TRANSFORMER_MODEL
    except Exception:
        _MODEL_LOAD_FAILED = True
        return None


def compute_dense_embedding(text: str) -> Optional[np.ndarray]:
    """
    Transforms incident narrative into a continuous 384-dimensional dense vector.
    Returns normalized numpy array (L2-norm = 1.0) or None if model unavailable.
    """
    model = _get_transformer_model()
    if model is None or not text or not text.strip():
        return None
    try:
        emb = model.encode(text.strip(), convert_to_numpy=True, normalize_embeddings=True)
        return emb
    except Exception:
        return None


def compute_cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    Computes Cosine Similarity between two L2-normalized dense embedding vectors:
    Cosine Similarity = (u · v) / (||u|| * ||v||)
    """
    if vec_a is None or vec_b is None:
        return 0.0
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    cos_sim = float(np.dot(vec_a, vec_b) / (norm_a * norm_b))
    return round(max(0.0, min(1.0, cos_sim)), 4)


def tokenize_for_similarity(text: str) -> Set[str]:
    """
    Extracts informative safety tokens for lexical overlap calculation,
    preserving compound safety terms and equipment references.
    """
    tokens = safety_aware_tokenize(text)
    return {w for w in tokens if len(w) >= 3 and w not in SIMILARITY_STOPWORDS}


def compute_jaccard_similarity(text1: str, text2: str) -> float:
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


def compute_similarity(text1: str, text2: str) -> float:
    """
    Calculates unified similarity score using dense transformer embeddings
    with seamless automatic fallback to lexical Jaccard token overlap.
    """
    emb1 = compute_dense_embedding(text1)
    emb2 = compute_dense_embedding(text2)
    if emb1 is not None and emb2 is not None:
        return compute_cosine_similarity(emb1, emb2)
    return compute_jaccard_similarity(text1, text2)


def find_similar_reports(
    target_text: str,
    all_reports: List[Dict[str, Any]],
    threshold: float = 0.20,
    max_results: int = 4
) -> List[Dict[str, Any]]:
    """
    Retrieves top historical safety reports sharing underlying hazard patterns
    using Dense Transformer Vector Space + Lexical Token Grounding.
    """
    if not target_text or not all_reports:
        return []

    target_emb = compute_dense_embedding(target_text)
    matches = []

    for rep in all_reports:
        rep_text = f"{rep.get('description', '')} {rep.get('additional_context', '')}".strip()
        if not rep_text:
            continue

        similarity_method = "Lexical Jaccard Token Overlap"
        sim_score = 0.0

        if target_emb is not None:
            rep_emb = compute_dense_embedding(rep_text)
            if rep_emb is not None:
                sim_score = compute_cosine_similarity(target_emb, rep_emb)
                similarity_method = "Dense Transformer Embeddings (384-D Cosine)"
            else:
                sim_score = compute_jaccard_similarity(target_text, rep_text)
        else:
            sim_score = compute_jaccard_similarity(target_text, rep_text)

        if sim_score >= threshold:
            matches.append({
                "report_id": rep.get("id"),
                "report_reference": rep.get("report_reference") or f"REP-{rep.get('id', '000')}",
                "location": rep.get("location", "Plant Facility"),
                "similarity_method": similarity_method,
                "similarity_score": sim_score,
                "similarity_percentage": f"{round(sim_score * 100, 1)}%",
                "common_hazard": rep.get("identified_hazard") or rep.get("hazard", "Operational Hazard"),
                "sif_precursor": rep.get("sif_precursor_assessment") or rep.get("sif_potential", "NO"),
                "matched_energy_source": rep.get("energy_source", "Hazardous Energy"),
                "action_summary": rep.get("mitigation_action") or rep.get("recommended_action") or "Review barrier integrity and follow OSHA LOTO procedures."
            })

    matches.sort(key=lambda x: x["similarity_score"], reverse=True)
    return matches[:max_results]
