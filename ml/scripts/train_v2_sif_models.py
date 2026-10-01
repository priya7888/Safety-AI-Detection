"""
ML Model Training and Evaluation on SIF Dataset V2
GitHub Issue #9: Train ML models accurately

Dataset:
ml/data/sif_dataset_v2.csv

Target:
sif_potential ('SIF-potential' vs 'Non-SIF-potential')

Models Trained:
1. Structured Logistic Regression (OneHotEncoder + LogisticRegression)
2. Structured Random Forest (OneHotEncoder + RandomForestClassifier)
3. NLP Text Classifier (TfidfVectorizer + LogisticRegression on report_text)

Evaluation:
- Accuracy, Precision, Recall, F1, Weighted Precision/Recall/F1
- Confusion Matrix & Full Classification Report
- Training vs Testing Overfitting Cross-Check
- Selection based primarily on Weighted F1 & SIF Recall
"""

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
from sklearn.feature_extraction.text import TfidfVectorizer
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
DATA_PATH = PROJECT_ROOT / "ml" / "data" / "sif_dataset_v2.csv"
MODELS_DIR = PROJECT_ROOT / "ml" / "models"
RESULTS_DIR = PROJECT_ROOT / "ml" / "results"

MODELS_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

RESULTS_FILE = RESULTS_DIR / "sif_v2_model_results.txt"

# Feature definitions
TARGET_COL = "sif_potential"
SIF_CLASS = "SIF-potential"
NON_SIF_CLASS = "Non-SIF-potential"
EVAL_LABELS = [SIF_CLASS, NON_SIF_CLASS]

STRUCTURED_FEATURES = [
    "report_type",
    "location",
    "activity",
    "barrier_failure",
    "observed_severity",
    "life_saving_rule",
]
TEXT_FEATURE = "report_text"


def load_and_validate_data(path: Path) -> pd.DataFrame:
    """Loads and validates sif_dataset_v2.csv."""
    if not path.exists():
        raise FileNotFoundError(f"V2 Dataset not found at: {path}")

    print(f"[INFO] Loading dataset from: {path}")
    df = pd.read_csv(path)
    num_rows, num_cols = df.shape
    print(f"[INFO] Dataset loaded: {num_rows:,} rows, {num_cols} columns.")

    # Validation: Exactly 15,000 rows
    if num_rows != 15000:
        raise ValueError(f"Expected exactly 15,000 rows, found {num_rows:,}")

    # Validation: Target column exists and no nulls
    if TARGET_COL not in df.columns:
        raise ValueError(f"Target column '{TARGET_COL}' not in dataset.")
    target_nulls = df[TARGET_COL].isna().sum()
    if target_nulls > 0:
        raise ValueError(f"Found {target_nulls} missing values in target column.")

    # Validation: Exactly two target classes
    unique_classes = sorted(list(df[TARGET_COL].unique()))
    if unique_classes != [NON_SIF_CLASS, SIF_CLASS]:
        raise ValueError(f"Expected classes {[NON_SIF_CLASS, SIF_CLASS]}, found {unique_classes}")

    print(f"[INFO] Target verification passed:")
    for cls in unique_classes:
        cnt = (df[TARGET_COL] == cls).sum()
        print(f"       - {cls}: {cnt:,} ({cnt/num_rows:.2%})")

    # Verify structured features and text column
    for col in STRUCTURED_FEATURES + [TEXT_FEATURE]:
        if col not in df.columns:
            raise ValueError(f"Required column '{col}' missing from dataset.")

    return df


