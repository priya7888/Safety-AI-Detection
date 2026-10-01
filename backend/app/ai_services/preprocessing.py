import re

def preprocess_text(text: str) -> str:
    """
    Normalizes report text while strictly preserving critical safety negations
    and condition indicators (e.g. not, without, missing, failed, damaged).
    """
    if not text:
        return ""
    
    # 1. Normalize line breaks and multiple spaces
    cleaned = re.sub(r'[\r\n\t]+', ' ', text)
    cleaned = re.sub(r'\s{2,}', ' ', cleaned)
    cleaned = cleaned.strip()

    # 2. Ensure critical negations are preserved and standardized
    # (Do NOT strip stopwords or remove negations)
    return cleaned
