"""
Stacking Fusion & Probability Calibration Engine for CBL-01.

Combines:
1. Text baseline model probability
2. URL specialist machine learning model probability
3. URL structural & brand lookalike features
4. Psychological manipulation rule cue flags
5. Sender ID mismatch detection

Uses CalibratedClassifierCV (Platt Scaling) to output reliable risk probabilities:
- < 0.30: SAFE
- 0.30 - 0.70: SUSPICIOUS (Uncertain band)
- > 0.70: SCAM

Saves artifact to models/fusion_model.joblib.
"""

from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split

from src.features_url import analyze_message_urls, extract_url_features
from src.preprocess import clean_message
from src.rules import extract_rule_cues

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BASELINE_PATH = PROJECT_ROOT / "models" / "baseline_model.joblib"
URL_MODEL_PATH = PROJECT_ROOT / "models" / "url_classifier.joblib"
FUSION_OUT_PATH = PROJECT_ROOT / "models" / "fusion_model.joblib"
DATA_CLEAN_PATH = PROJECT_ROOT / "data" / "clean" / "unified_scam_dataset.csv"

FUSION_FEATURE_NAMES = [
    "text_prob",
    "url_ml_prob",
    "url_heuristic_risk",
    "url_is_whitelisted",
    "url_is_lookalike",
    "url_has_apk",
    "has_urgency",
    "has_credential_threat",
    "has_electricity",
    "has_digital_arrest",
    "has_job_scam",
    "has_reward",
    "sender_mismatch",
]


def predict_fusion_proba(
    text: str,
    sender_id: str = None,
    fusion_artifact: dict = None
) -> float:
    """Predict calibrated scam probability for a single message."""
    if fusion_artifact is None:
        if not FUSION_OUT_PATH.exists():
            raise FileNotFoundError(f"Fusion artifact not found at {FUSION_OUT_PATH}.")
        fusion_artifact = joblib.load(FUSION_OUT_PATH)

    baseline_pipeline = fusion_artifact["baseline_pipeline"]
    url_model = fusion_artifact["url_model"]
    meta_classifier = fusion_artifact["meta_classifier"]
    feature_names = fusion_artifact["feature_names"]

    cleaned, entities = clean_message(text, mask_pii=False)
    urls = entities.get("urls", [])

    # 1. Text baseline probability
    text_prob = float(baseline_pipeline.predict_proba([cleaned])[0, 1])

    # 2. URL analysis & ML model probability
    url_ml_prob = 0.0
    if urls and url_model:
        url_res_list = [extract_url_features(u) for u in urls]
        feature_keys = [
            "length", "num_dots", "num_hyphens", "num_digits", "num_subdomains",
            "has_at_symbol", "is_https", "is_ip", "is_shortener", "has_suspicious_tld",
            "has_apk", "has_punycode", "is_whitelisted", "lookalike_detected", "domain_entropy"
        ]
        feature_vectors = [[r.get(k, 0) for k in feature_keys] for r in url_res_list]
        url_probs = url_model.predict_proba(feature_vectors)[:, 1]
        url_ml_prob = float(np.max(url_probs))

    url_agg = analyze_message_urls(urls)
    rule_agg = extract_rule_cues(text, sender_id)

    feat_dict = {
        "text_prob": text_prob,
        "url_ml_prob": url_ml_prob,
        "url_heuristic_risk": url_agg["max_url_risk"],
        "url_is_whitelisted": url_agg["any_whitelisted"],
        "url_is_lookalike": url_agg["any_lookalike"],
        "url_has_apk": url_agg["any_apk"],
        "has_urgency": rule_agg["has_urgency"],
        "has_credential_threat": rule_agg["has_credential_threat"],
        "has_electricity": rule_agg["has_electricity"],
        "has_digital_arrest": rule_agg["has_digital_arrest"],
        "has_job_scam": rule_agg["has_job_scam"],
        "has_reward": rule_agg["has_reward"],
        "sender_mismatch": rule_agg["sender_mismatch"],
    }
    vec = np.array([feat_dict[k] for k in feature_names]).reshape(1, -1)
    prob = float(meta_classifier.predict_proba(vec)[0, 1])

    # Cybersecurity Post-Calibration
    is_official_dlt = bool(sender_id and len(sender_id) == 9 and sender_id[2] == "-")
    import re
    has_genuine_disclaimer = bool(re.search(r"\b(never\s*share|not\s*done\s*by\s*you|valid\s*for\s*\d+\s*min)\b", text, re.IGNORECASE))

    if (is_official_dlt or has_genuine_disclaimer) and url_agg["max_url_risk"] == 0.0 and not rule_agg["has_credential_threat"]:
        prob = min(prob * 0.15, 0.20)
    elif url_agg["max_url_risk"] >= 0.85 or rule_agg["has_digital_arrest"]:
        prob = max(prob, 0.88)

    return prob