def evaluate_model_performance(name: str, pipeline, X_train, y_train, X_test, y_test, model_file_name: str) -> dict:
    """
    Evaluates both training and test performance to calculate all metrics,
    generate confusion matrices, classification reports, and check for overfitting.
    """
    # Predict on test set
    y_pred_test = pipeline.predict(X_test)
    test_acc = accuracy_score(y_test, y_pred_test)
    test_prec_w = precision_score(y_test, y_pred_test, average="weighted", zero_division=0)
    test_rec_w = recall_score(y_test, y_pred_test, average="weighted", zero_division=0)
    test_f1_w = f1_score(y_test, y_pred_test, average="weighted", zero_division=0)

    # Positive class (SIF-potential) specific metrics
    test_prec_sif = precision_score(y_test, y_pred_test, pos_label=SIF_CLASS, zero_division=0)
    test_rec_sif = recall_score(y_test, y_pred_test, pos_label=SIF_CLASS, zero_division=0)
    test_f1_sif = f1_score(y_test, y_pred_test, pos_label=SIF_CLASS, zero_division=0)

    cm = confusion_matrix(y_test, y_pred_test, labels=EVAL_LABELS)
    clf_report = classification_report(y_test, y_pred_test, digits=4, zero_division=0)

    # Predict on train set for overfitting cross-check
    y_pred_train = pipeline.predict(X_train)
    train_acc = accuracy_score(y_train, y_pred_train)
    train_f1_w = f1_score(y_train, y_pred_train, average="weighted", zero_division=0)
    train_rec_sif = recall_score(y_train, y_pred_train, pos_label=SIF_CLASS, zero_division=0)

    acc_gap = (train_acc - test_acc) * 100.0
    f1_gap = (train_f1_w - test_f1_w) * 100.0
    is_overfitting = (acc_gap > 10.0 or f1_gap > 10.0)

    model_path = MODELS_DIR / model_file_name

    return {
        "name": name,
        "pipeline": pipeline,
        "model_file": model_path,
        "test_acc": test_acc,
        "test_prec_w": test_prec_w,
        "test_rec_w": test_rec_w,
        "test_f1_w": test_f1_w,
        "test_prec_sif": test_prec_sif,
        "test_rec_sif": test_rec_sif,
        "test_f1_sif": test_f1_sif,
        "cm": cm,
        "clf_report": clf_report,
        "train_acc": train_acc,
        "train_f1_w": train_f1_w,
        "train_rec_sif": train_rec_sif,
        "acc_gap": acc_gap,
        "f1_gap": f1_gap,
        "is_overfitting": is_overfitting,
    }


