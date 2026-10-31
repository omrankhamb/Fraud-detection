"""
CBL-01 Multilingual Scam SMS & Malicious Link Detection Dashboard.
Interactive Streamlit Web Application.
"""

from pathlib import Path
import re
import sys
import joblib
import pandas as pd
import streamlit as st

# Configure page
st.set_page_config(
    page_title="CBL-01 Scam Shield",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = PROJECT_ROOT / "models" / "baseline_model.joblib"
FUSION_PATH = PROJECT_ROOT / "models" / "fusion_model.joblib"

from src.explain import generate_explanation
from src.features_url import analyze_message_urls
from src.preprocess import clean_message
from src.rules import extract_rule_cues


@st.cache_resource
def load_trained_model():
    baseline_pipe = None
    fusion_artifact = None
    if MODEL_PATH.exists():
        baseline_pipe = joblib.load(MODEL_PATH)["pipeline"]
    if FUSION_PATH.exists():
        fusion_artifact = joblib.load(FUSION_PATH)
    return baseline_pipe, fusion_artifact


model_pipeline, fusion_artifact = load_trained_model()

# Header & Branding
st.title("🛡️ CBL-01: Multilingual Scam & Phishing Detector")
st.caption("AI-powered cybersecurity defense for SMS and WhatsApp in Hindi, Marathi, Hinglish, and English.")

# Preset Demonstration Messages
DEMO_PRESETS = {
    "⚡ Electricity Bill Scam": {
        "text": "Dear customer, your electricity power will be disconnected tonight at 9.30 pm because previous month bill was not updated. Please contact electricity officer at 9876543210 immediately: http://power-bill-update.xyz",
        "sender": "9876543210"
    },
    "⚖️ Digital Arrest Intimidation": {
        "text": "सीबीआई साइबर शाखा नोटिस: मनी लॉन्ड्रिंग मामले में आपके आधार पर डिजिटल अरेस्ट वारंट जारी हुआ है। तुरंत स्काइप वीडियो कॉल से जुड़ें, कॉल डिस्कनेक्ट न करें।",
        "sender": "+919988776655"
    },
    "🎁 PhonePe UPI Cashback Bait": {
        "text": "Aapko PhonePe cashback reward mila hai Rs 2499 ka. Abhi receive money pe click karke apna UPI PIN dalein: http://phonepe-reward-claim.xyz",
        "sender": "PhonePeCash"
    },
    "📦 Marathi India Post Scam": {
        "text": "इंडिया पोस्ट: तुमचे पार्सल अपूर्ण पत्त्यामुळे अडकून पडले आहे. डिलिव्हरीसाठी तात्काळ पत्ता अपडेट करा: http://indiapost-update.live",
        "sender": "+919876543210"
    },
    "🔒 Authentic Bank OTP (Hard Negative)": {
        "text": "482910 is your secret OTP for payment of Rs 1,250.00 to AMAZON PAY. Valid for 10 mins. SBI never asks for OTP or PIN. Do not share with anyone.",
        "sender": "VK-SBIINB"
    },
    "🚚 Authentic Delivery Alert (Hard Negative)": {
        "text": "Your India Post consignment #EA982194821IN has been dispatched. Track status online at https://www.indiapost.gov.in/tracking",
        "sender": "VM-POSTIN"
    }
}

# Sidebar Controls
with st.sidebar:
    st.header("⚙️ Settings & Provenance")
    lang_choice = st.selectbox(
        "Explanation Language / स्पष्टीकरणाची भाषा",
        options=["English", "Hindi (हिंदी)", "Marathi (मराठी)"],
        index=0
    )
    lang_key = "en" if "English" in lang_choice else ("hi" if "Hindi" in lang_choice else "mr")

    st.markdown("---")
    st.markdown("### 📋 Quick Demo Presets")
    selected_preset = st.selectbox("Select a realistic sample:", options=list(DEMO_PRESETS.keys()))

    st.markdown("---")
    st.markdown("### 🏛️ Official Reporting Channels")
    st.markdown(
        """
        - 🚨 **National Cyber Helpline**: **1930**
        - 🌐 **Cybercrime Portal**: [cybercrime.gov.in](https://cybercrime.gov.in)
        - 📱 **Sanchar Saathi (Chakshu)**: [sancharsaathi.gov.in](https://sancharsaathi.gov.in)
        """
    )

# Main layout tabs
tab_single, tab_batch = st.tabs(["🔍 Single Message Analysis", "📂 Batch CSV Prediction"])

with tab_single:
    col_input, col_results = st.columns([1, 1], gap="medium")

    with col_input:
        st.subheader("Input Message")

        # Load preset if clicked
        if st.button("Load Selected Preset Text", use_container_width=True):
            st.session_state["input_text"] = DEMO_PRESETS[selected_preset]["text"]
            st.session_state["input_sender"] = DEMO_PRESETS[selected_preset]["sender"]

        default_text = st.session_state.get("input_text", DEMO_PRESETS[selected_preset]["text"])
        default_sender = st.session_state.get("input_sender", DEMO_PRESETS[selected_preset]["sender"])

        message_input = st.text_area(
            "Paste SMS / WhatsApp Text:",
            value=default_text,
            height=140,
        )

        sender_input = st.text_input(
            "Sender ID / Phone Number (Optional):",
            value=default_sender,
            help="E.g. AD-HDFCBK, VK-SBIINB, or personal 10-digit mobile number.",
        )

        analyze_button = st.button("🛡️ Analyze Message", type="primary", use_container_width=True)

    with col_results:
        st.subheader("Cybersecurity Risk Verdict")

        if model_pipeline is None:
            st.error("Model pipeline artifact not found at `models/baseline_model.joblib`. Please train the model first.")
        elif analyze_button or message_input:
            # Execute Pipeline
            cleaned_text, entities = clean_message(message_input, mask_pii=False)
            urls = entities.get("urls", [])

            # 1. Text Probability
            text_prob = float(model_pipeline.predict_proba([cleaned_text])[0, 1])

            # 2. URL Analysis
            url_res = analyze_message_urls(urls)
            url_risk = url_res["max_url_risk"]

            # 3. Rule Cues
            rule_res = extract_rule_cues(message_input, sender_input)
            rule_risk = rule_res["rule_risk_score"]

            # 4. Multimodal Stacking Calibration
            if fusion_artifact:
                from src.fusion import predict_fusion_proba
                calibrated_score = predict_fusion_proba(message_input, sender_input, fusion_artifact)
            else:
                is_official_dlt = bool(sender_input and len(sender_input) == 9 and sender_input[2] == "-")
                has_genuine_disclaimer = bool(re.search(r"\b(never\s*share|not\s*done\s*by\s*you|valid\s*for\s*\d+\s*min)\b", message_input, re.IGNORECASE))

                if (is_official_dlt or has_genuine_disclaimer) and url_risk == 0.0 and not rule_res["has_credential_threat"]:
                    calibrated_score = min(text_prob * 0.20, 0.20)
                elif url_res["any_whitelisted"] and not rule_res["has_credential_threat"]:
                    calibrated_score = min(text_prob * 0.35, 0.25)
                elif url_risk >= 0.80 or rule_res["has_digital_arrest"]:
                    calibrated_score = max(text_prob, 0.85)
                else:
                    calibrated_score = (0.55 * text_prob) + (0.30 * url_risk) + (0.15 * rule_risk)

            calibrated_score = max(0.0, min(1.0, calibrated_score))

            # 5. Explanations
            explanation = generate_explanation(message_input, url_res, rule_res, calibrated_score)

            verdict = explanation["verdict"]
            badge_color = explanation["badge_color"]

            # Display Verdict Badge
            if verdict == "SCAM":
                st.error(f"### 🚨 VERDICT: HIGH RISK SCAM ({calibrated_score * 100:.1f}%)")
            elif verdict == "SUSPICIOUS":
                st.warning(f"### ⚠️ VERDICT: SUSPICIOUS / CAUTION ({calibrated_score * 100:.1f}%)")
            else:
                st.success(f"### ✅ VERDICT: SAFE / LEGITIMATE ({calibrated_score * 100:.1f}%)")

            st.progress(calibrated_score)

            # Highlighting Triggers in Text
            st.markdown("#### Highlighted Triggers & Context")
            highlighted_display = message_input
            for token in explanation["highlight_tokens"]:
                pattern = re.compile(re.escape(token), re.IGNORECASE)
                highlighted_display = pattern.sub(f"<mark style='background-color:#ffe082; padding:2px 4px; border-radius:3px;'><b>{token}</b></mark>", highlighted_display)

            st.markdown(f"<div style='background-color:#f9f9f9; padding:12px; border-radius:6px; border-left:4px solid {badge_color};'>{highlighted_display}</div>", unsafe_allow_html=True)

            # Plain-Language Reasons in Chosen Language
            st.markdown("#### Identified Indicators & Reasons")
            reasons_list = explanation["reasons"][lang_key]
            for r in reasons_list:
                st.markdown(f"- {r}")

            # URL Details if present
            if urls:
                st.markdown("#### Link Risk Inspection")
                for u_info in url_res["analyzed_urls"]:
                    u_status = "✅ Verified Domain" if u_info["is_whitelisted"] else ("🚨 Malicious/Lookalike" if u_info["heuristic_url_risk"] >= 0.5 else "⚠️ Unverified")
                    st.markdown(f"**URL**: `{u_info['url']}` — **Status**: {u_status} (Risk: {u_info['heuristic_url_risk']})")
                    for r_u in u_info["reasons"]:
                        st.caption(f"  • {r_u}")

            # Citizen Safety Advice
            st.markdown("#### 🛡️ Recommended Citizen Action")
            for adv in explanation["safety_advice"][lang_key]:
                st.markdown(f"**• {adv}**")

with tab_batch:
    st.subheader("Batch Evaluation for Test Sets")
    st.markdown("Upload a CSV file containing message records (with a `text` or `message` column) to run batch cyber scoring.")

    uploaded_file = st.file_uploader("Upload CSV file:", type=["csv"])
    if uploaded_file is not None:
        batch_df = pd.read_csv(uploaded_file)
        st.write(f"Loaded {len(batch_df)} rows from uploaded file.")
        st.dataframe(batch_df.head(5), use_container_width=True)

        if st.button("🚀 Run Batch Prediction", type="primary"):
            temp_in = PROJECT_ROOT / "data" / "temp_batch_in.csv"
            temp_out = PROJECT_ROOT / "data" / "temp_batch_out.csv"
            batch_df.to_csv(temp_in, index=False)

            from predict import predict_batch
            predict_batch(str(temp_in), str(temp_out))

            results_df = pd.read_csv(temp_out)
            st.success(f"Batch prediction complete! Evaluated {len(results_df)} instances.")
            st.dataframe(results_df[["text", "predicted_verdict", "confidence_score", "verdict_band", "reasons_english"]].head(10), use_container_width=True)

            csv_bytes = results_df.to_csv(index=False).encode("utf-8")
            st.download_button(
                label="📥 Download Predictions CSV",
                data=csv_bytes,
                file_name="cbl01_predictions.csv",
                mime="text/csv",
                use_container_width=True
            )
