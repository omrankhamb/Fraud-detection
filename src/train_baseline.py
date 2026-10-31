"""
Baseline Model & Theme-Holdout Training Pipeline for CBL-01.

Implements:
1. Zero-leakage Theme-Based Holdout splitting (e.g., holdout 'digital_arrest' and 'customs_parcel').
2. Subword Character n-gram (2 to 5) TF-IDF Vectorizer.
3. Balanced Linear Classifier (Logistic Regression with class_weight='balanced').
4. Honest evaluation reporting:
   - Unseen-theme Macro-F1 & PR-AUC
   - Hard-negative False Positive Rate (FPR) on authentic bank OTPs/alerts
   - Confusion Matrix
5. Serialization of baseline pipeline into models/baseline_model.joblib.
"""

from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    average_precision_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_CLEAN = PROJECT_ROOT / "data" / "clean" / "unified_scam_dataset.csv"
MODEL_DIR = PROJECT_ROOT / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MODEL_OUT_PATH = MODEL_DIR / "baseline_model.joblib"


def train_baseline_pipeline(
    data_path: Path = DATA_CLEAN,
    holdout_themes: list = None,
    random_state: int = 42,
):
    if holdout_themes is None:
        holdout_themes = ["digital_arrest", "customs_parcel", "electricity_disconnection"]

    print("==================================================================")
    print("      CBL-01 BASELINE MODEL TRAINING & HONEST EVALUATION          ")
    print("==================================================================")

    if not data_path.exists():
        raise FileNotFoundError(f"Cleaned dataset not found at {data_path}. Run download_datasets.py first.")

    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} total dataset instances from: {data_path.name}")
    print(f"Overall Class Distribution:\n{df['label'].value_counts(normalize=True).round(3)}")

    # 1. Zero-Leakage Theme Holdout Split
    # Hold out specific scam themes completely to test generalization
    is_holdout = df["theme"].isin(holdout_themes)
    df_holdout = df[is_holdout].copy()
    df_main = df[~is_holdout].copy()

    print(f"\n[Split] Holdout Unseen Themes: {holdout_themes} ({len(df_holdout)} samples)")
    print(f"[Split] Development Set: {len(df_main)} samples")

    # Train / Validation split on development set
    X_train_raw, X_val_raw, y_train, y_val = train_test_split(
        df_main["cleaned_text"],
        df_main["label"],
        test_size=0.20,
        random_state=random_state,
        stratify=df_main["label"],
    )

    print(f"Training set size: {len(X_train_raw)} | Validation set size: {len(X_val_raw)}")

    # 2. Pipeline: Subword Character n-gram TF-IDF + Balanced Classifier
    print("\nFitting Character n-gram (2-5) TF-IDF Vectorizer...")
    pipeline = Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                analyzer="char_wb",
                ngram_range=(2, 5),
                min_df=2,
                sublinear_tf=True,
                max_features=25000,
            ),
        ),
        (
            "clf",
            LogisticRegression(
                class_weight="balanced",
                C=2.0,
                max_iter=1000,
                random_state=random_state,
            ),
        ),
    ])

    pipeline.fit(X_train_raw, y_train)

    # 3. Evaluate on Seen Validation Set
    val_preds = pipeline.predict(X_val_raw)
    val_probs = pipeline.predict_proba(X_val_raw)[:, 1]

    val_f1_macro = f1_score(y_val, val_preds, average="macro")
    val_f1_scam = f1_score(y_val, val_preds, pos_label=1)
    val_pr_auc = average_precision_score(y_val, val_probs)
    val_roc_auc = roc_auc_score(y_val, val_probs)

    print("\n--- Validation Performance (Seen Themes) ---")
    print(f"Validation Macro-F1:     {val_f1_macro:.4f}")
    print(f"Validation Scam F1:      {val_f1_scam:.4f}")
    print(f"Validation PR-AUC:       {val_pr_auc:.4f}")
    print(f"Validation ROC-AUC:      {val_roc_auc:.4f}")
    print("\nSeen Themes Classification Report:")
    print(classification_report(y_val, val_preds, target_names=["Legitimate (Ham)", "Scam"]))

    # 4. Evaluate on Hard Negatives (Genuine Bank Alerts & OTPs)
    hard_negatives = df[df["theme"].str.startswith("genuine_")].copy()
    if len(hard_negatives) > 0:
        hn_preds = pipeline.predict(hard_negatives["cleaned_text"])
        hn_fpr = np.mean(hn_preds == 1)
        print(f"\n--- Hard-Negative Analysis ({len(hard_negatives)} genuine alerts/OTPs) ---")
        print(f"False Positive Rate on Hard Negatives: {hn_fpr * 100:.2f}% (Target: < 2.0%)")

    # 5. Evaluate on Unseen Holdout Themes
    if len(df_holdout) > 0:
        holdout_preds = pipeline.predict(df_holdout["cleaned_text"])
        holdout_probs = pipeline.predict_proba(df_holdout["cleaned_text"])[:, 1]
        print("\n--- Unseen Theme Holdout Performance (Simulating Blind Test) ---")
        print(f"Total Holdout Samples: {len(df_holdout)}")
        for theme in holdout_themes:
            sub = df_holdout[df_holdout["theme"] == theme]
            if len(sub) > 0:
                sub_preds = pipeline.predict(sub["cleaned_text"])
                acc = np.mean(sub_preds == sub["label"])
                print(f"  • Theme '{theme}': Detection Accuracy = {acc * 100:.1f}% ({len(sub)} samples)")

    # 6. Save Artifact
    artifact = {
        "pipeline": pipeline,
        "holdout_themes": holdout_themes,
        "metrics": {
            "val_f1_macro": float(val_f1_macro),
            "val_f1_scam": float(val_f1_scam),
            "val_pr_auc": float(val_pr_auc),
            "val_roc_auc": float(val_roc_auc),
        },
    }
    joblib.dump(artifact, MODEL_OUT_PATH)
    print(f"\nSuccessfully serialized baseline pipeline to: {MODEL_OUT_PATH}")
    return artifact


if __name__ == "__main__":
    train_baseline_pipeline()
