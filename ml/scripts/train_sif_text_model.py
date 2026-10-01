"""
Leakage-Controlled NLP Model Training Script for SIF Potential Prediction
GitHub Issue #9: Train ML models accurately

Target:
- sif_potential ('SIF-potential' vs 'Non-SIF-potential')

Input Feature:
- report_text (Free-text incident narratives)

Leakage Mitigation:
Removes / masks explicit target-related wording from report_text prior to TF-IDF vectorization:
- 'SIF potential'
- 'SIF scenario'
- 'credible SIF'
- 'credible high-consequence exposure'
- 'high-consequence exposure'
and closely related variations.
"""

import os
import sys
import re
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)
import joblib

# ==========================================
# 1. Path Configurations
# ==========================================
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
DATA_PATH = PROJECT_ROOT / "ml" / "data" / "sif_dataset.csv"
MODEL_OUTPUT_PATH = PROJECT_ROOT / "ml" / "models" / "sif_text_model.joblib"
RESULTS_OUTPUT_PATH = PROJECT_ROOT / "ml" / "results" / "sif_text_model_results.txt"

# Ensure output directories exist
MODEL_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
RESULTS_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

# Required column names
TEXT_COL = "report_text"
TARGET_COL = "sif_potential"
EXPECTED_CLASSES = ["Non-SIF-potential", "SIF-potential"]

# Explicit target leakage phrases to remove/mask
LEAKAGE_PATTERNS = [
    # Full multi-word template phrases
    r"\bthe condition did not create a credible high[- ]consequence exposure\b",
    r"\bcreating a credible high[- ]consequence exposure\b",
    r"\bno credible sif scenario was identified\b",
    r"\b(?:the\s+)?scenario had credible sif potential\b",
    # Minimum required phrases per specification
    r"\bcredible\s+high[- ]consequence\s+exposure\b",
    r"\bhigh[- ]consequence\s+exposure\b",
    r"\bcredible\s+sif\s+potential\b",
    r"\bcredible\s+sif\s+scenario\b",
    r"\bcredible\s+sif\b",
    r"\bsif\s+potential\b",
    r"\bsif\s+scenario\b",
    # Variants and standalone keywords
    r"\bnon[- ]sif[- ]potential\b",
    r"\bnon[- ]sif\b",
    r"\bsif\b",
    r"\bhigh[- ]consequence\b",
]

# Compile regex pattern with IGNORECASE
LEAKAGE_REGEX = re.compile("|".join(LEAKAGE_PATTERNS), flags=re.IGNORECASE)


def preprocess_report_text(text: str) -> str:
    """
    Leakage-control preprocessing function for report_text.
    Masks explicit target-label wording while retaining operational context
    (activity, location, equipment, failure mode).
    """
    if not isinstance(text, str):
        return ""

    # Mask explicit target phrases with neutral token [MASKED_TARGET]
    masked = LEAKAGE_REGEX.sub(" [MASKED_TARGET] ", text)

    # Normalize whitespace
    cleaned = re.sub(r"\s+", " ", masked).strip()
    return cleaned