def train_fusion_meta_learner(sample_size: int = 1500):
    print("==================================================================")
    print("      CBL-01 STACKING FUSION & CALIBRATION TRAINING               ")
    print("==================================================================")

    if not BASELINE_PATH.exists():
        raise FileNotFoundError(f"Baseline model not found at {BASELINE_PATH}.")
    if not URL_MODEL_PATH.exists():
        raise FileNotFoundError(f"URL model not found at {URL_MODEL_PATH}.")

    baseline_pipeline = joblib.load(BASELINE_PATH)["pipeline"]
    url_model = joblib.load(URL_MODEL_PATH)["model"]

    df = pd.read_csv(DATA_CLEAN_PATH)
    if sample_size and sample_size < len(df):
        df_sample = df.sample(n=sample_size, random_state=42).reset_index(drop=True)
    else:
        df_sample = df.copy()

    print(f"Building meta-feature matrix from {len(df_sample)} samples...")
    X_meta = []
    y_meta = []

    for _, row in df_sample.iterrows():
        text = str(row["cleaned_text"])
        label = int(row["label"])

        # Extract constituent signals
        cleaned, entities = clean_message(text, mask_pii=False)
        urls = entities.get("urls", [])

        text_prob = float(baseline_pipeline.predict_proba([cleaned])[0, 1])

        url_ml_prob = 0.0
        if urls and url_model:
            url_res_list = [extract_url_features(u) for u in urls]
            feature_keys = [
                "length", "num_dots", "num_hyphens", "num_digits", "num_subdomains",
                "has_at_symbol", "is_https", "is_ip", "is_shortener", "has_suspicious_tld",
                "has_apk", "has_punycode", "is_whitelisted", "lookalike_detected", "domain_entropy"
            ]
            feature_vectors = [[r.get(k, 0) for k in feature_keys] for r in url_res_list]
            url_probs = url_model.predict_proba(feature_vectors)[:, 1]
            url_ml_prob = float(np.max(url_probs))

        url_agg = analyze_message_urls(urls)
        rule_agg = extract_rule_cues(text)

        vec = [
            text_prob,
            url_ml_prob,
            url_agg["max_url_risk"],
            url_agg["any_whitelisted"],
            url_agg["any_lookalike"],
            url_agg["any_apk"],
            rule_agg["has_urgency"],
            rule_agg["has_credential_threat"],
            rule_agg["has_electricity"],
            rule_agg["has_digital_arrest"],
            rule_agg["has_job_scam"],
            rule_agg["has_reward"],
            rule_agg["sender_mismatch"],
        ]
        X_meta.append(vec)
        y_meta.append(label)

    X_meta = np.array(X_meta)
    y_meta = np.array(y_meta)

    X_train, X_test, y_train, y_test = train_test_split(
        X_meta, y_meta, test_size=0.25, random_state=42, stratify=y_meta
    )

    # Base Meta Learner
    base_lr = LogisticRegression(class_weight="balanced", C=1.5, random_state=42)

    # Platt Scaling / Probability Calibration
    calibrated_meta = CalibratedClassifierCV(estimator=base_lr, method="sigmoid", cv=3)
    calibrated_meta.fit(X_train, y_train)

    y_pred = calibrated_meta.predict(X_test)
    y_prob = calibrated_meta.predict_proba(X_test)[:, 1]

    roc_auc = roc_auc_score(y_test, y_prob)
    f1 = f1_score(y_test, y_pred, average="macro")

    print("\n--- Stacking Meta-Learner Evaluation ---")
    print(f"ROC-AUC: {roc_auc:.4f} | Macro-F1: {f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Legitimate", "Scam"]))

    # Package into dictionary artifact
    artifact = {
        "baseline_pipeline": baseline_pipeline,
        "url_model": url_model,
        "meta_classifier": calibrated_meta,
        "feature_names": FUSION_FEATURE_NAMES,
    }

    joblib.dump(artifact, FUSION_OUT_PATH)
    print(f"\nSuccessfully serialized calibrated Stacking Fusion Model to: {FUSION_OUT_PATH}")
    return artifact


if __name__ == "__main__":
    train_fusion_meta_learner()
