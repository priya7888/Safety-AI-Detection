"""
Training Data Pipeline Module
-----------------------------
Implements end-to-end data ingestion, validation, cleaning, deduplication,
PII protection, text normalization, and stratified dataset splitting.

Pipeline Flow:
Raw Safety Reports
        ↓
Data Validation (schema, types, missing fields audit)
        ↓
Cleaning & Filtering
        ↓
Deduplication
        ↓
PII Protection (masking names, emails, phones, IDs)
        ↓
Text Normalization & Negation Preservation
        ↓
Target Leakage Mitigation
        ↓
Train / Validation / Test Stratified Split (70/15/15)
"""

import os
import re
import logging
from pathlib import Path
from typing import Dict, Any, Tuple, List, Optional
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

import sys
# Ensure backend modules are importable
backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.ai_services.preprocessing import preprocess_text, mask_pii, preserve_negations

logger = logging.getLogger("data_pipeline")

# Canonical fields expected in safety reports
EXPECTED_FIELDS = [
    ("Reference ID", ["report_id", "id", "reference_id", "report_reference"]),
    ("Date", ["date", "report_date", "created_at"]),
    ("Location / Unit", ["location", "unit", "facility_unit", "site"]),
    ("Report Type", ["report_type", "type", "category"]),
    ("Description", ["report_text", "description", "narrative", "details"]),
    ("Hazard", ["hazard", "identified_hazard", "hazard_category"]),
    ("Activity", ["activity", "task", "operation"]),
    ("Barrier Status", ["barrier_failure", "barrier_status", "barrier_information"]),
    ("Energy Vector", ["energy_vector", "energy_source"]),
    ("Worker Exposure", ["worker_exposure", "exposure"]),
    ("IOGP Life-Saving Rule", ["life_saving_rule", "iogp_rule", "lsr"]),
    ("SIF Label", ["sif_potential", "sif_precursor", "sif_label", "is_sif"]),
]

# Leakage patterns to mask from training narratives
LEAKAGE_PATTERNS = [
    r"\bthe condition did not create a credible high[- ]consequence exposure\b",
    r"\bcreating a credible high[- ]consequence exposure\b",
    r"\bno credible sif scenario was identified\b",
    r"\b(?:the\s+)?scenario had credible sif potential\b",
    r"\bcredible\s+high[- ]consequence\s+exposure\b",
    r"\bhigh[- ]consequence\s+exposure\b",
    r"\bcredible\s+sif\s+potential\b",
    r"\bcredible\s+sif\s+scenario\b",
    r"\bcredible\s+sif\b",
    r"\bsif\s+potential\b",
    r"\bsif\s+scenario\b",
    r"\bnon[- ]sif[- ]potential\b",
    r"\bnon[- ]sif\b",
    r"\bsif[- ]precursor\b",
    r"\bnon[- ]sif[- ]observation\b",
]
LEAKAGE_REGEX = re.compile("|".join(LEAKAGE_PATTERNS), flags=re.IGNORECASE)


