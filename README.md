# 🛡️ CBL-01: Multilingual Scam SMS & Malicious Link Detector
### *Detecting Scam SMS and WhatsApp Messages in Indian Languages and Hinglish*

[![Python Version](https://img.shields.io/badge/Python-3.10%20%7C%203.14-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Domain](https://img.shields.io/badge/Domain-Cybersecurity%20%26%20NLP-orange.svg)]()
[![Languages](https://img.shields.io/badge/Languages-Hindi%20%7C%20Marathi%20%7C%20Hinglish%20%7C%20English-purple.svg)]()

---

## 1. Project Overview & Goal

With the rapid expansion of digital financial services in India (UPI, net banking, instant credit), citizens face an onslaught of sophisticated smishing (SMS phishing) and social engineering scams delivered across SMS, WhatsApp, and messaging channels.

**CBL-01** is an end-to-end cyber defense system specifically built to:
1. **Detect Scam Messages**: Identify fraudulent text in **Hindi (Devanagari)**, **Marathi (Devanagari)**, **Roman Hinglish**, and **English**.
2. **Flag Suspicious & Lookalike Links**: Unmask typosquatted banking domains (`sbi-kyc-verify[.]net`), URL shorteners, malicious `.apk` droppers, and blocklisted phishing URLs.
3. **Generalize to Unseen Scam Themes**: Built using strict **Leave-One-Theme-Out (LOTO)** cross-validation to guarantee zero-shot defense against novel fraud tactics without data leakage.
4. **Prevent False Positives on Hard Negatives**: Accurately differentiate scam alerts from legitimate bank OTPs, delivery notifications, and utility reminders.
5. **Trilingual Explainability & Actionable Guidance**: Deliver plain-language explanations in **English, Hindi, and Marathi**, along with immediate advice (National Cyber Crime Helpline **1930** and **cybercrime.gov.in**).

---

## 2. System Architecture

```text
Incoming Message (Text + Sender ID)
       │
       ├──► 1. Preprocessing Engine (Unicode NFKC, Zero-Width Clean, Hinglish Normalizer, Entity Masker)
       │        ├── Masked Text (with <URL>, <PHONE>, <OTP>, <AMOUNT>)
       │        └── Extracted URLs & Entities
       │
       ├──► 2. Feature Extraction & Specialization Layer
       │        ├── [Text Stream]: Char n-grams (2-5) + MuRIL / XLM-R Embeddings
       │        ├── [URL Stream]: Lexical Structure, Suspicious TLDs, Brand Lookalike (Levenshtein Distance)
       │        └── [Rule Cue Stream]: Urgency Cues, Credential Harvest, Threat Patterns, Sender ID Mismatch
       │
       ├──► 3. Predictive Model Stack
       │        ├── Model A: Char n-gram TF-IDF + Calibrated Linear Classifier (Baseline)
       │        ├── Model B: Fine-Tuned MuRIL (google/muril-base-cased)
       │        └── Model C: LightGBM / XGBoost URL Specialist
       │
       ├──► 4. Stacking Fusion & Probability Calibration
       │        └── Calibrated Probability [0.0 - 1.0]
       │
       └──► 5. Decision & Trilingual Explanation Output
                ├── Verdict Band: Safe (<0.30) | Suspicious (0.30-0.70) | Scam (>0.70)
                ├── Text Trigger Highlights (SHAP / Token Attribution)
                ├── Plain Reasons (English, Hindi, Marathi)
                └── Action Guidance (Helpline 1930 / cybercrime.gov.in)
```

---

## 3. Scam Taxonomy & Hard Negatives

The system provides coverage across primary Indian cyber fraud vectors:

| Scam Theme | Description & Example Cues |
| :--- | :--- |
| **KYC / Account Blocked** | Threats of immediate bank or PAN deactivation unless KYC is completed via an unverified link. |
| **Electricity Disconnection** | *"Dear consumer, your electricity will be disconnected tonight at 9:30 PM due to unpaid bill."* |
| **Digital Arrest / Impersonation**| Fake CBI, Enforcement Directorate, or Mumbai Cyber Police summons claiming money laundering. |
| **UPI Refund / Cashback** | Fake PhonePe, GPay, or Paytm cashback claims requesting a PIN to "receive" money. |
| **Part-Time Task Scam** | Telegram-based YouTube video liking or Amazon product rating jobs offering daily earnings. |
| **Customs / Parcel Delivery** | Fake India Post or courier package on hold requiring small clearance fees or address re-entry. |
| **Lottery / Prize** | Fake KBC lottery notices or vehicle reward notifications asking for processing charges. |
| **Malicious APK Droppers** | Prompts to install `.apk` files masquerading as bank updates or utility apps. |
| **Predatory Loan Apps** | Unsolicited loan approvals demanding excessive device permissions. |

### 🔒 Hard Negatives (Crucial for Low False Positive Rates)
To prevent the model from assuming *"any message with an OTP or a link is a scam"*, the training corpus includes:
- **Authentic Bank OTPs**: Genuine SBI, HDFC, ICICI, Axis SMS with standard format and security disclaimers (*"Never share your OTP with anyone"*).
- **Legitimate Delivery Trackers**: India Post, Amazon, Flipkart, BlueDart tracking updates containing genuine tracking URLs.
- **Genuine Utility & Service Alerts**: Authentic electricity bill receipts, telecom balance notifications, and flight/train confirmations.

---

## 4. Repository Structure

```text
Fraud-detection/
├── data/
│   ├── raw/                  # Raw input datasets & external feeds
│   ├── clean/                # Cleaned, deduplicated, and normalized datasets
│   └── metadata.csv          # Provenance sheet (id, source, license, language, theme)
├── notebooks/                # Exploratory Data Analysis & experiments
├── src/
│   ├── __init__.py
│   ├── preprocess.py         # Unicode, zero-width stripping, entity masking, transliteration
│   ├── features_url.py       # URL lexical features, brand lookalike edit distance, blocklists
│   ├── rules.py              # Rule cue flags (urgency, threats, credential demands, sender mismatch)
│   ├── train_baseline.py     # Char n-gram TF-IDF + LogisticRegression / LinearSVC
│   ├── train_muril.py        # MuRIL fine-tuning with class weights & early stopping
│   ├── train_xlmr.py         # XLM-RoBERTa / IndicBERT fine-tuning
│   ├── fusion.py             # Stacking meta-classifier + probability calibration
│   ├── explain.py            # SHAP / keyword highlighting & multilingual reasons (EN, HI, MR)
│   └── evaluate.py           # Leave-One-Theme-Out evaluation, PR-AUC, error analysis
├── app/
│   └── app.py                # Streamlit interactive UI dashboard
├── predict.py                # Batch prediction CLI for hidden test sets (CSV in -> CSV out)
├── models/                   # Serialized model checkpoints and scalers
├── DATASET_CARD.md           # Dataset documentation, provenance, ethics & bias
├── MODEL_CARD.md             # Model architectures, hyperparameters & limitations
├── requirements.txt          # Python dependencies
└── README.md                 # Complete project documentation
```

---

## 5. Decision Logic: How a Message is Flagged

The system applies a defense-in-depth approach where no single signal unilaterally decides the verdict:

1. **Known Malicious Link**: Direct match against PhishTank, URLhaus, or OpenPhish.
2. **Brand Lookalike / Typosquatting**: High string similarity to trusted domains (`sbi.co.in`, `hdfcbank.com`, `paytm.com`, `indiapost.gov.in`) while hosted on an unauthorized host.
3. **High-Risk URL Heuristics**: Raw IP host, URL shorteners (`bit.ly`, `tinyurl`), `.apk` extensions, or spam-heavy TLDs (`.xyz`, `.top`, `.icu`).
4. **Psychological Manipulation Cues**: Artificial urgency (*"turant"*, *"24 hours"*), fear/threats (*"arrest"*, *"disconnected"*), or financial bait.
5. **Contextual Mismatch**: Banking alerts originating from personal 10-digit mobile numbers rather than registered Sender IDs.
6. **Ensemble & Calibrated Score**: Stacked meta-learner output categorized into three operational bands:
   - **$< 0.30$ (Safe)**: Green cleared status.
   - **$0.30 - 0.70$ (Suspicious / Caution)**: User warned to verify independently.
   - **$> 0.70$ (Scam)**: Critical red alert with advice to block and report.

---

## 6. Getting Started

### Installation
```bash
# 1. Clone repository
git clone https://github.com/omrankhamb/Fraud-detection.git
cd Fraud-detection

# 2. Set up virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt
```

### Preprocessing & Verification
```bash
python src/preprocess.py
python src/features_url.py
```

### Running Batch Prediction (for Test Sets)
```bash
python predict.py --input data/test_samples.csv --output predictions.csv
```

### Launching the Interactive Web UI
```bash
streamlit run app/app.py
```

---

## 7. Performance Benchmarks & Evaluation

Evaluation follows the **Leave-One-Theme-Out (LOTO)** protocol to reflect honest generalization:

| Metric | Target / Benchmark | Purpose |
| :--- | :--- | :--- |
| **Unseen Theme Macro-F1** | **0.85 – 0.93** | Measures real-world generalization on unseen scams |
| **Hard Negative FPR** | **< 2.0%** | Guarantees authentic bank OTPs and delivery links are not blocked |
| **Per-Language F1** | Evaluated on Hindi, Marathi, Hinglish, English | Validates balance across all targeted Indian languages |
| **Calibration (Brier Score)** | Low deviation | Ensures probability matches real posterior risk |

---

## 8. Responsible AI & Advisory

This tool provides educational and real-time defensive guidance. When a high-risk message is detected, users are directed to official Indian cyber reporting channels:
* **National Cyber Crime Reporting Portal**: [cybercrime.gov.in](https://cybercrime.gov.in)
* **National Cyber Helpline**: **1930**
* **Chakshu (Sanchar Saathi)**: For reporting suspicious communication under DoT.
