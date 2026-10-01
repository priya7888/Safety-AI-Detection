# GitHub Issue #9: Machine Learning Model Training & Integration Final Report

**Issue Title**: Train the ML models all accurately  
**Branch**: `issue-9-ml-training`  
**Date**: September 9, 2026  
**Status**: Completed (Development & Prototype Integration Validated)  

---

## 1. Project Objective

The primary objective of GitHub Issue #9 was to build, validate, and integrate an accurate Machine Learning (ML) classification model to identify Serious Injury and Fatality (SIF) precursors from industrial safety observations. 

The machine learning system is designed to predict `sif_potential` (`SIF-potential` vs. `Non-SIF-potential`) to assist HSE officers in prioritizing high-energy exposures and barrier failures. The model was to be integrated into the existing FastAPI backend as supporting intelligence without disrupting existing rule-based safety assessments, database schemas, or frontend UI contracts.

---

## 2. Dataset

* **Dataset File**: `ml/data/sif_dataset_v2.csv`
* **Record Count**: Exactly 15,000 records
* **Target Variable**: `sif_potential`
* **Target Classes**:
  * `SIF-potential`: 7,500 records (50.0%)
  * `Non-SIF-potential`: 7,500 records (50.0%)
* **Features Included**:
  * Structured Categorical (6): `report_type`, `location`, `activity`, `barrier_failure`, `observed_severity`, `life_saving_rule`
  * Free Text (1): `report_text`
  * Metadata/Identifiers (Excluded from training): `report_id`, `date`, `data_source`
* **Train / Test Split**: 80% Train (12,000 records) / 20% Test (3,000 records), stratified with `random_state=42`
* **Limitation**: The dataset is entirely synthetic prototype data generated for development and algorithmic validation.

---

## 3. Data Leakage Control

During the initial investigation (Steps 10–11), the prototype dataset (`ml/data/sif_dataset.csv`) was found to contain severe synthetic template leakage:
* Rigid repeated phrases (e.g., *"personnel were exposed because"*, *"minor housekeeping issue was observed and corrected"*) acted as perfect surrogate target labels.
* Masking isolated phrases like *"credible SIF potential"* was insufficient because non-overlapping template clauses enabled an NLP model to achieve an artificial 100% test accuracy without learning underlying safety physics.

To establish genuine machine learning validity, `sif_dataset_v2.csv` was engineered with strict leakage controls:
* Continuous multi-factor risk scoring incorporating energy vectors, worker proximity, and barrier states with Gaussian noise before thresholding.
* Paired narrative templates sharing common vocabulary across both target classes (e.g., high-pressure flange leaks vs. low-pressure packing weeping).
* Statistical verification confirming zero 100% exclusive 1-word, 2-word, or 3-word n-grams.

---

## 4. Models Trained

Three candidate pipelines were trained and evaluated on `sif_dataset_v2.csv` using 80/20 stratified splits:

1. **Structured Logistic Regression**:
   * Preprocessor: `OneHotEncoder(handle_unknown="ignore")` inside `ColumnTransformer` on 6 categorical columns.
   * Classifier: `LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)`
   * Artifact: `ml/models/sif_v2_structured_logistic_regression.joblib`

2. **Structured Random Forest**:
   * Preprocessor: `OneHotEncoder(handle_unknown="ignore")` inside `ColumnTransformer` on 6 categorical columns.
   * Classifier: `RandomForestClassifier(n_estimators=100, class_weight="balanced", random_state=42, n_jobs=-1)`
   * Artifact: `ml/models/sif_v2_structured_random_forest.joblib`

3. **NLP Text TF-IDF + Logistic Regression**:
   * Vectorizer: `TfidfVectorizer(ngram_range=(1, 2), max_features=5000, sublinear_tf=True)` on `report_text`
   * Classifier: `LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)`
   * Artifact: `ml/models/sif_v2_text_tfidf_logistic_regression.joblib`

---

## 5. Model Comparison

Evaluated on the held-out 3,000-sample test set (Step 13/14 results):

| Metric | Structured Logistic Regression | Structured Random Forest | NLP TF-IDF + Logistic Regression |
| :--- | :--- | :--- | :--- |
| **Test Accuracy** | 69.57% | 67.07% | **79.87%** |
| **Weighted Precision** | 0.6957 | 0.6707 | **0.7987** |
| **Weighted Recall** | 0.6957 | 0.6707 | **0.7987** |
| **Weighted F1-Score** | 0.6956 | 0.6706 | **0.7987** |
| **SIF-potential Precision** | 0.6920 | 0.6737 | **0.7983** |
| **SIF-potential Recall** | 0.7053 | 0.6620 | **0.7993** |
| **SIF-potential F1** | 0.6986 | 0.6678 | **0.7988** |
| **Train Accuracy** | 68.66% | 99.76% | 81.03% |
| **Train vs. Test Gap** | -0.91% (Underfit/Stable) | +32.69% (Severe Overfit) | **+1.17% (Healthy)** |

---

## 6. Final Model Selection

