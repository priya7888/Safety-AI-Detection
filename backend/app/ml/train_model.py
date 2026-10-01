"""
Train the baseline SIF-potential classifier.

Pipeline: text preprocessing -> TF-IDF vectorization -> Logistic Regression.

Run standalone to (re)generate the saved model artifacts:

    python -m app.ml.train_model

This reads app/ml/data/sample_training_data.csv (swap in a larger, real
dataset with the same two columns -- report_text, sif_potential -- to
retrain on better data later without touching any other code).
"""
import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

from app.ml.preprocessing import preprocess_text

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "sample_training_data.csv")
ARTIFACT_DIR = os.path.join(BASE_DIR, "model_artifacts")
VECTORIZER_PATH = os.path.join(ARTIFACT_DIR, "tfidf_vectorizer.joblib")
MODEL_PATH = os.path.join(ARTIFACT_DIR, "sif_classifier.joblib")


def train_and_save(data_path: str = DATA_PATH):
    os.makedirs(ARTIFACT_DIR, exist_ok=True)

    df = pd.read_csv(data_path)
    df = df.dropna(subset=["report_text", "sif_potential"])
    df["clean_text"] = df["report_text"].apply(preprocess_text)

    X = df["clean_text"]
    y = df["sif_potential"].astype(int)

    # Small dataset -> keep the test split small but non-trivial for a sanity check.
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    model = LogisticRegression(max_iter=1000, class_weight="balanced")
    model.fit(X_train_vec, y_train)

    preds = model.predict(X_test_vec)
    print("Validation accuracy:", accuracy_score(y_test, preds))
    print(classification_report(y_test, preds, zero_division=0))

    # Refit on the full dataset for the artifact we actually ship.
    X_full_vec = vectorizer.fit_transform(X)
    model.fit(X_full_vec, y)

    joblib.dump(vectorizer, VECTORIZER_PATH)
    joblib.dump(model, MODEL_PATH)
    print(f"Saved vectorizer to {VECTORIZER_PATH}")
    print(f"Saved model to {MODEL_PATH}")


if __name__ == "__main__":
    train_and_save()
