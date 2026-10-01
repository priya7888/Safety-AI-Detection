"""
SIF ML Inference Module
-----------------------
Standalone inference service for Serious Injury and Fatality (SIF) potential prediction
using the trained NLP pipeline (TF-IDF + Logistic Regression).

Model Artifacts:
- models/sif_classifier/pipeline.joblib
- ml/models/sif_v2_text_tfidf_logistic_regression.joblib

Features:
- Lazy singleton model loading (loaded once, reused for all requests)
- Robust model artifact path resolution across project execution contexts
- Strict validation for None, empty, or non-string inputs
- Class probability extraction via predict_proba()
- Local feature interpretability: extracts top contributing terms and log-odds weights
- Clean dictionary response format without exposing internal filesystem paths
"""

import os
import sys
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
import numpy as np

# Ensure backend directory is in sys.path for joblib unpickling
_current_file = Path(__file__).resolve()
_app_dir = _current_file.parents[1]        # backend/app
_backend_dir = _current_file.parents[2]    # backend
_project_root = _current_file.parents[3]   # project root
for _p in [str(_backend_dir), str(_project_root), str(_app_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

try:
    import joblib
except ImportError:
    joblib = None

logger = logging.getLogger("sif_ml_inference")

# Model configuration constants
MODEL_FILENAME = "pipeline.joblib"
LEGACY_MODEL_FILENAME = "sif_v2_text_tfidf_logistic_regression.joblib"
MODEL_NAME = "sif_tfidf_logistic_regression"
MODEL_VERSION = "2.1.0"

# Module-level singleton container for lazy loading
_MODEL_PIPELINE = None
_MODEL_LOAD_ATTEMPTED = False
_MODEL_LOAD_ERROR: Optional[str] = None


def resolve_model_path() -> Optional[Path]:
    """
    Resolves the absolute path to the trained model artifact across various
    runtime execution contexts.
    """
    env_path = os.environ.get("SIF_MODEL_PATH")
    if env_path:
        p = Path(env_path).resolve()
        if p.is_file():
            return p

    current_file = Path(__file__).resolve()
    try:
        project_root = current_file.parents[3]
    except IndexError:
        project_root = current_file.parent

    candidate_paths = [
        # Primary models directory
        project_root / "models" / "sif_classifier" / MODEL_FILENAME,
        Path.cwd() / "models" / "sif_classifier" / MODEL_FILENAME,
        Path.cwd().parent / "models" / "sif_classifier" / MODEL_FILENAME,
        # Legacy/mirrored models directory
        project_root / "ml" / "models" / LEGACY_MODEL_FILENAME,
        Path.cwd() / "ml" / "models" / LEGACY_MODEL_FILENAME,
        Path.cwd().parent / "ml" / "models" / LEGACY_MODEL_FILENAME,
        project_root / "backend" / "ml" / "models" / LEGACY_MODEL_FILENAME,
    ]

    for candidate in candidate_paths:
        if candidate.is_file():
            return candidate

    return None


def get_model():
    """
    Returns the loaded model pipeline singleton.
    Loads lazily upon the first request with thread-safe simplicity.
    """
    global _MODEL_PIPELINE, _MODEL_LOAD_ATTEMPTED, _MODEL_LOAD_ERROR

    if _MODEL_PIPELINE is not None:
        return _MODEL_PIPELINE

    if _MODEL_LOAD_ATTEMPTED and _MODEL_LOAD_ERROR:
        raise RuntimeError(_MODEL_LOAD_ERROR)

    _MODEL_LOAD_ATTEMPTED = True

    if joblib is None:
        _MODEL_LOAD_ERROR = "joblib is not installed in the environment."
        logger.warning(_MODEL_LOAD_ERROR)
        raise RuntimeError(_MODEL_LOAD_ERROR)

    model_path = resolve_model_path()
    if not model_path:
        _MODEL_LOAD_ERROR = "Model artifact file could not be found in expected directories."
        logger.error(_MODEL_LOAD_ERROR)
        raise FileNotFoundError(_MODEL_LOAD_ERROR)

    try:
        logger.info(f"Loading SIF ML pipeline singleton from: {model_path}...")
        _MODEL_PIPELINE = joblib.load(model_path)
        logger.info("SIF ML pipeline loaded successfully.")
        return _MODEL_PIPELINE
    except Exception as e:
        _MODEL_LOAD_ERROR = f"Failed to load SIF ML model artifact: {str(e)}"
        logger.error(_MODEL_LOAD_ERROR)
        raise RuntimeError(_MODEL_LOAD_ERROR)


def get_contributing_features(pipeline, text: str, top_n: int = 5) -> List[Dict[str, Any]]:
    """
    Extracts the top active terms in the report and their linear contribution weights.
    """
    try:
        tfidf = pipeline.named_steps.get("tfidf") or pipeline.named_steps.get("vectorizer")
        clf = pipeline.named_steps.get("clf") or pipeline.named_steps.get("classifier")

        if not tfidf or not clf or not hasattr(clf, "coef_"):
            return []

        # Vectorize single input
        vec = tfidf.transform([text])
        indices = vec.nonzero()[1]
        feature_names = np.array(tfidf.get_feature_names_out())
        coef = clf.coef_[0]

        contributions = []
        for idx in indices:
            score = float(vec[0, idx] * coef[idx])
            contributions.append({
                "term": str(feature_names[idx]),
                "weight": round(float(coef[idx]), 4),
                "contribution": round(score, 4),
                "indicates_sif": score > 0
            })

        # Sort by magnitude of contribution
        contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
        return contributions[:top_n]
    except Exception as e:
        logger.warning(f"Could not extract contributing features: {e}")
        return []


def predict_sif_potential(report_text: str) -> Dict[str, Any]:
    """
    Performs inference to predict SIF potential from raw report observation text.

    Returns:
        Dict containing:
            - status: "SUCCESS" | "INVALID_INPUT" | "MODEL_UNAVAILABLE" | "ERROR"
            - predicted_class: "SIF-potential" | "Non-SIF-potential" | None
            - confidence: float probability (0.0 to 1.0) | None
            - probabilities: dict of {class_label: float} | None
            - sif_probability: float probability for SIF-potential
            - contributing_features: list of active terms and weights
            - model_name: str
            - model_version: str
    """
    if report_text is None or not isinstance(report_text, str):
        return {
            "status": "INVALID_INPUT",
            "predicted_class": None,
            "confidence": None,
            "probabilities": None,
            "sif_probability": 0.0,
            "contributing_features": [],
            "model_name": MODEL_NAME,
            "model_version": MODEL_VERSION,
            "error": "Report text must be a non-empty string.",
        }

    cleaned_text = report_text.strip()
    if not cleaned_text:
        return {
            "status": "INVALID_INPUT",
            "predicted_class": None,
            "confidence": None,
            "probabilities": None,
            "sif_probability": 0.0,
            "contributing_features": [],
            "model_name": MODEL_NAME,
            "model_version": MODEL_VERSION,
            "error": "Report text cannot be empty or whitespace only.",
        }

    try:
        pipeline = get_model()
    except (FileNotFoundError, RuntimeError) as e:
        return {
            "status": "MODEL_UNAVAILABLE",
            "predicted_class": None,
            "confidence": None,
            "probabilities": None,
            "sif_probability": 0.0,
            "contributing_features": [],
            "model_name": MODEL_NAME,
            "model_version": MODEL_VERSION,
            "error": "Machine learning model service is currently unavailable.",
        }
    except Exception as e:
        return {
            "status": "ERROR",
            "predicted_class": None,
            "confidence": None,
            "probabilities": None,
            "sif_probability": 0.0,
            "contributing_features": [],
            "model_name": MODEL_NAME,
            "model_version": MODEL_VERSION,
            "error": f"Unexpected error accessing machine learning model: {str(e)}",
        }

    try:
        prediction = pipeline.predict([cleaned_text])[0]

        confidence = None
        probabilities = None
        sif_prob = 0.5

        if hasattr(pipeline, "predict_proba"):
            probs = pipeline.predict_proba([cleaned_text])[0]
            classes = getattr(pipeline, "classes_", [])
            if len(classes) == len(probs):
                probabilities = {
                    str(cls_name): round(float(prob), 4)
                    for cls_name, prob in zip(classes, probs)
                }
                confidence = probabilities.get(str(prediction), round(float(max(probs)), 4))
                sif_prob = probabilities.get("SIF-potential", probabilities.get("SIF", 0.5))

        # Extract real feature explanations
        contributing_terms = get_contributing_features(pipeline, cleaned_text, top_n=6)

        return {
            "status": "SUCCESS",
            "predicted_class": str(prediction),
            "confidence": confidence,
            "probabilities": probabilities,
            "sif_probability": sif_prob,
            "contributing_features": contributing_terms,
            "model_name": MODEL_NAME,
            "model_version": MODEL_VERSION,
            "error": None,
        }

    except Exception as e:
        logger.error(f"Prediction failure: {e}")
        return {
            "status": "ERROR",
            "predicted_class": None,
            "confidence": None,
            "probabilities": None,
            "sif_probability": 0.0,
            "contributing_features": [],
            "model_name": MODEL_NAME,
            "model_version": MODEL_VERSION,
            "error": "Failed to complete prediction on the provided text.",
        }


if __name__ == "__main__":
    import json

    print("==========================================================")
    print("SIF ML INFERENCE SERVICE - TEST RUN")
    print(f"Model Name: {MODEL_NAME} | Version: {MODEL_VERSION}")
    print(f"Resolved Model Path: {resolve_model_path()}")
    print("==========================================================")

    test_samples = [
        "High pressure gas release observed from pipeline flange with hissing sound near heater",
        "At front door it is very slippery due to rain water on tile floor",
        "Worker entered confined vessel without atmospheric gas testing or standby attendant",
        "Minor scratch on toolbox handle in workshop housekeeping area"
    ]

    for i, sample in enumerate(test_samples, start=1):
        print(f"\n--- Sample {i} ---")
        print(f"Input Text: \"{sample}\"")
        result = predict_sif_potential(sample)
        print(f"Status: {result.get('status')}")
        print(f"Predicted Class: {result.get('predicted_class')}")
        print(f"Confidence: {result.get('confidence')}")
        print(f"SIF Probability: {result.get('sif_probability')}")
        print(f"Contributing Features: {result.get('contributing_features')}")
        if result.get("error"):
            print(f"Error: {result.get('error')}")

    print("\n==========================================================")
    print("ML INFERENCE EXECUTION COMPLETED SUCCESSFULLY")
    print("==========================================================")