def validate_dataset_schema(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Validates the dataset against required industrial safety fields.
    Identifies available columns and clearly flags missing fields without inventing them.
    """
    field_mapping: Dict[str, Optional[str]] = {}
    missing_fields: List[str] = []

    for standard_name, possible_cols in EXPECTED_FIELDS:
        found_col = None
        for col in possible_cols:
            if col in df.columns:
                found_col = col
                break
        field_mapping[standard_name] = found_col
        if found_col is None:
            missing_fields.append(standard_name)

    return {
        "field_mapping": field_mapping,
        "missing_fields": missing_fields,
        "total_columns": len(df.columns),
        "available_columns": list(df.columns)
    }


def clean_and_normalize_text(text: str, mask_leakage: bool = True) -> str:
    """
    Applies the full NLP cleaning pipeline:
    1. PII Masking
    2. Negation Preservation (e.g. 'without helmet' -> 'without_helmet')
    3. Target Leakage phrase suppression (for supervised training)
    """
    if not isinstance(text, str):
        return ""

    # Preprocess text (PII masking + whitespace + negation binding)
    cleaned = preprocess_text(text, mask_personal_data=True)

    # Suppress explicit target keywords if requested (to prevent overfitting on label hints)
    if mask_leakage:
        cleaned = LEAKAGE_REGEX.sub(" [MASKED_LEAKAGE] ", cleaned)
        cleaned = re.sub(r'\s{2,}', ' ', cleaned).strip()

    return cleaned


def load_and_prepare_dataset(
    filepath: Path,
    mask_leakage: bool = True,
    deduplicate: bool = True
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Loads raw safety reports, validates schema, deduplicates,
    protects PII, normalizes text, and audits class distribution.
    """
    if not filepath.exists():
        raise FileNotFoundError(f"Dataset not found at path: {filepath}")

    raw_df = pd.read_csv(filepath)
    raw_count = len(raw_df)

    # 1. Validate Schema
    schema_info = validate_dataset_schema(raw_df)
    mapping = schema_info["field_mapping"]

    text_col = mapping.get("Description")
    target_col = mapping.get("SIF Label")

    if not text_col or text_col not in raw_df.columns:
        raise ValueError(f"Required report text/description column not found in dataset. Columns: {list(raw_df.columns)}")

    if not target_col or target_col not in raw_df.columns:
        raise ValueError(f"Required SIF target label column not found in dataset. Columns: {list(raw_df.columns)}")

    # 2. Small Dataset Check (Requirement 24)
    is_small_dataset = raw_count < 1000
    dataset_warning = None
    if is_small_dataset:
        dataset_warning = (
            f"WARNING: Dataset contains only {raw_count} rows. "
            "Dataset is insufficient for reliable large-scale supervised SIF model training. "
            "Proceeding with baseline training under reported limitations."
        )
        print(f"\n[!] {dataset_warning}\n")

    # Check data source / authenticity disclosure
    data_source = "Unknown"
    if "data_source" in raw_df.columns:
        sources = raw_df["data_source"].unique().tolist()
        data_source = ", ".join(str(s) for s in sources)

    # 3. Handle Nulls in critical columns
    df = raw_df.dropna(subset=[text_col, target_col]).copy()
    nulls_dropped = raw_count - len(df)

    # 4. Standardize Target Labels
    # Normalizes classes to 'SIF-potential' vs 'Non-SIF-potential'
    def standardize_label(val):
        s = str(val).strip().lower()
        if s in ["sif", "sif-potential", "yes", "1", "true", "sif_potential"]:
            return "SIF-potential"
        elif s in ["non-sif", "non-sif-potential", "no", "0", "false", "non_sif_potential"]:
            return "Non-SIF-potential"
        elif s in ["insufficient_information", "insufficient", "unknown"]:
            return "Insufficient Information"
        return str(val).strip()

    df["standard_label"] = df[target_col].apply(standardize_label)

    # 5. Deduplication
    dupes_dropped = 0
    if deduplicate:
        prev_len = len(df)
        df = df.drop_duplicates(subset=[text_col, "standard_label"]).copy()
        dupes_dropped = prev_len - len(df)

    # 6. Apply Text Preprocessing & PII Protection
    df["clean_text"] = df[text_col].apply(lambda t: clean_and_normalize_text(t, mask_leakage=mask_leakage))

    # Remove any rows where cleaning produced empty strings
    df = df[df["clean_text"].str.strip().str.len() > 3].copy()

    # Class distribution analysis
    class_counts = df["standard_label"].value_counts().to_dict()

    metadata = {
        "filepath": str(filepath),
        "data_source": data_source,
        "raw_count": raw_count,
        "valid_count": len(df),
        "nulls_dropped": nulls_dropped,
        "duplicates_dropped": dupes_dropped,
        "is_small_dataset": is_small_dataset,
        "dataset_warning": dataset_warning,
        "schema_validation": schema_info,
        "class_distribution": class_counts,
        "text_column_used": text_col,
        "target_column_used": target_col,
    }

    return df, metadata


def split_safety_data(
    df: pd.DataFrame,
    text_col: str = "clean_text",
    target_col: str = "standard_label",
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    random_state: int = 42
) -> Dict[str, Any]:
    """
    Performs stratified Train / Validation / Test split.
    Guarantees no data leakage between train and test splits.
    """
    assert abs((train_ratio + val_ratio + test_ratio) - 1.0) < 1e-5, "Ratios must sum to 1.0"

    # Step 1: Split train and temp (val + test)
    temp_ratio = val_ratio + test_ratio
    train_df, temp_df = train_test_split(
        df,
        test_size=temp_ratio,
        stratify=df[target_col],
        random_state=random_state
    )

    # Step 2: Split temp into val and test
    relative_test_ratio = test_ratio / temp_ratio
    val_df, test_df = train_test_split(
        temp_df,
        test_size=relative_test_ratio,
        stratify=temp_df[target_col],
        random_state=random_state
    )

    # Verify no description overlap across splits (Data Leakage Protection)
    train_texts = set(train_df[text_col].str.lower())
    test_texts = set(test_df[text_col].str.lower())
    overlap = train_texts.intersection(test_texts)
    
    if overlap:
        # Purge overlapping text from test to enforce zero leakage
        test_df = test_df[~test_df[text_col].str.lower().isin(overlap)].copy()

    split_info = {
        "train_size": len(train_df),
        "val_size": len(val_df),
        "test_size": len(test_df),
        "train_class_dist": train_df[target_col].value_counts().to_dict(),
        "val_class_dist": val_df[target_col].value_counts().to_dict(),
        "test_class_dist": test_df[target_col].value_counts().to_dict(),
        "leakage_overlap_removed": len(overlap)
    }

    return {
        "train": train_df,
        "val": val_df,
        "test": test_df,
        "info": split_info
    }
