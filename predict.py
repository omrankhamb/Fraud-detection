"""
Batch Prediction & Evaluation CLI for CBL-01 Hidden Test Sets.

Usage:
    python predict.py --input test_messages.csv --output predictions.csv

Reads an input CSV containing text messages, runs the complete multimodal
pipeline (preprocessing, character TF-IDF classifier, URL brand lookalike engine,
rule cue detector, and trilingual explanation layer), and outputs predictions
with calibrated confidence scores and human-interpretable rationale.
"""

import argparse
from pathlib import Path
import re
import sys
import joblib
import pandas as pd

from src.explain import generate_explanation
from src.features_url import analyze_message_urls
from src.preprocess import clean_message
from src.rules import extract_rule_cues

PROJECT_ROOT = Path(__file__).resolve().parent
MODEL_PATH = PROJECT_ROOT / "models" / "baseline_model.joblib"
FUSION_PATH = PROJECT_ROOT / "models" / "fusion_model.joblib"


def load_model():
    fusion_artifact = None
    if FUSION_PATH.exists():
        fusion_artifact = joblib.load(FUSION_PATH)

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model artifact not found at {MODEL_PATH}. Run 'python -m src.train_baseline' first."
        )
    baseline_artifact = joblib.load(MODEL_PATH)
    return baseline_artifact["pipeline"], fusion_artifact


def predict_batch(input_csv: str, output_csv: str):
    print(f"Loading input messages from: {input_csv}")
    df = pd.read_csv(input_csv)

    # Determine text column name
    text_col = None
    for col in ["text", "message", "sms", "body", "content"]:
        if col in df.columns:
            text_col = col
            break
    if text_col is None:
        text_col = df.columns[0]
        print(f"Warning: No explicit 'text' column found. Using first column '{text_col}'.")

    # Sender ID column (if present)
    sender_col = None
    for col in ["sender", "sender_id", "from", "header"]:
        if col in df.columns:
            sender_col = col
            break

    print(f"Loading predictive models...")
    pipeline, fusion_artifact = load_model()

    verdicts = []
    confidence_scores = []
    verdict_bands = []
    top_reasons_en = []
    top_reasons_hi = []
    top_reasons_mr = []
    highlight_tokens_list = []
    analyzed_urls_count = []

    print(f"Processing {len(df)} messages through multimodal cybersecurity pipeline...")
    for idx, row in df.iterrows():
        raw_text = str(row[text_col])
        sender_id = str(row[sender_col]) if sender_col else None

        # 1. Preprocess & extract entities
        cleaned_text, entities = clean_message(raw_text, mask_pii=False)
        urls = entities.get("urls", [])

        # 2. Text Model Prediction
        text_prob = pipeline.predict_proba([cleaned_text])[0, 1]

        # 3. URL Analysis & Lookalike detection
        url_res = analyze_message_urls(urls)
        url_risk = url_res["max_url_risk"]

        # 4. Rule Cue & Sender Mismatch detection
        rule_res = extract_rule_cues(raw_text, sender_id)
        rule_risk = rule_res["rule_risk_score"]

        # 5. Multimodal Score Fusion
        # Fuses text learned probability with verified cybersecurity signals:
        if fusion_artifact:
            from src.fusion import predict_fusion_proba
            calibrated_score = predict_fusion_proba(raw_text, sender_id, fusion_artifact)
        else:
            is_official_dlt = bool(sender_id and len(sender_id) == 9 and sender_id[2] == "-")
            has_genuine_disclaimer = bool(re.search(r"\b(never\s*share|not\s*done\s*by\s*you|valid\s*for\s*\d+\s*min)\b", raw_text, re.IGNORECASE))

            if (is_official_dlt or has_genuine_disclaimer) and url_res["max_url_risk"] == 0.0 and not rule_res["has_credential_threat"]:
                calibrated_score = min(text_prob * 0.20, 0.20)
            elif url_res["any_whitelisted"] and not rule_res["has_credential_threat"]:
                calibrated_score = min(text_prob * 0.35, 0.25)
            elif url_res["max_url_risk"] >= 0.80 or rule_res["has_digital_arrest"]:
                calibrated_score = max(text_prob, 0.85)
            else:
                calibrated_score = (0.55 * text_prob) + (0.30 * url_risk) + (0.15 * rule_risk)

        calibrated_score = max(0.0, min(1.0, calibrated_score))
        predicted_label = 1 if calibrated_score >= 0.50 else 0

        # 6. Trilingual Explanation
        explanation = generate_explanation(raw_text, url_res, rule_res, calibrated_score)

        verdicts.append("SCAM" if predicted_label == 1 else "SAFE")
        confidence_scores.append(round(calibrated_score, 4))
        verdict_bands.append(explanation["verdict"])
        top_reasons_en.append(" | ".join(explanation["reasons"]["en"]))
        top_reasons_hi.append(" | ".join(explanation["reasons"]["hi"]))
        top_reasons_mr.append(" | ".join(explanation["reasons"]["mr"]))
        highlight_tokens_list.append(", ".join(explanation["highlight_tokens"]))
        analyzed_urls_count.append(len(urls))

    df_out = df.copy()
    df_out["predicted_label"] = [1 if v == "SCAM" else 0 for v in verdicts]
    df_out["predicted_verdict"] = verdicts
    df_out["confidence_score"] = confidence_scores
    df_out["verdict_band"] = verdict_bands
    df_out["reasons_english"] = top_reasons_en
    df_out["reasons_hindi"] = top_reasons_hi
    df_out["reasons_marathi"] = top_reasons_mr
    df_out["flagged_triggers"] = highlight_tokens_list
    df_out["urls_found"] = analyzed_urls_count

    df_out.to_csv(output_csv, index=False, encoding="utf-8")
    print(f"\nPredictions successfully written to: {output_csv}")
    print("\nSummary of Batch Predictions:")
    print(df_out["predicted_verdict"].value_counts())
    print("\nVerdict Bands Distribution:")
    print(df_out["verdict_band"].value_counts())


def main():
    parser = argparse.ArgumentParser(description="CBL-01 Batch Prediction Tool for Hidden Test Sets")
    parser.add_argument("--input", required=True, help="Path to input CSV containing messages")
    parser.add_argument("--output", default="predictions.csv", help="Path to write output predictions CSV")
    args = parser.parse_args()

    predict_batch(args.input, args.output)


if __name__ == "__main__":
    if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    main()
