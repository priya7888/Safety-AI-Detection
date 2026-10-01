"""
IOGP Life-Saving Rules NLP Model Training Script
Problem Statement ID: 26165 (Oil India Limited - SIF Precursor Intelligence)

Objective:
Automatically tag incoming free-text safety incident narratives to the relevant
IOGP Life-Saving Rule (e.g., Energy Isolation, Hot Work, Confined Space, Line of Fire,
Working at Height, Safe Mechanical Lifting, Driving, Bypassing Safety Controls,
Work Authorisation, Other/No Life-Saving Rule).

Dataset:
ml/data/sif_dataset_v2.csv (15,000 rows, with updated Unit 1-4 locations)

Artifacts Produced:
- ml/models/iogp_lsr_model.joblib
- ml/results/iogp_lsr_model_results.txt
"""

import sys
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

# Paths
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
DATA_PATH = PROJECT_ROOT / "ml" / "data" / "sif_dataset_v2.csv"
MODEL_OUTPUT = PROJECT_ROOT / "ml" / "models" / "iogp_lsr_model.joblib"
RESULTS_OUTPUT = PROJECT_ROOT / "ml" / "results" / "iogp_lsr_model_results.txt"

MODEL_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
RESULTS_OUTPUT.parent.mkdir(parents=True, exist_ok=True)

def train_iogp_model():
    print("=" * 80)
    print(" TRAINING IOGP LIFE-SAVING RULE NLP CLASSIFIER (PROBLEM STATEMENT ID 26165)")
    print("=" * 80)
    print(f"[INFO] Loading dataset from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    print(f"[INFO] Total records loaded: {len(df):,}")

    X = df["report_text"]
    y = df["life_saving_rule"]

    unique_rules = sorted(list(y.unique()))
    print(f"[INFO] Found {len(unique_rules)} distinct IOGP rule classes:")
    for r in unique_rules:
        cnt = (y == r).sum()
        print(f"       - {r:<30}: {cnt:,} ({cnt/len(df):.1%})")

    # 80/20 stratified split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[INFO] Train samples: {len(X_train):,} | Test samples: {len(X_test):,}")

    # Build NLP Pipeline: N-gram TF-IDF + Multinomial Logistic Regression
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=10000,
            sublinear_tf=True,
            strip_accents="unicode"
        )),
        ("clf", LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            C=1.5,
            random_state=42
        ))
    ])

    print("[INFO] Fitting IOGP NLP classifier on free-text narratives...")
    pipeline.fit(X_train, y_train)

    # Predictions
    y_pred = pipeline.predict(X_test)
    train_pred = pipeline.predict(X_train)

    train_acc = accuracy_score(y_train, train_pred)
    test_acc = accuracy_score(y_test, y_pred)
    weighted_f1 = f1_score(y_test, y_pred, average="weighted")
    macro_f1 = f1_score(y_test, y_pred, average="macro")
    clf_rep = classification_report(y_test, y_pred)

    print("\n" + "=" * 80)
    print(" EVALUATION RESULTS ON HELD-OUT TEST DATA")
    print("=" * 80)
    print(f"Train Accuracy:        {train_acc:.4f} ({train_acc*100:.2f}%)")
    print(f"Test Accuracy:         {test_acc:.4f} ({test_acc*100:.2f}%)")
    print(f"Weighted F1-Score:     {weighted_f1:.4f}")
    print(f"Macro F1-Score:        {macro_f1:.4f}")
    print("\nDetailed Per-Rule Classification Report:")
    print(clf_rep)

    # Save artifact
    joblib.dump(pipeline, MODEL_OUTPUT)
    print(f"[INFO] Saved IOGP model artifact to: {MODEL_OUTPUT}")

    # Save detailed report to results file
    with open(RESULTS_OUTPUT, "w", encoding="utf-8") as f:
        f.write("=" * 80 + "\n")
        f.write("IOGP LIFE-SAVING RULE NLP CLASSIFIER EVALUATION REPORT\n")
        f.write("Problem Statement ID: 26165 (Oil India Limited)\n")
        f.write("=" * 80 + "\n")
        f.write(f"Model Artifact:    {MODEL_OUTPUT}\n")
        f.write(f"Dataset:           {DATA_PATH} ({len(df):,} rows)\n")
        f.write(f"Train Split:       {len(X_train):,} (80.0%)\n")
        f.write(f"Test Split:        {len(X_test):,} (20.0%)\n")
        f.write(f"Accuracy:          {test_acc:.4f} ({test_acc*100:.2f}%)\n")
        f.write(f"Weighted F1:       {weighted_f1:.4f}\n")
        f.write(f"Macro F1:          {macro_f1:.4f}\n\n")
        f.write("Classification Report:\n")
        f.write(clf_rep + "\n")

    print(f"[INFO] Saved evaluation results to: {RESULTS_OUTPUT}")
    print("=" * 80)

if __name__ == "__main__":
    train_iogp_model()
