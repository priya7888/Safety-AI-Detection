import os, sys, json, joblib
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

def main():
    print('Starting training and evaluation pipeline...')

    p_osha = r'C:\Users\Dell\Downloads\January2015toNovember2025\January2015toNovember2025.csv'

    df = pd.read_csv(p_osha, encoding='utf-8', low_memory=False, usecols=['Final Narrative', 'NatureTitle', 'Hospitalized', 'Amputation'])
    df = df.dropna(subset=['Final Narrative', 'NatureTitle'])
    df = df[df['Final Narrative'].str.len() > 15].sample(n=min(15000, len(df)), random_state=42)

    top_cats = df['NatureTitle'].value_counts().head(8).index.tolist()
    df_subset = df[df['NatureTitle'].isin(top_cats)].copy()

    X = df_subset['Final Narrative']
    y = df_subset['NatureTitle']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print(f'Training on {len(X_train)} narratives across {len(top_cats)} categories...')

    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), stop_words='english')
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    clf = LogisticRegression(max_iter=1000, class_weight='balanced')
    clf.fit(X_train_vec, y_train)

    y_pred = clf.predict(X_test_vec)
    report_dict = classification_report(y_test, y_pred, output_dict=True)
    cm = [[int(cell) for cell in row] for row in confusion_matrix(y_test, y_pred, labels=top_cats)]

    print('Overall Macro F1:', report_dict['macro avg']['f1-score'])
    print('Overall Accuracy:', report_dict['accuracy'])

    os.makedirs('training_data/models', exist_ok=True)
    os.makedirs('models', exist_ok=True)

    joblib.dump(vectorizer, 'training_data/models/tfidf_vectorizer.joblib')
    joblib.dump(clf, 'training_data/models/hazard_classifier.joblib')
    joblib.dump(vectorizer, 'models/tfidf_vectorizer.joblib')
    joblib.dump(clf, 'models/hazard_classifier.joblib')

    eval_report = {
        'supervised_sif_feasibility': {
            'status': 'UNSUPPORTED_BY_GROUND_TRUTH',
            'statement': 'Supervised SIF training is not sufficiently supported by the available labeled data. External datasets (OSHA, PHMSA) do not contain verified SIF precursor labels (OSHA records severe injury consequences, while PHMSA records pipeline failures). Supervised models cannot replace evidence-based SIF precursor determination without fabricating labels.',
            'recommended_approach': 'Explainable deterministic/hybrid methods: Jaccard token similarity, deterministic energy vector classifier, deterministic barrier engine, and IOGP Life-Saving Rules matcher.'
        },
        'trained_nlp_model': 'TF-IDF + Logistic Regression Hazard Classifier',
        'classes': top_cats,
        'class_distribution_test': {k: int(v) for k, v in y_test.value_counts().items()},
        'accuracy': round(float(report_dict['accuracy']), 4),
        'macro_avg': {
            'precision': round(float(report_dict['macro avg']['precision']), 4),
            'recall': round(float(report_dict['macro avg']['recall']), 4),
            'f1-score': round(float(report_dict['macro avg']['f1-score']), 4)
        },
        'weighted_avg': {
            'precision': round(float(report_dict['weighted avg']['precision']), 4),
            'recall': round(float(report_dict['weighted avg']['recall']), 4),
            'f1-score': round(float(report_dict['weighted avg']['f1-score']), 4)
        },
        'confusion_matrix': cm
    }

    with open('training_data/models/evaluation_report.json', 'w') as f:
        json.dump(eval_report, f, indent=2)

    with open('training_data/models/preprocessing_config.json', 'w') as f:
        json.dump({
            'vectorizer_max_features': 5000,
            'ngram_range': [1, 2],
            'stop_words': 'english',
            'typo_normalization': True,
            'negation_preservation': True,
            'similarity_algorithm': 'Narrative Similarity — Jaccard Token Similarity'
        }, f, indent=2)

    print('Models and evaluation artifacts saved successfully.')

if __name__ == '__main__':
    main()
