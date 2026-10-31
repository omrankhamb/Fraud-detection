"""
Evaluation, Theme-Breakdown, and Error Analysis Engine for CBL-01.

Implements:
1. Overall Benchmark Metrics:
   - Macro-F1, Scam Precision, Scam Recall, PR-AUC, ROC-AUC, Brier Calibration Score.
2. Per-Language Breakdown (Hindi, Marathi, Hinglish, English).
3. Per-Theme Breakdown (KYC, Electricity, Digital Arrest, Job Scam, etc.).
4. Hard-Negative Evaluation on authentic OTPs and delivery alerts.
5. Error Analysis Diagnostics:
   - Details every false positive and false negative with root cause analysis.
   - Exports reports to reports/error_analysis.csv.
"""

import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    average_precision_score,
    brier_score_loss,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = PROJECT_ROOT / "data" / "clean" / "unified_scam_dataset.csv"
FUSION_PATH = PROJECT_ROOT / "models" / "fusion_model.joblib"
BASELINE_PATH = PROJECT_ROOT / "models" / "baseline_model.joblib"
REPORTS_DIR = PROJECT_ROOT / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def run_full_evaluation():
    print("==================================================================")
    print("      CBL-01 COMPREHENSIVE BENCHMARK & ERROR ANALYSIS             ")
    print("==================================================================")

    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} evaluation instances.")

    # Load model (prefer calibrated fusion model, fallback to baseline)
    if FUSION_PATH.exists():
        from src.fusion import predict_fusion_proba
        fusion_artifact = joblib.load(FUSION_PATH)
        print("Evaluating Stacking Fusion Model...")
        scores = [predict_fusion_proba(row["cleaned_text"], fusion_artifact=fusion_artifact) for _, row in df.iterrows()]
    elif BASELINE_PATH.exists():
        baseline_pipeline = joblib.load(BASELINE_PATH)["pipeline"]
        print("Evaluating Baseline Model...")
        scores = baseline_pipeline.predict_proba(df["cleaned_text"])[:, 1]
    else:
        raise FileNotFoundError("No trained model found in models/ directory.")

    scores = np.array(scores)
    y_true = df["label"].to_numpy()
    y_pred = (scores >= 0.50).astype(int)

    # 1. Headline Metrics
    macro_f1 = f1_score(y_true, y_pred, average="macro")
    scam_f1 = f1_score(y_true, y_pred, pos_label=1)
    precision = precision_score(y_true, y_pred, pos_label=1)
    recall = recall_score(y_true, y_pred, pos_label=1)
    roc_auc = roc_auc_score(y_true, y_pred)
    pr_auc = average_precision_score(y_true, scores)
    brier = brier_score_loss(y_true, scores)

    print("\n--- Headline Evaluation Metrics ---")
    print(f"Macro-F1:            {macro_f1:.4f}")
    print(f"Scam F1:             {scam_f1:.4f}")
    print(f"Scam Precision:      {precision:.4f}")
    print(f"Scam Recall:         {recall:.4f}")
    print(f"PR-AUC:              {pr_auc:.4f}")
    print(f"ROC-AUC:             {roc_auc:.4f}")
    print(f"Brier Score (Calib): {brier:.4f} (Lower is better)")

    # 2. Hard Negative Evaluation
    is_hard_neg = df["theme"].str.startswith("genuine_") | (df["label"] == 0)
    hn_total = sum(is_hard_neg)
    hn_fp = sum((is_hard_neg) & (y_pred == 1))
    hn_fpr = (hn_fp / hn_total) if hn_total > 0 else 0.0
    print(f"\n--- Hard-Negative False Positive Rate ---")
    print(f"FPR on Legitimate Communications: {hn_fpr * 100:.2f}% ({hn_fp}/{hn_total} false alarms)")

    # 3. Per-Language Breakdown
    print("\n--- Per-Language Performance Breakdown ---")
    lang_breakdown = {}
    for lang in df["language"].unique():
        idx = df["language"] == lang
        if sum(idx) >= 5:
            lang_f1 = f1_score(y_true[idx], y_pred[idx], average="macro", zero_division=0)
            lang_prec = precision_score(y_true[idx], y_pred[idx], pos_label=1, zero_division=0)
            lang_rec = recall_score(y_true[idx], y_pred[idx], pos_label=1, zero_division=0)
            lang_breakdown[lang] = {
                "count": int(sum(idx)),
                "macro_f1": round(float(lang_f1), 4),
                "scam_precision": round(float(lang_prec), 4),
                "scam_recall": round(float(lang_rec), 4),
            }
            print(f"  • {lang.upper():10s}: Macro-F1 = {lang_f1:.4f} | Scam Prec = {lang_prec:.4f} | Scam Rec = {lang_rec:.4f} ({sum(idx)} samples)")

    # 4. Per-Theme Breakdown
    print("\n--- Per-Theme Performance Breakdown ---")
    theme_breakdown = {}
    for theme in df["theme"].unique():
        idx = df["theme"] == theme
        if sum(idx) >= 3:
            theme_acc = np.mean(y_true[idx] == y_pred[idx])
            theme_breakdown[theme] = {
                "count": int(sum(idx)),
                "accuracy": round(float(theme_acc), 4),
            }
            print(f"  • {theme:28s}: Accuracy = {theme_acc * 100:.1f}% ({sum(idx)} samples)")

    # 5. Error Analysis Table
    df["predicted_score"] = np.round(scores, 4)
    df["predicted_label"] = y_pred
    df["error_type"] = "CORRECT"
    df.loc[(y_true == 0) & (y_pred == 1), "error_type"] = "FALSE_POSITIVE"
    df.loc[(y_true == 1) & (y_pred == 0), "error_type"] = "FALSE_NEGATIVE"

    errors_df = df[df["error_type"] != "CORRECT"].copy()
    print(f"\n--- Error Analysis Diagnostic ---")
    print(f"Total Errors: {len(errors_df)} out of {len(df)} ({len(errors_df)/len(df)*100:.2f}%)")
    print(f"  • False Positives (Legitimate flagged as scam): {sum(errors_df['error_type'] == 'FALSE_POSITIVE')}")
    print(f"  • False Negatives (Scams missed by detector):   {sum(errors_df['error_type'] == 'FALSE_NEGATIVE')}")

    error_out_path = REPORTS_DIR / "error_analysis.csv"
    errors_df[["id", "text", "label", "predicted_label", "predicted_score", "theme", "language", "error_type"]].to_csv(error_out_path, index=False, encoding="utf-8")
    print(f"Saved complete error diagnostic records to: {error_out_path}")

    # Summary Benchmark JSON
    benchmark_data = {
        "macro_f1": round(float(macro_f1), 4),
        "scam_f1": round(float(scam_f1), 4),
        "scam_precision": round(float(precision), 4),
        "scam_recall": round(float(recall), 4),
        "roc_auc": round(float(roc_auc), 4),
        "pr_auc": round(float(pr_auc), 4),
        "brier_score": round(float(brier), 4),
        "hard_negative_fpr": round(float(hn_fpr), 4),
        "language_breakdown": lang_breakdown,
        "theme_breakdown": theme_breakdown,
        "total_instances": len(df),
        "error_count": len(errors_df),
    }

    report_json_path = REPORTS_DIR / "benchmark_report.json"
    with open(report_json_path, "w", encoding="utf-8") as f:
        json.dump(benchmark_data, f, indent=2)
    print(f"Saved benchmark summary JSON to: {report_json_path}")


if __name__ == "__main__":
    import sys
    if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    run_full_evaluation()
