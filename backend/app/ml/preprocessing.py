"""
Text preprocessing for the SIF classification pipeline.

This uses lightweight, dependency-free preprocessing (lowercasing,
punctuation stripping, stopword removal) rather than a heavyweight NLP
library. The function signature is kept isolated in its own module so it
can be swapped later for a spaCy-based pipeline (lemmatization, POS
tagging, NER) without touching the rest of the ML code -- just replace
the body of `preprocess_text` and re-run `train_model.py`.
"""
import re

# A small, safety-report-tuned stopword list. Deliberately keeps words like
# "without", "not" and "no" because they flip meaning in safety text
# (e.g. "without isolation" is very different from "with isolation").
_STOPWORDS = {
    "a", "an", "the", "is", "was", "were", "are", "be", "been", "being",
    "to", "of", "in", "on", "at", "by", "for", "with", "and", "or", "but",
    "this", "that", "these", "those", "it", "its", "as", "from", "into",
    "he", "she", "they", "his", "her", "their", "had", "has", "have",
}

_WORD_RE = re.compile(r"[a-zA-Z]+")


def preprocess_text(text: str) -> str:
    """
    Normalize raw report text for vectorization.

    Steps: lowercase -> extract alphabetic tokens -> drop stopwords ->
    rejoin into a cleaned string. Numbers and punctuation are dropped
    since they carry little signal for TF-IDF on short safety reports.
    """
    if not text:
        return ""
    text = text.lower()
    tokens = _WORD_RE.findall(text)
    tokens = [t for t in tokens if t not in _STOPWORDS]
    return " ".join(tokens)
