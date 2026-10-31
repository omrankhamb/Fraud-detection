"""
URL Specialist Classifier Training Pipeline for CBL-01.

Trains a specialized Gradient Boosted / Random Forest classifier on URL features:
- Benign URLs from Tranco Top Sites
- Live Malicious Phishing URLs from OpenPhish / URLhaus
- Typo-squatted and brand lookalike URLs

Saves artifact to models/url_classifier.joblib.
"""

from pathlib import Path
import random
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split

from src.features_url import extract_url_features

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_RAW = PROJECT_ROOT / "data" / "raw"
MODEL_DIR = PROJECT_ROOT / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
URL_MODEL_OUT = MODEL_DIR / "url_classifier.joblib"

FEATURE_KEYS = [
    "length", "num_dots", "num_hyphens", "num_digits", "num_subdomains",
    "has_at_symbol", "is_https", "is_ip", "is_shortener", "has_suspicious_tld",
    "has_apk", "has_punycode", "is_whitelisted", "lookalike_detected", "domain_entropy"
]


def prepare_url_dataset(max_samples: int = 5000):
    """Compile balanced dataset of benign and malicious URLs."""
    url_records = []

    # 1. OpenPhish Malicious URLs
    openphish_path = DATA_RAW / "openphish_feed.txt"
    if openphish_path.exists():
        with open(openphish_path, "r", encoding="utf-8", errors="ignore") as f:
            phish_urls = [line.strip() for line in f if line.strip()]
        for u in phish_urls:
            url_records.append({"url": u, "label": 1})

    # 2. Synthetic Lookalikes & Smishing Droppers
    lookalike_samples = [
        "http://sbi-kyc-verification.xyz/login.php",
        "http://onlinesbi-pan-update.top/auth",
        "http://hdfc-bank-netbanking.online/verify",
        "http://icicibank-creditcard-claim.live",
        "http://indiapost-parcel-delivery.top/claim",
        "http://phonepe-cashback-reward.xyz/claim",
        "http://paytm-kyc-agent.vip/update",
        "http://electricity-bill-pay.site/disconnection",
        "http://192.168.1.10/update/sbi_app.apk",
        "http://bijli-seva.xyz/bijli.apk",
        "https://bit.ly/3xFakeUPI",
        "https://tinyurl.com/2p9kScam",
        "http://quickcash-instant-loan.top",
    ]
    for u in lookalike_samples:
        url_records.append({"url": u, "label": 1})

    # 3. Tranco Benign Domains
    tranco_path = DATA_RAW / "tranco_top_domains.txt"
    if tranco_path.exists():
        with open(tranco_path, "r", encoding="utf-8", errors="ignore") as f:
            tranco_domains = [line.strip() for line in f if line.strip()]
        # Sample benign domains
        n_benign = min(len(tranco_domains), max(len(url_records) * 2, 600))
        sampled_tranco = random.sample(tranco_domains, n_benign)
        for d in sampled_tranco:
            scheme = "https://" if random.random() > 0.3 else "http://"
            url_records.append({"url": f"{scheme}{d}", "label": 0})

    # Extra verified benign banking/government URLs
    extra_benign = [
        "https://www.onlinesbi.sbi", "https://retail.onlinesbi.sbi/retail/login.htm",
        "https://www.hdfcbank.com", "https://netbanking.hdfcbank.com/netbanking/",
        "https://www.icicibank.com", "https://infinity.icicibank.com",
        "https://www.indiapost.gov.in", "https://uidai.gov.in",
        "https://cybercrime.gov.in", "https://www.amazon.in",
        "https://www.flipkart.com", "https://paytm.com", "https://www.phonepe.com"
    ]
    for u in extra_benign:
        url_records.append({"url": u, "label": 0})

    random.seed(42)
    random.shuffle(url_records)
    print(f"Compiled {len(url_records)} URL training samples ({sum(r['label'] for r in url_records)} malicious, {sum(1 for r in url_records if r['label'] == 0)} benign).")

    # Feature extraction
    feature_matrix = []
    labels = []
    for r in url_records:
        feat = extract_url_features(r["url"])
        vector = [feat.get(k, 0) for k in FEATURE_KEYS]
        feature_matrix.append(vector)
        labels.append(r["label"])

    X = np.array(feature_matrix)
    y = np.array(labels)
    return X, y, FEATURE_KEYS


def train_url_model():
    print("==================================================================")
    print("       CBL-01 URL SPECIALIST CLASSIFIER TRAINING                 ")
    print("==================================================================")

    X, y, feature_names = prepare_url_dataset()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    print(f"Training set: {len(X_train)} URLs | Test set: {len(X_test)} URLs")

    # Train Random Forest Classifier with balanced weights
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    roc_auc = roc_auc_score(y_test, y_prob)

    print("\n--- URL Specialist Model Evaluation ---")
    print(f"ROC-AUC: {roc_auc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Benign", "Malicious / Phishing"]))

    # Feature importances
    importances = model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    print("Top Feature Importances:")
    for i in sorted_idx[:6]:
        print(f"  • {feature_names[i]}: {importances[i]:.4f}")

    # Serialize model
    artifact = {
        "model": model,
        "feature_names": feature_names,
        "roc_auc": float(roc_auc)
    }
    joblib.dump(artifact, URL_MODEL_OUT)
    print(f"\nSaved URL Specialist model to: {URL_MODEL_OUT}")
    return artifact


if __name__ == "__main__":
    train_url_model()