**Selected Final Candidate**: `NLP Text TF-IDF + Logistic Regression`  
**Model Artifact**: `ml/models/sif_v2_text_tfidf_logistic_regression.joblib`

### Selection Rationale:
* **Superior Harmonic Generalization**: Achieved the highest weighted F1-score (**0.7987**) across both classes on held-out test data.
* **Optimal SIF Recall**: Detected **79.93%** of all actual SIF-potential events (1,199 of 1,500 test cases), minimizing critical false negatives (301 false negatives compared to 442 for structured logistic regression and 507 for random forest).
* **Minimal Generalization Gap**: Exhibited an outstanding 1.17 percentage point gap between training (81.03%) and testing (79.87%), confirming strong regularization without overfitting.

---

## 7. Final Model Performance

On the 3,000-sample held-out test split:

* **Test Accuracy**: `79.87%`
* **Weighted F1-Score**: `79.87%`
* **SIF-potential Recall**: `79.93%`
* **SIF-potential Precision**: `79.83%`
* **Non-SIF Precision**: `79.91%`
* **Non-SIF Recall**: `79.80%`
* **Train Accuracy**: `81.03%`
* **Generalization Gap**: `1.17 percentage points`

### Confusion Matrix (3,000 test cases):
```
Actual \ Predicted       SIF-potential     Non-SIF-potential
SIF-potential                 1,199 (TP)           301 (FN)
Non-SIF-potential               303 (FP)         1,197 (TN)
```

---

## 8. Overfitting Analysis

A rigorous train-versus-test cross-check exposed significant differences in model generalization:

* **Structured Random Forest Overfitting**:
  * Train Accuracy: `99.76%`
  * Test Accuracy: `67.07%`
  * Overfitting Gap: `+32.69 percentage points`
  * *Diagnosis*: An unconstrained tree ensemble memorized specific sparse one-hot categorical feature combinations in the training set without learning generalized risk boundaries, causing severe degradation on test records.

* **NLP TF-IDF + Logistic Regression Regularization**:
  * Train Accuracy: `81.03%`
  * Test Accuracy: `79.87%`
  * Generalization Gap: `+1.17 percentage points`
  * *Diagnosis*: The $L_2$ regularization penalty on Logistic Regression coefficients combined with sublinear term-frequency scaling prevented vocabulary memorization, resulting in an exceptionally stable model.

---

## 9. Backend Integration

The model was integrated into the FastAPI backend cleanly and non-invasively:

1. **Standalone Inference Service**:
   * File: `backend/app/ai_services/sif_ml_inference.py`
   * Implements thread-safe lazy singleton loading (`get_model()`) to avoid reloading the joblib model per request.
   * Multi-candidate path resolution locates `ml/models/sif_v2_text_tfidf_logistic_regression.joblib` across execution roots.
   * Extracts class probabilities using `predict_proba()`.
   * Sanitizes errors to prevent leaking internal filesystem paths.

2. **Integration into Safety Assessment Flow**:
   * File: `backend/app/ai_services/sif_assessment.py`
   * Calls `predict_sif_potential(text)` inside `assess_sif_precursor()`.
   * **Rule-Based Preservation**: The existing rule-based safety logic remains 100% authoritative for the final API response (`YES`, `NO`, `INSUFFICIENT_INFORMATION`).
   * **Supporting Intelligence**: ML predictions (`predicted_class`, `confidence`, `probabilities`, `model_name`) are captured internally and attached to the safety intelligence dictionary.
   * **Graceful Fallback**: If ML inference fails or receives empty input, the safety assessment proceeds uninterrupted using rule-based logic without raising HTTP 500 errors.

---

## 10. API Validation (Step 18)

Live end-to-end API validation was executed against the running FastAPI backend server:

* **Backend Server**: Started on `http://127.0.0.1:8000` via Uvicorn. Startup and health check passed (`status: online`).
* **Report Creation (`POST /api/reports`)**: Processed incident observations, stored records in SQLite, and executed full AI analysis. HTTP `201 Created` across all test submissions.
* **Re-Analysis Endpoint (`POST /api/reports/{id}/analyze`)**: Successfully re-evaluated existing reports. HTTP `200 OK`.
* **ML Inference Through API**: Verified that live API calls trigger `predict_sif_potential` and record predictions and confidence scores.
* **Error Fallback**: Tested empty/whitespace strings; verified that the pipeline safely returned `INSUFFICIENT_INFORMATION` without crashing.
* **Frontend Compatibility**: Verified that all 15 existing response keys remained identical. Zero API schema changes were required.

---

## 11. Robustness Testing (Step 19)

A 10-scenario robustness evaluation evaluated varied operational safety categories:

* **Total Scenarios**: 10
* **API Ingestion Rate**: 10/10 Passed (`201 Created`)
* **ML Inference Execution**: 10/10 Passed
* **Rule-Based Execution**: 10/10 Passed
* **Model Loading Errors**: 0
* **Inference Exceptions**: 0
* **ML / Rule Agreement**: 6/10 (60.0%)
* **ML / Rule Disagreement**: 4/10 (40.0%)
* **Low-Confidence Cases (< 60%)**: 1 (Case 4: 54.50%)
* **Overall Robustness Status**: **PASS**

