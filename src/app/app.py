import sys
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
import streamlit as st

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = PROJECT_ROOT / "models" / "fraud_detector.joblib"

st.set_page_config(
    page_title="Fraud Detection Dashboard",
    page_icon="🛡️",
    layout="wide"
)

st.title("🛡️ Real-time Transaction Fraud Detection")
st.markdown("Monitor transactions, assess fraud probabilities, and inspect anomaly factors.")

@st.cache_resource
def load_artifact():
    if not MODEL_PATH.exists():
        return None
    return joblib.load(MODEL_PATH)

artifact = load_artifact()

if artifact is None:
    st.warning("⚠️ No trained model found at `models/fraud_detector.joblib`.")
    st.info("Run `python src/models/train.py` to generate and train the baseline model first.")
else:
    model = artifact["model"]
    scaler = artifact["scaler"]
    feature_names = artifact["feature_names"]

    col1, col2 = st.columns([1, 2])

    with col1:
        st.subheader("Single Transaction Input")
        inputs = {}
        for feat in feature_names:
            if feat == "Amount":
                inputs[feat] = st.number_input("Transaction Amount ($)", min_value=0.01, value=120.00, step=1.0)
            elif feat == "Time":
                inputs[feat] = st.number_input("Time (seconds)", min_value=0, value=3600, step=60)
            else:
                inputs[feat] = st.number_input(f"{feat}", value=0.0, step=0.1)

        predict_btn = st.button("Analyze Transaction", type="primary", use_container_width=True)

    with col2:
        st.subheader("Risk Assessment")
        if predict_btn:
            input_df = pd.DataFrame([inputs])
            scaled_input = scaler.transform(input_df)
            fraud_prob = model.predict_proba(scaled_input)[0, 1]
            is_fraud = fraud_prob >= 0.5

            metric_col1, metric_col2 = st.columns(2)
            with metric_col1:
                st.metric(label="Fraud Risk Score", value=f"{fraud_prob * 100:.1f}%")
            with metric_col2:
                if is_fraud:
                    st.error("🚨 HIGH RISK: Flagged as Potential Fraud")
                else:
                    st.success("✅ LOW RISK: Transaction Cleared")

            st.progress(fraud_prob)

            st.write("### Feature Values")
            st.dataframe(input_df, use_container_width=True)
