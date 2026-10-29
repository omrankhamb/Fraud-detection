import os
from pathlib import Path
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score, average_precision_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except ImportError:
    HAS_XGB = False


def train_fraud_model(data_path: str = None, model_output_path: str = None):
    project_root = Path(__file__).resolve().parent.parent.parent
    if data_path is None:
        data_path = project_root / "data" / "sample_transactions.csv"
    if model_output_path is None:
        model_output_path = project_root / "models" / "fraud_detector.joblib"

    if not Path(data_path).exists():
        from src.data.generate_data import generate_synthetic_transactions
        print(f"Data file not found at {data_path}. Generating synthetic dataset...")
        df = generate_synthetic_transactions(n_samples=25000, fraud_ratio=0.02)
        Path(data_path).parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(data_path, index=False)
    else:
        df = pd.read_csv(data_path)

    print(f"Dataset shape: {df.shape}")
    print(f"Fraud distribution:\n{df['Class'].value_counts(normalize=True)}")

    feature_cols = [c for c in df.columns if c != "Class"]
    X = df[feature_cols]
    y = df["Class"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("\nTraining Random Forest Classifier with balanced class weights...")
    model = RandomForestClassifier(
        n_estimators=100,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]

    roc_auc = roc_auc_score(y_test, y_proba)
    pr_auc = average_precision_score(y_test, y_proba)

    print("\n--- Model Evaluation ---")
    print(f"ROC-AUC Score: {roc_auc:.4f}")
    print(f"PR-AUC Score (Average Precision): {pr_auc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Normal", "Fraud"]))

    # Save artifact containing model, scaler, and feature names
    artifact = {
        "model": model,
        "scaler": scaler,
        "feature_names": feature_cols,
        "roc_auc": roc_auc,
        "pr_auc": pr_auc
    }
    Path(model_output_path).parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, model_output_path)
    print(f"\nTrained model and scaler saved to: {model_output_path}")


if __name__ == "__main__":
    train_fraud_model()