def load_and_validate_data(csv_path: Path) -> pd.DataFrame:
    """
    Loads dataset from CSV and validates report_text and sif_potential columns.
    """
    if not csv_path.exists():
        raise FileNotFoundError(f"Dataset not found at: {csv_path}")

    print(f"[INFO] Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"[INFO] Dataset loaded successfully. Shape: {df.shape}")

    # Validate required columns
    if TEXT_COL not in df.columns:
        raise ValueError(f"Required text column '{TEXT_COL}' not found in dataset.")
    if TARGET_COL not in df.columns:
        raise ValueError(f"Required target column '{TARGET_COL}' not found in dataset.")

    # Check missing values
    null_text = df[TEXT_COL].isna().sum()
    null_target = df[TARGET_COL].isna().sum()
    if null_text > 0 or null_target > 0:
        raise ValueError(f"Dataset contains null values: {null_text} in {TEXT_COL}, {null_target} in {TARGET_COL}")

    # Validate target classes
    unique_targets = sorted(list(df[TARGET_COL].unique()))
    print(f"[INFO] Validated text column: '{TEXT_COL}' (0 nulls)")
    print(f"[INFO] Validated target column: '{TARGET_COL}'")
    print(f"[INFO] Exact target classes found: {unique_targets}")
    for cls in unique_targets:
        count = (df[TARGET_COL] == cls).sum()
        pct = (count / len(df)) * 100
        print(f"       - {cls}: {count:,} ({pct:.2f}%)")

    return df


def main():
    random_state = 42

    # Step 1: Load CSV with pandas
    df = load_and_validate_data(DATA_PATH)

    # Step 2: Validate report_text and sif_potential (handled in load_and_validate_data)

    # Step 3: Apply leakage-control preprocessing ONLY to report_text
    print("\n[INFO] Applying leakage-control preprocessing to report_text...")
    cleaned_texts = df[TEXT_COL].apply(preprocess_report_text)

    # Demonstrate sample before and after masking
    print("[INFO] Sample preprocessing comparison (first 2 records):")
    for idx in range(2):
        print(f"  Record {idx + 1} - Raw:     {df[TEXT_COL].iloc[idx]}")
        print(f"  Record {idx + 1} - Cleaned: {cleaned_texts.iloc[idx]}\n")

    X = cleaned_texts
    y = df[TARGET_COL]

    # Step 4: Split into train/test using an 80/20 stratified split with random_state=42
    print("[INFO] Splitting dataset into 80/20 stratified train/test split (random_state=42)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=random_state,
        stratify=y,
    )

    num_train = len(X_train)
    num_test = len(X_test)
    print(f"[INFO] Number of training samples: {num_train:,}")
    print(f"[INFO] Number of test samples:     {num_test:,}")

    # Step 5: Build a Pipeline: TfidfVectorizer + LogisticRegression
    print("\n[INFO] Building pipeline: TfidfVectorizer + LogisticRegression...")
    pipeline = Pipeline(
        steps=[
            (
                "tfidf",
                TfidfVectorizer(
                    ngram_range=(1, 2),
                    max_features=5000,
                    sublinear_tf=True,
                ),
            ),
            (
                "classifier",
                LogisticRegression(
                    random_state=random_state,
                    max_iter=1000,
                    class_weight="balanced",
                ),
            ),
        ]
    )

    # Step 6: Fit only on the training data
    print("[INFO] Fitting pipeline ONLY on training data (preventing leakage)...")
    pipeline.fit(X_train, y_train)

    # Extract pipeline metadata
    vectorizer = pipeline.named_steps["tfidf"]
    classifier = pipeline.named_steps["classifier"]
    num_tfidf_features = len(vectorizer.get_feature_names_out())
    target_classes = list(classifier.classes_)

    print(f"[INFO] Number of TF-IDF features extracted: {num_tfidf_features:,}")
    print(f"[INFO] Target classes in model:             {target_classes}")

    # Step 7: Evaluate on the held-out test data
    print("\n[INFO] Evaluating model on held-out test data...")
    y_pred = pipeline.predict(X_test)

    # Step 8: Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    prec_weighted = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec_weighted = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1_weighted = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    # Specific metrics for positive class 'SIF-potential'
    prec_sif = precision_score(y_test, y_pred, pos_label="SIF-potential", zero_division=0)
    rec_sif = recall_score(y_test, y_pred, pos_label="SIF-potential", zero_division=0)
    f1_sif = f1_score(y_test, y_pred, pos_label="SIF-potential", zero_division=0)

    eval_labels = ["SIF-potential", "Non-SIF-potential"]
    cm = confusion_matrix(y_test, y_pred, labels=eval_labels)
    clf_report = classification_report(y_test, y_pred, digits=4, zero_division=0)

    # Prepare readable output text
    results_text = []
    results_text.append("=" * 70)
    results_text.append("LEAKAGE-CONTROLLED SIF TEXT MODEL EVALUATION REPORT")
    results_text.append("=" * 70)
    results_text.append(f"Model Architecture:          Pipeline(TfidfVectorizer + LogisticRegression)")
    results_text.append(f"Data Source:                 {DATA_PATH}")
    results_text.append(f"Random State:                {random_state}")
    results_text.append(f"Number of Training Samples:  {num_train:,}")
    results_text.append(f"Number of Test Samples:      {num_test:,}")
    results_text.append(f"Number of TF-IDF Features:   {num_tfidf_features:,}")
    results_text.append(f"Target Classes:              {target_classes}")
    results_text.append("-" * 70)
    results_text.append("Overall Metrics on Held-out Test Data:")
    results_text.append(f"  - Accuracy:                {accuracy:.4f} ({accuracy * 100:.2f}%)")
    results_text.append(f"  - Weighted Precision:       {prec_weighted:.4f}")
    results_text.append(f"  - Weighted Recall:          {rec_weighted:.4f}")
    results_text.append(f"  - Weighted F1-Score:        {f1_weighted:.4f}")
    results_text.append("-" * 70)
    results_text.append("SIF-potential Specific Metrics:")
    results_text.append(f"  - Precision:               {prec_sif:.4f}")
    results_text.append(f"  - Recall:                  {rec_sif:.4f}")
    results_text.append(f"  - F1-Score:                {f1_sif:.4f}")
    results_text.append("-" * 70)
    results_text.append("Confusion Matrix (rows: actual, cols: predicted):")
    results_text.append(f"  Labels: {eval_labels}")
    results_text.append(f"  [[{cm[0][0]:>5} (TP: SIF),     {cm[0][1]:>5} (FN: SIF->Non)]")
    results_text.append(f"   [{cm[1][0]:>5} (FP: Non->SIF), {cm[1][1]:>5} (TN: Non)]]")
    results_text.append("-" * 70)
    results_text.append("Classification Report:")
    results_text.append(clf_report)
    results_text.append("-" * 70)
    results_text.append("CRITICAL REAL-WORLD PERFORMANCE & ACCURACY NOTE:")
    results_text.append("  Although the model demonstrates high performance metrics on this synthetic")
    results_text.append("  benchmark test split due to consistent phrasing patterns generated in the")
    results_text.append("  prototype dataset (e.g. 'housekeeping issue was observed', 'personnel were")
    results_text.append("  exposed', 'loss of control'), we DO NOT claim that this NLP model is")
    results_text.append("  perfectly accurate.")
    results_text.append("  In real-world operations, human-authored safety incident reports exhibit")
    results_text.append("  substantial linguistic diversity, varied terminology, spelling errors,")
    results_text.append("  and colloquial shorthand that will lead to real-world classification errors.")
    results_text.append("=" * 70)

    full_results_str = "\n".join(results_text)

    # Step 11: Print all results clearly
    print("\n" + full_results_str + "\n")

    # Step 9: Save the trained pipeline to ml/models/sif_text_model.joblib
    print(f"[INFO] Saving trained pipeline to: {MODEL_OUTPUT_PATH}")
    joblib.dump(pipeline, MODEL_OUTPUT_PATH)
    print(f"[INFO] Successfully saved pipeline to {MODEL_OUTPUT_PATH}")

    # Step 10: Save results to ml/results/sif_text_model_results.txt
    print(f"[INFO] Saving evaluation results to: {RESULTS_OUTPUT_PATH}")
    with open(RESULTS_OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(full_results_str + "\n")
    print(f"[INFO] Successfully saved evaluation report to {RESULTS_OUTPUT_PATH}")
    print("[INFO] Execution completed successfully.")


if __name__ == "__main__":
    main()
