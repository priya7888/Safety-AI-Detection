"""
Model Training Script for SIF (Serious Injury and Fatality) Potential Prediction
GitHub Issue #9: Train ML models accurately

Target:
- sif_potential ('SIF-potential' vs 'Non-SIF-potential')

Features:
- report_type, location, activity, barrier_failure, observed_severity, life_saving_rule

Excluded:
- report_id, date, report_text, data_source (avoiding leakage/metadata bias)
"""

import os
import sys
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
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
MODEL_OUTPUT_PATH = PROJECT_ROOT / "ml" / "models" / "sif_sif_potential_model.joblib"
RESULTS_OUTPUT_PATH = PROJECT_ROOT / "ml" / "results" / "sif_model_results.txt"

# Ensure output directories exist
MODEL_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
RESULTS_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

# Define feature columns and target column
FEATURE_COLS = [
    "report_type",
    "location",
    "activity",
    "barrier_failure",
    "observed_severity",
    "life_saving_rule",
]
TARGET_COL = "sif_potential"

# Explicitly excluded columns to avoid target leakage and identifier bias
EXCLUDED_COLS = [
    "report_id",
    "date",
    "report_text",
    "data_source",
]


def load_and_validate_data(csv_path: Path):
    """
    Loads dataset from CSV and validates existence of necessary feature and target columns.
    """
    if not csv_path.exists():
        raise FileNotFoundError(f"Dataset file not found at: {csv_path}")

    print(f"[INFO] Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"[INFO] Dataset loaded successfully. Shape: {df.shape}")

    # Validate feature columns exist
    missing_features = [col for col in FEATURE_COLS if col not in df.columns]
    if missing_features:
        raise ValueError(f"Missing required feature columns in dataset: {missing_features}")

    # Validate target column exists
    if TARGET_COL not in df.columns:
        raise ValueError(f"Target column '{TARGET_COL}' not found in dataset.")

    # Validate target values
    unique_targets = set(df[TARGET_COL].dropna().unique())
    expected_targets = {"SIF-potential", "Non-SIF-potential"}
    if not expected_targets.issubset(unique_targets):
        print(f"[WARNING] Expected targets {expected_targets}, found: {unique_targets}")

    print(f"[INFO] Required columns verified:")
    print(f"       Features ({len(FEATURE_COLS)}): {FEATURE_COLS}")
    print(f"       Target: '{TARGET_COL}' with distribution:")
    for cls, count in df[TARGET_COL].value_counts().items():
        print(f"         - {cls}: {count} ({count / len(df):.2%})")

    return df


def build_pipeline(classifier, random_state: int = 42):
    """
    Constructs a scikit-learn Pipeline with ColumnTransformer and OneHotEncoder.
    - handle_unknown='ignore' ensures safe inference when new categorical categories appear.
    - Preprocessing is fitted ONLY on training data through the pipeline.
    """
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                FEATURE_COLS,
            )
        ],
        remainder="drop",
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", classifier),
        ]
    )
    return pipeline


def evaluate_model(name: str, pipeline: Pipeline, X_test: pd.DataFrame, y_test: pd.Series):
    """
    Evaluates the model against test set and computes accuracy, precision, recall,
    F1-score (weighted and per-class), confusion matrix, and full classification report.
    """
    y_pred = pipeline.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec_weighted = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec_weighted = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1_weighted = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    # Class-specific metrics for 'SIF-potential'
    prec_sif = precision_score(y_test, y_pred, pos_label="SIF-potential", zero_division=0)
    rec_sif = recall_score(y_test, y_pred, pos_label="SIF-potential", zero_division=0)
    f1_sif = f1_score(y_test, y_pred, pos_label="SIF-potential", zero_division=0)

    labels = ["SIF-potential", "Non-SIF-potential"]
    cm = confusion_matrix(y_test, y_pred, labels=labels)
    report = classification_report(y_test, y_pred, digits=4, zero_division=0)

    results = {
        "name": name,
        "accuracy": acc,
        "precision_weighted": prec_weighted,
        "recall_weighted": rec_weighted,
        "f1_weighted": f1_weighted,
        "precision_sif": prec_sif,
        "recall_sif": rec_sif,
        "f1_sif": f1_sif,
        "confusion_matrix": cm,
        "labels": labels,
        "classification_report": report,
    }
    return results


def format_results_block(res: dict) -> str:
    """Formats model evaluation metrics as a readable block of text."""
    cm = res["confusion_matrix"]
    labels = res["labels"]
    block = []
    block.append("=" * 60)
    block.append(f"Model: {res['name']}")
    block.append("=" * 60)
    block.append(f"Overall Accuracy:       {res['accuracy']:.4f} ({res['accuracy']*100:.2f}%)")
    block.append(f"Weighted F1-Score:      {res['f1_weighted']:.4f}")
    block.append(f"Weighted Precision:     {res['precision_weighted']:.4f}")
    block.append(f"Weighted Recall:        {res['recall_weighted']:.4f}")
    block.append("-" * 60)
    block.append("SIF-potential Class Focus:")
    block.append(f"  Precision:            {res['precision_sif']:.4f}")
    block.append(f"  Recall:               {res['recall_sif']:.4f}")
    block.append(f"  F1-Score:             {res['f1_sif']:.4f}")
    block.append("-" * 60)
    block.append("Confusion Matrix (rows: actual, cols: predicted):")
    block.append(f"  Labels: {labels}")
    block.append(f"  [[{cm[0][0]:>5} (TP: SIF),     {cm[0][1]:>5} (FN: SIF->Non)]")
    block.append(f"   [{cm[1][0]:>5} (FP: Non->SIF), {cm[1][1]:>5} (TN: Non)]]")
    block.append("-" * 60)
    block.append("Classification Report:")
    block.append(res["classification_report"])
    block.append("")
    return "\n".join(block)