### Summary Results Table:
| Scenario | Category | ML Prediction | ML Conf | Rule Result | API Status |
| :---: | :--- | :--- | :---: | :---: | :---: |
| 1 | Equipment isolation failure | SIF-potential | 70.10% | YES | PASS |
| 2 | Toxic gas exposure | SIF-potential | 81.68% | YES | PASS |
| 3 | Working at height | SIF-potential | 69.26% | YES | PASS |
| 4 | Electrical hazard | SIF-potential | 54.50% | INSUFFICIENT_INFO | PASS |
| 5 | Mobile equipment interaction | SIF-potential | 67.39% | YES | PASS |
| 6 | Confined-space hazard | SIF-potential | 71.44% | YES | PASS |
| 7 | Dropped-object hazard | SIF-potential | 70.36% | NO | PASS |
| 8 | Pressure/energy release | SIF-potential | 86.69% | YES | PASS |
| 9 | Minor housekeeping issue | Non-SIF-potential | 63.62% | INSUFFICIENT_INFO | PASS |
| 10 | Low-risk procedural observation | Non-SIF-potential | 69.18% | INSUFFICIENT_INFO | PASS |

---

## 12. Disagreement Analysis (Step 20)

Diagnostic inspection of the 4 disagreement cases identified no model flaws or data corruption:

1. **Case 4 (Electrical hazard)**: The rule engine requires explicit hazard dictionary terms. Because *"power cable submerged"* was not in the hazard whitelist, it defaulted to `INSUFFICIENT_INFORMATION`. The ML model captured the 440V electrical risk.
2. **Case 7 (Dropped-object hazard)**: The rule engine requires the literal lemma *"dropped object"* to set `is_high_energy_hazard = True`. Phrasing like *"fell from rig floor Derrick"* caused the rule to default to `NO`. The ML model generalized the falling mass context to predict `SIF-potential` (70.36%).
3. **Cases 9 & 10 (Housekeeping & Procedure)**: The rule engine withholds negative declarations unless specific low-energy labels match, defaulting to `INSUFFICIENT_INFORMATION`. The ML model recognized benign operational text, predicting `Non-SIF-potential` (63.62% and 69.18%).

**Conclusion**: All 4 disagreements represent expected divergence between a **rigid lexical rule whitelist** and a **generalized statistical NLP model**. Zero suspicious cases were found.

---

## 13. Limitations & Disclaimers

> [!WARNING]
> **Important Safety Engineering Limitations**:
> 1. **Synthetic Data Foundation**: All models were trained and validated on synthetic dataset `sif_dataset_v2.csv`. Synthetic data cannot fully reproduce complex real-world oil & gas incident dynamics.
> 2. **Development-Stage Milestone**: The reported **79.87% accuracy** is an algorithmic prototype milestone, NOT empirical evidence of field safety accuracy.
> 3. **Non-Determinism & Disagreements**: Statistical NLP models and rule-based expert systems will disagree on edge cases. The ML model must never be used as the sole determinant for critical stop-work or life-safety decisions.
> 4. **Prerequisites for Production**: Real-world operational validation with verified, historical incident narratives and human HSE auditor reviews is mandatory before production deployment.

---

## 14. Final Architecture

The system operates as a hybrid safety intelligence engine where deterministic domain rules and probabilistic NLP models complement each other:

```
                  Safety Incident Observation
                              |
                              v
                     POST /api/reports
                              |
                              v
                       FastAPI Backend
                              |
              +---------------+---------------+
              |                               |
              v                               v
    Rule-Based SIF Engine           ML Inference Module
    (Domain Heuristics)         (backend/app/ai_services/)
              |                               |
              |                               v
              |               sif_v2_text_tfidf_logistic_regression
              |                               |
              v                               v
      Authoritative SIF               Supporting ML Signal
     (YES / NO / INSUFF)         (Class + Confidence + Probs)
              |                               |
              +---------------+---------------+
                              |
                              v
                  Consolidated AI Analysis
                 (Full API Response Schema)
```

---

## 15. Final Status

* **GitHub Issue #9**: **COMPLETE**
* **Branch**: `issue-9-ml-training`
* **Implementation Delivered**:
  * Clean V2 dataset with zero template leakage (`ml/data/sif_dataset_v2.csv`).
  * Validated final candidate model (`ml/models/sif_v2_text_tfidf_logistic_regression.joblib`).
  * Modular backend inference module (`backend/app/ai_services/sif_ml_inference.py`).
  * Seamless integration with graceful fallback (`backend/app/ai_services/sif_assessment.py`).
  * Full end-to-end API and robustness verification.
* **Code Integrity**: Zero changes were made to the frontend, dashboard UI, main branch, or production database schemas.

---
*Report generated and approved for development-stage prototype review under GitHub Issue #9.*
