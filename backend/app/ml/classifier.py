"""
Runtime wrapper around the trained TF-IDF + Logistic Regression model.

Exposes a single `classify(text) -> (bool, float)` function used by the
extraction/analysis pipeline. If saved model artifacts are not found on
disk (e.g. first run, fresh clone), the model is trained automatically
from the bundled sample dataset so the API works out of the box. For a
production system, run `python -m app.ml.train_model` explicitly against
a larger labeled dataset and commit the resulting artifacts instead.
"""
import os
import joblib

from app.ml.preprocessing import preprocess_text
from app.ml import train_model as _train_module

VECTORIZER_PATH = _train_module.VECTORIZER_PATH
MODEL_PATH = _train_module.MODEL_PATH


class SIFClassifier:
    def __init__(self):
        self._vectorizer = None
        self._model = None
        self._load_or_train()

    def _load_or_train(self):
        if os.path.exists(VECTORIZER_PATH) and os.path.exists(MODEL_PATH):
            self._vectorizer = joblib.load(VECTORIZER_PATH)
            self._model = joblib.load(MODEL_PATH)
        else:
            # First run: train from the bundled sample dataset so the
            # app is usable immediately without a manual training step.
            _train_module.train_and_save()
            self._vectorizer = joblib.load(VECTORIZER_PATH)
            self._model = joblib.load(MODEL_PATH)

    def classify(self, text: str):
        """
        Returns (sif_potential: bool, confidence_score: float).

        confidence_score is the model's predicted probability of the
        report belonging to the predicted class (i.e. how confident the
        model is in whichever label it output).
        """
        clean = preprocess_text(text)
        vec = self._vectorizer.transform([clean])
        proba = self._model.predict_proba(vec)[0]  # [P(class0), P(class1)]
        pred_class = int(self._model.classes_[proba.argmax()])
        confidence = float(proba.max())
        return bool(pred_class == 1), round(confidence, 4)


# Module-level singleton so the model is loaded/trained once per process.
_classifier_instance = None


def get_classifier() -> SIFClassifier:
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = SIFClassifier()
    return _classifier_instance
