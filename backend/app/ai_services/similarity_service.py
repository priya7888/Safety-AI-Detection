"""
Dense Semantic Precursor Similarity & Recurring Pattern Detection Service.

Uses SentenceTransformer ('all-MiniLM-L6-v2') 384-dimensional dense semantic
embeddings to compute pairwise cosine similarities between incident reports.
Enables cross-plant similarity search and clustering even when incident narratives
use distinct terminology or synonyms.
"""
from typing import List, Dict, Any, Tuple
import numpy as np

# Lazy-loaded transformer model
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


def compute_dense_embedding(text: str) -> np.ndarray:
    """Computes a 384-dimensional L2-normalized dense semantic vector."""
    model = get_embedding_model()
    if model:
        try:
            return model.encode(text, normalize_embeddings=True)
        except Exception:
            pass
    return np.array([])


def compute_similarity(text1: str, text2: str) -> float:
    """
    Computes semantic cosine similarity between two safety reports.
    Falls back to tokenized Jaccard similarity if transformer is unavailable.
    """
    model = get_embedding_model()
    if model:
        try:
            vec1 = model.encode(text1, normalize_embeddings=True)
            vec2 = model.encode(text2, normalize_embeddings=True)
            cosine_sim = float(np.dot(vec1, vec2))
            return round(max(0.0, cosine_sim), 3)
        except Exception:
            pass

    # Jaccard Token Overlap Fallback
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    if not words1 or not words2:
        return 0.0
    return round(len(words1 & words2) / len(words1 | words2), 3)


def find_similar_reports(
    target_text: str,
    all_reports: List[Dict[str, Any]],
    threshold: float = 0.35,
    max_results: int = 4
) -> List[Dict[str, Any]]:
    """
    Finds historical safety reports with high dense semantic similarity
    to detect recurring SIF precursor patterns across plants and units.
    """
    matches = []
    model = get_embedding_model()
    
    if model:
        try:
            target_vec = model.encode(target_text, normalize_embeddings=True)
            for rep in all_reports:
                rep_text = f"{rep.get('description', '')} {rep.get('additional_context', '')}".strip()
                if not rep_text:
                    rep_text = rep.get('report_text', '')
                if not rep_text:
                    continue
                rep_vec = model.encode(rep_text, normalize_embeddings=True)
                sim = float(np.dot(target_vec, rep_vec))
                if sim >= threshold:
                    matches.append({
                        "report_id": rep.get("id"),
                        "report_reference": rep.get("report_reference", f"REP-{rep.get('id', 'NA')}"),
                        "location": rep.get("location") or rep.get("site"),
                        "similarity_score": round(sim, 3),
                        "common_hazard": rep.get("identified_hazard") or rep.get("activity"),
                        "sif_precursor": rep.get("sif_precursor_assessment") or rep.get("sif_potential")
                    })
            matches.sort(key=lambda x: x["similarity_score"], reverse=True)
            return matches[:max_results]
        except Exception:
            pass

    # Fallback loop
    for rep in all_reports:
        rep_text = f"{rep.get('description', '')} {rep.get('additional_context', '')}".strip() or rep.get('report_text', '')
        sim = compute_similarity(target_text, rep_text)
        if sim >= threshold:
            matches.append({
                "report_id": rep.get("id"),
                "report_reference": rep.get("report_reference", f"REP-{rep.get('id', 'NA')}"),
                "location": rep.get("location") or rep.get("site"),
                "similarity_score": sim,
                "common_hazard": rep.get("identified_hazard") or rep.get("activity"),
                "sif_precursor": rep.get("sif_precursor_assessment") or rep.get("sif_potential")
            })
    matches.sort(key=lambda x: x["similarity_score"], reverse=True)
    return matches[:max_results]
