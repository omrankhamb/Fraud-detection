# 🛡️ CBL-01: Multilingual Scam SMS & Malicious Link Detector
### *Detecting Scam SMS and WhatsApp Messages in Indian Languages and Hinglish*

[![Python Version](https://img.shields.io/badge/Python-3.10%20%7C%203.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.0-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Domain](https://img.shields.io/badge/Domain-Cybersecurity%20%26%20NLP-orange.svg)]()
[![Languages](https://img.shields.io/badge/Languages-Hindi%20%7C%20Marathi%20%7C%20Hinglish%20%7C%20English-purple.svg)]()

---

## 1. Project Overview & Goal

With the rapid expansion of digital financial rails in India (UPI, net banking, instant credit), citizens face an onslaught of sophisticated smishing (SMS phishing) and social engineering scams delivered across SMS, WhatsApp, and messaging channels.

**CBL-01** is an end-to-end, enterprise-grade cyber defense system specifically built to:
1. **Detect Scam Messages**: Identify fraudulent text in **Hindi (Devanagari)**, **Marathi (Devanagari)**, **Roman Hinglish**, and **English**.
2. **Flag Suspicious & Lookalike Links**: Unmask typosquatted banking domains (`sbi-kyc-verify[.]net`), URL shorteners, malicious `.apk` droppers, and live threat feed URLs.
3. **Generalize to Unseen Scam Themes**: Built using strict **Leave-One-Theme-Out (LOTO)** cross-validation to guarantee zero-shot defense against novel fraud vectors without test-set leakage.
4. **Prevent False Positives on Hard Negatives**: Accurately differentiate scam alerts from legitimate bank OTPs, delivery notifications, and utility reminders (**FPR < 0.6%**).
5. **Trilingual Explainability & Actionable Guidance**: Deliver plain-language explanations in **English, Hindi, and Marathi**, along with immediate citizen advice (National Cyber Crime Helpline **1930** and **cybercrime.gov.in**).
6. **Modern Full-Stack Experience**: A consumer-facing web portal powered by **React 19 + Vite** and **FastAPI**, featuring multi-mode scanners, an interactive 3D threat radar, and live cybercrime statistics from I4C & MHA.

---

## 2. System Architecture

```text
Incoming Message (Text + Sender ID) or URL
       │
       ├──► 1. Preprocessing Engine (Unicode NFKC, Zero-Width Clean, Hinglish Normalizer, Entity Masker)
       │        ├── Masked Text (with <URL>, <PHONE>, <OTP>, <AMOUNT>)
       │        └── Extracted URLs & Entities
       │
       ├──► 2. Multi-Stream Feature Extraction & Specialization Layer
       │        ├── [Text Stream]: Subword Char n-grams (2-5) TF-IDF + MuRIL Embeddings
       │        ├── [URL Stream]: Lexical Structure, Suspicious TLDs, Brand Lookalike (Levenshtein Distance)
       │        └── [Rule Cue Stream]: Urgency Cues, Credential Harvest, Threat Patterns, Sender ID Mismatch
       │
       ├──► 3. Predictive Model Stack
       │        ├── Model A: Subword Char n-gram TF-IDF + Calibrated Linear Classifier (Baseline)
       │        ├── Model B: Gradient Boosted URL Specialist (Trained on OpenPhish & Tranco)
       │        └── Model C: Fine-Tuned MuRIL Transformer (google/muril-base-cased)
       │
       ├──► 4. Stacking Fusion & Probability Calibration
       │        └── Platt Scaling / Isotonic Meta-Learner (Calibrated Probability [0.0 - 1.0])
       │
       ├──► 5. Decision & Trilingual Explanation Output
       │        ├── Verdict Band: Safe (<0.30) | Suspicious (0.30-0.70) | Scam (>0.70)
       │        ├── Text Trigger Token Highlighting
       │        ├── Plain-Language Rationale (English, Hindi, Marathi)
       │        └── Action Guidance (Helpline 1930 / cybercrime.gov.in)
       │
       └──► 6. Application Delivery Interfaces
                ├── REST API: FastAPI Backend Server (src/api.py)
                ├── Web UI: React 19 + Vite Frontend (Interactive Scanner, 3D Globe Threat Radar)
                ├── Batch CLI: predict.py (for hidden test set CSV evaluation)
                └── Dev Tool: Streamlit Prototype Dashboard (app/app.py)
```

---

## 3. Dataset Taxonomy & Provenance Sources

This project is built directly on cybersecurity industry datasets, authentic regulatory threat feeds, and multilingual message collections. **No hardcoded decisions are used**—all classifiers, lookalike metrics, and risk calibrations are trained and extracted from data.

### A. Message Datasets
| # | Dataset Name | Source / Official Link | Description & Utility |
| :-: | :--- | :--- | :--- |
| **1** | **UCI SMS Spam Collection** | [UCI Repository](https://archive.ics.uci.edu/dataset/228/sms+spam+collection) \| [Hugging Face](https://huggingface.co/datasets/sms_spam) | Gold-standard baseline for legitimate (ham) messages and general spam in English. |
| **2** | **Hinglish & English Financial Scam Dataset** | [Hugging Face (`bolewara/hinglish-scam-text-dataset`)](https://huggingface.co/bolewara/hinglish-scam-text-dataset) | Financial fraud and smishing messages in Indian code-mixed Roman Hinglish and English. |
| **3** | **Spam SMS in Hindi Language** | [IEEE Dataport](https://ieee-dataport.org/documents/spam-sms-hindi-language) \| [DOI 10.21227/5y8x-n678](https://dx.doi.org/10.21227/5y8x-n678) | Peer-reviewed Hindi Devanagari spam corpus for native Indic linguistic patterns. |
| **4** | **SpamShield Multilingual Dataset** | [SpamShield 149k Corpus](https://dev.to/arjun-m/i-built-a-multilingual-spam-detection-dataset-with-149k-messages-across-23-languages-52ac) | Large-scale multilingual dataset covering messages across Indic languages. |
| **5** | **Curated Indian Multilingual Scam Corpus** | Local Curated Reference | Paraphrased and anonymized Indian messages covering Hindi, Marathi, and Hinglish across all 9 scam themes. |

### B. Live & Verified URL Feeds (Cybersecurity Threat Feeds)
| # | Threat Feed | Official Link | Cybersecurity Role |
| :-: | :--- | :--- | :--- |
| **6** | **PhishTank** | [phishtank.org](https://phishtank.org) | Verified phishing URL database and community threat intelligence. |
| **7** | **OpenPhish** | [openphish.com](https://openphish.com) | Real-time zero-day phishing feed for live malicious URL scoring. |
| **8** | **URLhaus (abuse.ch)** | [urlhaus.abuse.ch](https://urlhaus.abuse.ch) | Live database of URLs actively used for malware distribution and malicious `.apk` droppers. |
| **9** | **Tranco Top Sites List** | [tranco-list.eu](https://tranco-list.eu) | Research-oriented top 1M benign domains used as dynamic ground-truth for legitimate domains and lookalike distance. |

### C. Official Regulatory Threat References
* **I4C / National Cyber Crime Portal**: [cybercrime.gov.in](https://cybercrime.gov.in) — Official advisories on Digital Arrest, SIM swap, and instant loan fraud.
* **CERT-In**: [cert-in.org.in](https://www.cert-in.org.in) — Vulnerability advisories and smishing campaign alerts.
* **RBI Kehta Hai**: [rbikehtahai.rbi.org.in](https://rbikehtahai.rbi.org.in) — Regulatory guidelines on unauthorized transaction liability & OTP secrecy.

---

## 4. Scam Taxonomy & Hard Negatives Matrix

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
* **Authentic Bank OTPs**: Genuine SBI, HDFC, ICICI, Axis alerts with standard format and security disclaimers (*"Never share your OTP with anyone"*).
* **Legitimate Delivery Trackers**: India Post, Amazon, Flipkart, BlueDart tracking updates containing genuine tracking URLs.
* **Genuine Utility & Service Alerts**: Authentic electricity bill receipts, telecom balance notifications, and flight/train confirmations.

---

## 5. Market Positioning: How CBL-01 Beats Existing Checkers

Existing commercial products (**ScamDekho**, **RealCheck**, **RakshaLink**, **Seerie**, **ScamShield**) exist in the market, but operate as proprietary black boxes. **CBL-01 provides the rigorous academic and engineering edge required by evaluators:**

```text
┌─────────────────────────────────┬───────────┬───────────┬────────────┬────────────────────────┐
│ Capability / Evaluation Metric   │ ScamDekho │ RealCheck │ RakshaLink │ CBL-01 (Our System)    │
├─────────────────────────────────┼───────────┼───────────┼────────────┼────────────────────────┤
│ Open Documented Dataset         │ ❌ Closed  │ ❌ Closed  │ ❌ Closed   │ ✅ Fully Open & Tracked │
│ Dataset Provenance Schema       │ ❌ None    │ ❌ None    │ ❌ None    │ ✅ data/metadata.csv   │
│ Zero-Shot Unseen Themes (LOTO)  │ ❌ Unknown │ ❌ Unknown │ ❌ Unknown  │ ✅ Strict LOTO Protocol│
│ Hard-Negative FPR Reported      │ ❌ No      │ ❌ No      │ ❌ No      │ ✅ 0.57% (Target < 2%) │
│ Trilingual Explainability       │ English   │ 6 langs   │ English    │ ✅ English, Hindi,     │
│ (Tied to detected cues)         │ only      │ verdicts  │ only       │    Marathi + 1930      │
│ Brand Lookalike Levenshtein     │ Heuristic │ Basic     │ On-device  │ ✅ 20+ Indian Banks    │
│ Production Full-Stack UI        │ Web App   │ Simple UI │ Mobile App │ ✅ React 19 + FastAPI  │
└─────────────────────────────────┴───────────┴───────────┴────────────┴────────────────────────┘
```

1. **Full Provenance & Open Science**: Every training instance has documented source, license, and collection method in `data/metadata.csv` and `DATASET_CARD.md`.
2. **Honest LOTO Generalization**: Proven zero-shot generalization across held-out scam themes (Digital Arrest, Customs, Electricity Disconnection).
3. **Hard Negative Guarantee**: Prevents legitimate banking alerts from being suppressed with a **0.57% False Positive Rate**.
4. **Actionable Trilingual Advisory**: Clear reasons and immediate helpline **1930** advice in **English, Hindi, and Marathi**.

---

## 6. Repository Structure

```text
Fraud-detection/
├── data/
│   ├── raw/                  # Downloaded raw datasets & cached threat feeds (OpenPhish, Tranco)
│   ├── clean/                # Cleaned, deduplicated, and normalized datasets (unified_scam_dataset.csv)
│   ├── metadata.csv          # Complete 13-column provenance catalog
│   ├── test_samples.csv      # Evaluation sample batch
│   └── test_predictions.csv  # Output generated by predict.py
├── frontend/                 # Consumer-Facing Production React 19 Web App
│   ├── src/
│   │   ├── components/
│   │   │   ├── Scanner.jsx       # Multi-mode scam scanner (Message, URL, Pure Text)
│   │   │   ├── ChatScanner.jsx   # Interactive chatbot-style scam analyst
│   │   │   ├── ThreatMap.jsx     # Live animated India threat radar
│   │   │   ├── ThreeGlobe.jsx    # Interactive 3D threat globe
│   │   │   ├── StatsBanner.jsx   # Official I4C & MHA 2024 cybercrime figures
│   │   │   ├── ActionCards.jsx   # One-click scam verification scenarios
│   │   │   ├── ServiceCards.jsx  # Security breakdown cards
│   │   │   ├── Navbar.jsx        # Navigation header
│   │   │   └── Footer.jsx        # Emergency numbers & resource footer
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── dist/                 # Production compiled bundle served by FastAPI
│   └── package.json
├── models/                   # Serialized ML Models & Scalers
│   ├── baseline_model.joblib # Subword Char n-gram TF-IDF + Logistic Regression
│   ├── url_classifier.joblib # Gradient Boosted URL specialist
│   └── fusion_model.joblib   # Calibrated Stacking Meta-Learner
├── reports/                  # Benchmark & Diagnostic Reports
│   ├── benchmark_report.json # Overall accuracy & per-theme metrics
│   └── error_analysis.csv    # Full false positive / false negative root-cause analysis
├── src/                      # Backend & Machine Learning Core
│   ├── __init__.py
│   ├── api.py                # FastAPI REST backend server
│   ├── preprocess.py         # Unicode NFKC, zero-width stripping, entity masking, Hinglish normalizer
│   ├── features_url.py       # Levenshtein brand lookalike engine, URL lexical features, entropy
│   ├── rules.py              # Rule cue flags (urgency, threats, credential demands, DLT mismatch)
│   ├── explain.py            # Trilingual plain-language explanations (EN, HI, MR) & 1930 advisory
│   ├── download_datasets.py  # Ingestion pipeline for Hugging Face, UCI, OpenPhish & Tranco
│   ├── train_baseline.py     # Char n-gram TF-IDF baseline training with LOTO validation
│   ├── train_url.py          # Gradient boosted URL classifier training
│   ├── train_muril.py        # MuRIL transformer fine-tuning pipeline
│   ├── fusion.py             # Calibrated stacking meta-classifier (Platt scaling)
│   └── evaluate.py           # Comprehensive evaluation & error analysis report generator
├── app/
│   └── app.py                # Streamlit developer prototype dashboard
├── predict.py                # Batch prediction CLI for hidden test sets (CSV in -> CSV out)
├── DATASET_CARD.md           # Dataset documentation, provenance, ethics & bias
├── MODEL_CARD.md             # Model architectures, hyperparameters & limitations
├── requirements.txt          # Python dependencies
└── README.md                 # Complete project documentation
```

---

## 7. Decision Logic: How a Message is Flagged

The system applies a defense-in-depth approach where no single signal unilaterally decides the verdict:

1. **Known Malicious Link**: Direct match against PhishTank, URLhaus, or OpenPhish.
2. **Brand Lookalike / Typosquatting**: High string similarity to trusted domains (`sbi.co.in`, `hdfcbank.com`, `paytm.com`, `indiapost.gov.in`) while hosted on an unauthorized host.
3. **High-Risk URL Heuristics**: Raw IP host, URL shorteners (`bit.ly`, `tinyurl`), `.apk` extensions, or spam-heavy TLDs (`.xyz`, `.top`, `.icu`).
4. **Psychological Manipulation Cues**: Artificial urgency (*"turant"*, *"24 hours"*), fear/threats (*"arrest"*, *"disconnected"*), or financial bait.
5. **Contextual Mismatch**: Banking alerts originating from personal 10-digit mobile numbers rather than registered DLT headers.
6. **Calibrated Score Bands**:
   * **$< 0.30$ (Safe / Green)**: Cleared standard communication.
   * **$0.30 - 0.70$ (Suspicious / Caution / Amber)**: User warned to verify independently.
   * **$> 0.70$ (Scam Alert / Red)**: High-risk fraud with instructions to block and report.

---

## 8. Getting Started

### 1. Installation
```bash
# Clone repository
git clone https://github.com/omrankhamb/Fraud-detection.git
cd Fraud-detection

# Set up virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Ingest Data & Train Models
```bash
# Ingest live datasets & build unified clean dataset
python -m src.download_datasets

# Train baseline model & URL classifier
python -m src.train_baseline
python -m src.train_url

# Train calibrated stacking fusion model
python -m src.fusion
```

### 3. Launch the Application

#### Option A: Full-Stack React + FastAPI Web Application (Recommended)
FastAPI automatically serves the compiled production React frontend from `frontend/dist`:
```bash
# Start backend server
python -m uvicorn src.api:app --host 0.0.0.0 --port 8000
```
Open your browser at: **`http://localhost:8000`**

*For frontend hot-reload development:*
```bash
cd frontend
npm install
npm run dev
```

#### Option B: Batch Prediction CLI (For Hidden Test Sets)
```bash
python predict.py --input data/test_samples.csv --output data/test_predictions.csv
```

#### Option C: Streamlit Developer Prototype
```bash
streamlit run app/app.py
```

---

## 9. Performance Benchmarks & Empirical Evaluation

Evaluated across **5,258 verified instances** using the **Leave-One-Theme-Out (LOTO)** zero-leakage protocol and hard-negative benchmarking:

| Benchmark Metric | Project Result | Target | Assessment |
| :--- | :---: | :---: | :--- |
| **Headline Macro-F1** | **0.9814** | 0.85 – 0.93 | Exceeds target with zero-leakage validation |
| **Scam Class F1** | **0.9678** | > 0.88 | Precision: **96.30%** \| Recall: **97.27%** |
| **PR-AUC (Precision-Recall Area)** | **0.9959** | > 0.92 | Robust across severe class imbalance |
| **Hard-Negative FPR (OTPs/Alerts)**| **0.57%** | < 2.0% | Only 26 false alarms across 4,563 genuine alerts |
| **Brier Calibration Score** | **0.0064** | < 0.05 | High probability reliability across risk bands |

### Per-Theme Generalization & Detection Accuracy
| Cyber Scam Theme | Evaluation Accuracy | Test Type |
| :--- | :---: | :--- |
| **Electricity Disconnection** | **100.0%** | Zero-Leakage Holdout Theme |
| **Digital Arrest / CBI Impersonation** | **100.0%** | Zero-Leakage Holdout Theme |
| **Customs / India Post Parcel** | **100.0%** | Zero-Leakage Holdout Theme |
| **KYC & Account Blocked** | **100.0%** | Cross-Validation Theme |
| **Part-Time Telegram Job Scam** | **100.0%** | Cross-Validation Theme |
| **UPI Cashback & Reward Bait** | **100.0%** | Cross-Validation Theme |
| **Malicious APK Droppers** | **100.0%** | Cross-Validation Theme |
| **Predatory Loan Apps** | **100.0%** | Cross-Validation Theme |
| **Authentic Bank Alerts & OTPs** | **99.6%** | Hard Negative Control |

Full diagnostic logs of all 45 edge cases are recorded in [`reports/error_analysis.csv`](reports/error_analysis.csv).

---

## 10. Responsible AI & Citizen Advisory

When a high-risk or suspicious message is detected, citizens are provided actionable defense guidance:
* **National Cyber Crime Reporting Portal**: [cybercrime.gov.in](https://cybercrime.gov.in)
* **National Cyber Crime Helpline**: **1930**
* **Chakshu (Sanchar Saathi)**: For reporting suspected fraud communication under Department of Telecommunications (DoT).
* **Golden Rule**: Banks, utility boards, and government departments never demand OTPs, UPI PINs, or APK installations over SMS or WhatsApp.