def main():
    random_state = 42

    # Step 1: Load and validate dataset
    df = load_and_validate_data(DATA_PATH)

    # Step 2: Separate features (X) and target (y)
    # Note: report_text and other non-feature columns are excluded to prevent target leakage
    X = df[FEATURE_COLS]
    y = df[TARGET_COL]

    # Step 3: Train / Test Split (80/20 Stratified Split)
    print("\n[INFO] Performing 80/20 stratified train/test split...")
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=random_state,
        stratify=y,
    )
    print(f"[INFO] Train samples: {len(X_train)} | Test samples: {len(X_test)}")

    # Step 4: Define candidate models within Pipelines
    # Preprocessing (OneHotEncoder) is handled inside the Pipeline
    candidate_pipelines = {
        "Logistic Regression": build_pipeline(
            LogisticRegression(
                random_state=random_state,
                max_iter=1000,
                class_weight="balanced",
            ),
            random_state=random_state,
        ),
        "Random Forest Classifier": build_pipeline(
            RandomForestClassifier(
                n_estimators=100,
                random_state=random_state,
                class_weight="balanced",
                n_jobs=-1,
            ),
            random_state=random_state,
        ),
    }

    # Step 5: Train and evaluate each candidate model
    evaluation_records = {}
    formatted_output_blocks = []

    print("\n[INFO] Training and evaluating candidate models...")
    for model_name, pipeline in candidate_pipelines.items():
        print(f"\n---> Training {model_name}...")
        # Fitting pipeline fits both the preprocessor and the classifier on train data ONLY
        pipeline.fit(X_train, y_train)

        print(f"---> Evaluating {model_name} on held-out test split...")
        eval_res = evaluate_model(model_name, pipeline, X_test, y_test)
        evaluation_records[model_name] = (eval_res, pipeline)

        output_block = format_results_block(eval_res)
        formatted_output_blocks.append(output_block)
        print(output_block)

    # Step 6: Select best model primarily based on F1-score
    # We compare weighted F1-score (which accounts for harmonic mean across both classes)
    # and SIF-potential F1-score
    best_model_name = None
    best_f1 = -1.0
    best_pipeline = None

    for model_name, (eval_res, pipeline) in evaluation_records.items():
        # Selection criterion: weighted F1-score
        score = eval_res["f1_weighted"]
        if score > best_f1:
            best_f1 = score
            best_model_name = model_name
            best_pipeline = pipeline

    best_res = evaluation_records[best_model_name][0]
    selection_summary = (
        f"============================================================\n"
        f"MODEL SELECTION DECISION\n"
        f"============================================================\n"
        f"Selected Model:       {best_model_name}\n"
        f"Primary Metric:       Weighted F1-Score = {best_res['f1_weighted']:.4f}\n"
        f"SIF Class F1-Score:   {best_res['f1_sif']:.4f}\n"
        f"Test Accuracy:        {best_res['accuracy']:.4f}\n"
        f"Selection Rationale:  The model was selected primarily based on F1-score\n"
        f"                      (harmonic mean of precision & recall) rather than\n"
        f"                      accuracy alone, ensuring robust identification of\n"
        f"                      high-consequence SIF events while minimizing false\n"
        f"                      negatives.\n"
        f"============================================================\n"
    )

    print(selection_summary)

    # Step 7: Test unknown category handling (safety verification)
    print("[INFO] Verifying unknown categorical value handling on best pipeline...")
    sample_unknown = pd.DataFrame([
        {
            "report_type": "Unknown-Report-Type",
            "location": "Never-Before-Seen-Location",
            "activity": "unregistered activity",
            "barrier_failure": "novel barrier",
            "observed_severity": "Moderate",
            "life_saving_rule": "Unspecified Rule",
        }
    ])
    try:
        sample_pred = best_pipeline.predict(sample_unknown)
        sample_proba = (
            best_pipeline.predict_proba(sample_unknown)
            if hasattr(best_pipeline, "predict_proba")
            else None
        )
        print(f"[INFO] Safe inference check passed.")
        print(f"       Prediction for novel inputs: {sample_pred[0]}")
        if sample_proba is not None:
            classes = best_pipeline.classes_
            probs_str = ", ".join([f"{c}: {p:.2%}" for c, p in zip(classes, sample_proba[0])])
            print(f"       Class probabilities: {probs_str}")
    except Exception as e:
        print(f"[ERROR] Failed inference with unknown category: {e}")
        raise

    # Step 8: Save best model to ml/models/sif_sif_potential_model.joblib
    print(f"\n[INFO] Saving best pipeline to: {MODEL_OUTPUT_PATH}")
    joblib.dump(best_pipeline, MODEL_OUTPUT_PATH)
    print(f"[INFO] Model artifact successfully saved.")

    # Step 9: Save evaluation results to ml/results/sif_model_results.txt
    print(f"[INFO] Saving detailed evaluation results to: {RESULTS_OUTPUT_PATH}")
    header = (
        "SIF POTENTIAL MODEL EVALUATION REPORT\n"
        f"Generated from: {DATA_PATH}\n"
        f"Random State: {random_state} | Train/Test Split: 80/20 Stratified\n"
        f"Features Used: {', '.join(FEATURE_COLS)}\n"
        f"Excluded Features (Leakage Prevention): {', '.join(EXCLUDED_COLS)}\n\n"
    )
    full_report_text = header + "\n\n".join(formatted_output_blocks) + "\n" + selection_summary

    with open(RESULTS_OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(full_report_text)
    print(f"[INFO] Results successfully written to {RESULTS_OUTPUT_PATH}")
    print("[INFO] Training and evaluation complete.")


if __name__ == "__main__":
    main()
