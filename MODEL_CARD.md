# Model Card: CBL-01 Multilingual Scam & Phishing Detector

## 1. Model Details
- **Architecture**: Multi-stage stacked ensemble:
  1. **Text Baseline**: Character n-grams (2–5) TF-IDF + Calibrated Linear Classifier.
  2. **Multilingual Transformer**: MuRIL (`google/muril-base-cased`) fine-tuned with class-weighted cross-entropy.
  3. **Secondary Transformer**: XLM-RoBERTa / IndicBERT.
  4. **URL Specialist**: Gradient boosted decision tree (LightGBM) on lexical, lookalike, and threat feed features.
  5. **Stacking Meta-Learner**: Calibrated Logistic Regression / LightGBM with Platt scaling / Isotonic regression.
- **Input Modalities**: Raw text message string, extracted URLs, optional Sender ID header.
- **Output**:
  - Calibrated Probability $[0.0, 1.0]$
  - Categorical Verdict: `Safe` ($<0.30$), `Suspicious` ($0.30 - 0.70$), `Scam` ($>0.70$)
  - Trilingual Explainability: Highlighting trigger tokens and plain-language rationale in English, Hindi, and Marathi.
  - Actionable advice: Helpline 1930 / cybercrime.gov.in.

---

## 2. Intended Use
- **Primary Use**: Screening incoming SMS and WhatsApp messages on mobile devices and security gateways to protect Indian citizens from cyber fraud.
- **Out of Scope**: Automated blocking of critical banking communications without human review in the uncertain score band ($0.30 - 0.70$).

---

## 3. Evaluation Protocols
- **Theme Holdout (Zero-Shot Generalization)**: Validation evaluated strictly by holding out unseen themes (e.g., *Digital Arrest*, *Electricity Disconnection*).
- **Target Metrics**:
  - Unseen Theme Macro-F1: $0.85 - 0.93$
  - Hard-Negative False Positive Rate (FPR): $< 2.0\%$
  - Calibration: Brier score minimization.

### 3.1 Measured Benchmark Results (Full Corpus: 5,258 Instances)
- **Macro-F1**: `0.9814`
- **Scam Class F1**: `0.9678` (Precision: `96.30%`, Recall: `97.27%`)
- **PR-AUC**: `0.9959`
- **ROC-AUC**: `0.9835`
- **Brier Calibration Score**: `0.0064`
- **Hard-Negative False Positive Rate (FPR)**: `0.57%` across 4,563 legitimate communications.
- **Unseen Theme Accuracy**: `100.0%` detection on held-out scam themes (*Digital Arrest*, *Customs Parcel*, *Electricity Disconnection*).

---

## 4. Ethical Considerations & Biases
- Low false-positive tolerance on legitimate bank OTPs and delivery alerts to avoid critical alert suppression.
- Transparent explainability ensures users understand why a message was flagged rather than relying on a black box.
