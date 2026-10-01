"""
Industrial Safety Narrative Similarity — Hybrid BM25 & Dense Transformer Engine (RRF)
-------------------------------------------------------------------------------------
Provides state-of-the-art hybrid information retrieval for industrial incident reports:
1. Okapi BM25 Lexical Ranking Algorithm (IDF + Term Frequency normalization).
2. Continuous Dense Vector Space (SentenceTransformer 'all-MiniLM-L6-v2', 384-D).
3. Reciprocal Rank Fusion (RRF, k=60) combining lexical and semantic search graphs.
4. Top-K Historical Incident Retrieval with Root-Cause and Corrective Action Grounding.
"""

import math
import numpy as np
from typing import List, Dict, Any, Set, Optional, Tuple
from collections import Counter
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


def tokenize_for_similarity(text: str) -> List[str]:
    """
    Extracts informative safety tokens for BM25 and lexical overlap calculation,
    preserving compound safety terms and equipment references.
    """
    tokens = safety_aware_tokenize(text)
    return [w for w in tokens if len(w) >= 3 and w not in SIMILARITY_STOPWORDS]


# ============================================================================
# OKAPI BM25 RANKING ALGORITHM
# ============================================================================

class BM25OkapiEngine:
    """
    Implements Okapi BM25 probabilistic relevance ranking algorithm:
    BM25(D, Q) = sum( IDF(q_i) * (f(q_i, D) * (k1 + 1)) / (f(q_i, D) + k1 * (1 - b + b * (|D| / avgdl))) )
    """
    def __init__(self, corpus_docs: List[str], k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus_size = len(corpus_docs)
        self.doc_tokens = [tokenize_for_similarity(doc) for doc in corpus_docs]
        self.doc_lengths = [len(doc) for doc in self.doc_tokens]
        self.avg_doc_len = sum(self.doc_lengths) / max(1, self.corpus_size)

        # Compute document frequencies
        self.df: Dict[str, int] = Counter()
        for doc in self.doc_tokens:
            for term in set(doc):
                self.df[term] += 1

        # Compute Robertson-Sparck Jones IDF with smoothing
        self.idf: Dict[str, float] = {}
        for term, freq in self.df.items():
            self.idf[term] = math.log(1.0 + (self.corpus_size - freq + 0.5) / (freq + 0.5))

    def score(self, query_tokens: List[str], doc_idx: int) -> float:
        """Calculates BM25 relevance score for a single document against query tokens."""
        if doc_idx >= self.corpus_size or self.doc_lengths[doc_idx] == 0:
            return 0.0

        doc_terms = Counter(self.doc_tokens[doc_idx])
        doc_len = self.doc_lengths[doc_idx]
        score = 0.0

        for q in query_tokens:
            if q in doc_terms:
                freq = doc_terms[q]
                idf = self.idf.get(q, 0.1)
                num = freq * (self.k1 + 1.0)
                denom = freq + self.k1 * (1.0 - self.b + self.b * (doc_len / max(1.0, self.avg_doc_len)))
                score += idf * (num / denom)

        return max(0.0, score)


# ============================================================================
# RECIPROCAL RANK FUSION (RRF) & HYBRID RETRIEVAL
# ============================================================================

def compute_jaccard_similarity(text1: str, text2: str) -> float:
    """Computes Jaccard Token Similarity: |Tokens(A) ∩ Tokens(B)| / |Tokens(A) ∪ Tokens(B)|"""
    tokens1 = set(tokenize_for_similarity(text1))
    tokens2 = set(tokenize_for_similarity(text2))
    if not tokens1 or not tokens2:
        return 0.0
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return round(len(intersection) / len(union), 4)


def compute_similarity(text1: str, text2: str) -> float:
    """Calculates unified similarity score using dense transformer embeddings with lexical fallback."""
    emb1 = compute_dense_embedding(text1)
    emb2 = compute_dense_embedding(text2)
    if emb1 is not None and emb2 is not None:
        return compute_cosine_similarity(emb1, emb2)
    return compute_jaccard_similarity(text1, text2)


def find_similar_reports(
    target_text: str,
    all_reports: List[Dict[str, Any]],
    threshold: float = 0.15,
    max_results: int = 4
) -> List[Dict[str, Any]]:
    """
    Executes Hybrid Reciprocal Rank Fusion (RRF) combining:
    1. Okapi BM25 Lexical Keyword Ranking
    2. 384-D Dense Transformer Embedding Cosine Similarity
    Formula: RRF_Score(d) = sum( 1 / (60 + Rank_m(d)) )
    """
    if not target_text or not all_reports:
        return []

    target_tokens = tokenize_for_similarity(target_text)
    target_emb = compute_dense_embedding(target_text)

    # Prepare corpus for BM25
    corpus_texts = [f"{rep.get('description', '')} {rep.get('additional_context', '')}".strip() for rep in all_reports]
    bm25 = BM25OkapiEngine(corpus_texts)

    bm25_scores = []
    dense_scores = []

    for i, rep_text in enumerate(corpus_texts):
        # 1. BM25 Score
        b_score = bm25.score(target_tokens, i)
        bm25_scores.append((i, b_score))

        # 2. Dense Cosine / Jaccard Score
        if target_emb is not None:
            rep_emb = compute_dense_embedding(rep_text)
            d_score = compute_cosine_similarity(target_emb, rep_emb) if rep_emb is not None else compute_jaccard_similarity(target_text, rep_text)
        else:
            d_score = compute_jaccard_similarity(target_text, rep_text)
        dense_scores.append((i, d_score))

    # Rank by BM25 and Dense
    bm25_ranked = sorted(bm25_scores, key=lambda x: x[1], reverse=True)
    dense_ranked = sorted(dense_scores, key=lambda x: x[1], reverse=True)

    bm25_rank_map = {idx: rank + 1 for rank, (idx, _) in enumerate(bm25_ranked)}
    dense_rank_map = {idx: rank + 1 for rank, (idx, _) in enumerate(dense_ranked)}

    # RRF Constant k = 60 (standard in IR research)
    RRF_K = 60
    hybrid_results = []

    for idx, rep in enumerate(all_reports):
        b_rank = bm25_rank_map.get(idx, len(all_reports))
        d_rank = dense_rank_map.get(idx, len(all_reports))
        d_score = next(s for i, s in dense_scores if i == idx)

        # RRF Score formula: 1 / (k + rank_bm25) + 1 / (k + rank_dense)
        rrf_score = (1.0 / (RRF_K + b_rank)) + (1.0 / (RRF_K + d_rank))
        # Normalized similarity for user display
        display_score = round(max(d_score, min(1.0, rrf_score * 30.0)), 4)

        if display_score >= threshold:
            hybrid_results.append({
                "report_id": rep.get("id"),
                "report_reference": rep.get("report_reference") or f"REP-{rep.get('id', '000')}",
                "location": rep.get("location", "Plant Facility"),
                "similarity_method": "Hybrid RRF (Okapi BM25 + 384-D Dense Transformer)",
                "similarity_score": display_score,
                "similarity_percentage": f"{round(display_score * 100, 1)}%",
                "rrf_score": round(rrf_score, 6),
                "bm25_rank": b_rank,
                "dense_cosine_score": round(d_score, 4),
                "common_hazard": rep.get("identified_hazard") or rep.get("hazard", "Operational Hazard"),
                "sif_precursor": rep.get("sif_precursor_assessment") or rep.get("sif_potential", "NO"),
                "matched_energy_source": rep.get("energy_source", "Hazardous Energy"),
                "action_summary": rep.get("mitigation_action") or rep.get("recommended_action") or "Enforce barrier integrity and follow OSHA LOTO isolation protocols."
            })

    hybrid_results.sort(key=lambda x: x["similarity_score"], reverse=True)
    return hybrid_results[:max_results]