def main():
    random_state = 42

    # Step 1: Load and validate V2 dataset
    df = load_and_validate_data(DATA_PATH)

    # Step 2: Stratified 80/20 train/test split
    print(f"\n[INFO] Splitting dataset into 80% train / 20% test (stratified, random_state={random_state})...")
    y = df[TARGET_COL]

    # Indices split to keep structured and text data perfectly aligned
    train_idx, test_idx = train_test_split(
        df.index,
        test_size=0.20,
        random_state=random_state,
        stratify=y,
    )

    y_train = y.loc[train_idx]
    y_test = y.loc[test_idx]

    # Structured features
    X_train_struct = df.loc[train_idx, STRUCTURED_FEATURES]
    X_test_struct = df.loc[test_idx, STRUCTURED_FEATURES]

    # Text feature
    X_train_text = df.loc[train_idx, TEXT_FEATURE]
    X_test_text = df.loc[test_idx, TEXT_FEATURE]

    print(f"[INFO] Train samples: {len(train_idx):,} | Test samples: {len(test_idx):,}")

    # Step 3: Structured Data Preprocessor (fitted strictly through Pipeline)
    structured_preprocessor = ColumnTransformer(
        transformers=[
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                STRUCTURED_FEATURES,
            )
        ],
        remainder="drop",
    )

    # Step 4: Define Pipelines
    models_to_train = [
        {
            "name": "Structured Logistic Regression",
            "type": "structured",
            "pipeline": Pipeline(
                steps=[
                    ("preprocessor", structured_preprocessor),
                    (
                        "classifier",
                        LogisticRegression(
                            random_state=random_state,
                            max_iter=1000,
                            class_weight="balanced",
                        ),
                    ),
                ]
            ),
            "file": "sif_v2_structured_logistic_regression.joblib",
        },
        {
            "name": "Structured Random Forest",
            "type": "structured",
            "pipeline": Pipeline(
                steps=[
                    ("preprocessor", structured_preprocessor),
                    (
                        "classifier",
                        RandomForestClassifier(
                            n_estimators=100,
                            random_state=random_state,
                            class_weight="balanced",
                            n_jobs=-1,
                        ),
                    ),
                ]
            ),
            "file": "sif_v2_structured_random_forest.joblib",
        },
        {
            "name": "NLP Text TF-IDF + Logistic Regression",
            "type": "text",
            "pipeline": Pipeline(
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
            ),
            "file": "sif_v2_text_tfidf_logistic_regression.joblib",
        },
    ]

    # Step 5: Fit, Evaluate, and Save each model
    results_list = []
    print("\n[INFO] Beginning model training and evaluation...")

    for model_info in models_to_train:
        m_name = model_info["name"]
        pipeline = model_info["pipeline"]
        m_type = model_info["type"]
        m_file = model_info["file"]

        print(f"\n---> Training: {m_name}...")
        if m_type == "structured":
            pipeline.fit(X_train_struct, y_train)
            res = evaluate_model_performance(
                m_name, pipeline, X_train_struct, y_train, X_test_struct, y_test, m_file
            )
        else:
            pipeline.fit(X_train_text, y_train)
            res = evaluate_model_performance(
                m_name, pipeline, X_train_text, y_train, X_test_text, y_test, m_file
            )

        # Save model artifact
        joblib.dump(pipeline, res["model_file"])
        print(f"     [SAVED] {res['model_file'].name}")
        results_list.append(res)

    # Step 6: Model Selection based on Weighted F1 and SIF Recall
    best_res = None
    best_f1 = -1.0
    for r in results_list:
        if r["test_f1_w"] > best_f1:
            best_f1 = r["test_f1_w"]
            best_res = r

    # Step 7: Format Detailed Results Report for Disk
    report_lines = []
    report_lines.append("=" * 80)
    report_lines.append(" SIF DATASET V2 MACHINE LEARNING MODEL EVALUATION REPORT")
    report_lines.append("=" * 80)
    report_lines.append(f"Data Source:            {DATA_PATH}")
    report_lines.append(f"Total Records:          15,000")
    report_lines.append(f"Train Split:            12,000 (80.0%, Stratified)")
    report_lines.append(f"Test Split:             3,000 (20.0%, Stratified)")
    report_lines.append(f"Random State:           {random_state}")
    report_lines.append(f"Structured Features:    {', '.join(STRUCTURED_FEATURES)}")
    report_lines.append(f"Text Feature:           {TEXT_FEATURE}")
    report_lines.append("")

    for r in results_list:
        report_lines.append("-" * 80)
        report_lines.append(f"MODEL: {r['name']}")
        report_lines.append(f"Saved Artifact: {r['model_file']}")
        report_lines.append("-" * 80)
        report_lines.append("Test Set Performance:")
        report_lines.append(f"  Accuracy:             {r['test_acc']:.4f} ({r['test_acc']*100:.2f}%)")
        report_lines.append(f"  Weighted Precision:   {r['test_prec_w']:.4f}")
        report_lines.append(f"  Weighted Recall:      {r['test_rec_w']:.4f}")
        report_lines.append(f"  Weighted F1-Score:    {r['test_f1_w']:.4f}")
        report_lines.append("SIF-potential Specific Focus:")
        report_lines.append(f"  Precision:            {r['test_prec_sif']:.4f}")
        report_lines.append(f"  Recall:               {r['test_rec_sif']:.4f}")
        report_lines.append(f"  F1-Score:             {r['test_f1_sif']:.4f}")
        report_lines.append("Overfitting Cross-Check (Train vs Test):")
        report_lines.append(f"  Train Accuracy:       {r['train_acc']:.4f}  |  Test Accuracy:    {r['test_acc']:.4f}  (Gap: {r['acc_gap']:+.2f}%)")
        report_lines.append(f"  Train Weighted F1:    {r['train_f1_w']:.4f}  |  Test Weighted F1: {r['test_f1_w']:.4f}  (Gap: {r['f1_gap']:+.2f}%)")
        if r["is_overfitting"]:
            report_lines.append(f"  [OVERFITTING WARNING] Training score is noticeably higher than test score by {r['acc_gap']:.1f}% accuracy.")
        else:
            report_lines.append("  [HEALTHY] Model generalizes consistently between train and test splits.")
        report_lines.append("Confusion Matrix (rows: actual, cols: predicted):")
        report_lines.append(f"  Labels: {EVAL_LABELS}")
        cm = r["cm"]
        report_lines.append(f"  [[{cm[0][0]:>5} (TP: SIF),     {cm[0][1]:>5} (FN: SIF->Non)]")
        report_lines.append(f"   [{cm[1][0]:>5} (FP: Non->SIF), {cm[1][1]:>5} (TN: Non)]]")
        report_lines.append("Classification Report:")
        report_lines.append(r["clf_report"])
        report_lines.append("")

    report_lines.append("=" * 80)
    report_lines.append("MODEL SELECTION DECISION")
    report_lines.append("=" * 80)
    report_lines.append(f"Selected Best Model:    {best_res['name']}")
    report_lines.append(f"Best Weighted F1:       {best_res['test_f1_w']:.4f}")
    report_lines.append(f"SIF-potential Recall:   {best_res['test_rec_sif']:.4f} ({best_res['test_rec_sif']*100:.2f}%)")
    report_lines.append(f"Model Artifact File:    {best_res['model_file']}")
    report_lines.append("Selection Rationale:    Selected primarily on Weighted F1-score (harmonic mean across")
    report_lines.append("                        both classes) and high recall on the critical SIF-potential class,")
    report_lines.append("                        which is paramount for minimizing undetected severe hazards.")
    report_lines.append("")
    report_lines.append("=" * 80)
    report_lines.append("IMPORTANT SAFETY DATA DISCLAIMER")
    report_lines.append("=" * 80)
    report_lines.append("Model performance is measured on synthetic V2 data and does not represent")
    report_lines.append("validated real-world safety performance.")
    report_lines.append("Do not claim that the model is production-ready or perfectly accurate.")
    report_lines.append("=" * 80)

    full_report_text = "\n".join(report_lines)
    with open(RESULTS_FILE, "w", encoding="utf-8") as f:
        f.write(full_report_text)
    print(f"\n[INFO] Detailed evaluation report saved to: {RESULTS_FILE}")

    # Step 8: Final Console Output (Formatted Table & Summary)
    print("\n" + "=" * 90)
    print(f"{'Model':<40} | {'Accuracy':<8} | {'Precision':<9} | {'Recall':<6} | {'F1':<6} | {'Weighted F1':<11}")
    print("-" * 90)
    for r in results_list:
        # Precision/Recall/F1 for SIF class, followed by Weighted F1
        print(
            f"{r['name']:<40} | "
            f"{r['test_acc']:>8.4f} | "
            f"{r['test_prec_sif']:>9.4f} | "
            f"{r['test_rec_sif']:>6.4f} | "
            f"{r['test_f1_sif']:>6.4f} | "
            f"{r['test_f1_w']:>11.4f}"
        )
    print("-" * 90)

    # Overfitting notes
    print("\nOverfitting Cross-Check:")
    for r in results_list:
        status_tag = "[POSSIBLE OVERFITTING]" if r["is_overfitting"] else "[WELL GENERALIZED]"
        print(f"  - {r['name']:<38}: Train Acc = {r['train_acc']:.2%}, Test Acc = {r['test_acc']:.2%} (Gap: {r['acc_gap']:+.1f}%) {status_tag}")

    # Disclaimer
    print("\nIMPORTANT SAFETY DATA DISCLAIMER:")
    print("Model performance is measured on synthetic V2 data and does not represent validated real-world safety performance.")

    # Best Model Summary
    print("\nBest Model:")
    print(f"{best_res['name']}")
    print(f"Best Weighted F1:\n{best_res['test_f1_w']:.4f}")
    print(f"SIF Recall:\n{best_res['test_rec_sif']:.4f} ({best_res['test_rec_sif']*100:.2f}%)")
    print(f"Model File:\n{best_res['model_file']}")

    print("\nTRAINING COMPLETE")


if __name__ == "__main__":
    main()
