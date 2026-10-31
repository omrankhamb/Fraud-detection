# Dataset Card: CBL-01 Indian Multilingual Scam Corpus

## 1. Dataset Summary
The CBL-01 dataset is a curated, multi-source corpus of SMS, WhatsApp, and conversational messages in **Hindi**, **Marathi**, **Roman Hinglish**, and **English**, designed specifically for detecting smishing, phishing, and scam messages targeting users in India.

- **Primary Languages**: Hindi (`hi`), Marathi (`mr`), Hinglish (`hi-Latn`), English (`en`).
- **Scripts**: Devanagari, Latin (Romanized).
- **Target Size**: 8,000 – 10,000 instances (~40% scam, ~60% legitimate).
- **Minimum per Language/Script**: $\ge$ 800 samples.

### 1.1 Complete Dataset Sources & Licensing

| # | Dataset / Source | Official URL | License / Access | Modality & Role |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **UCI SMS Spam Collection** | [archive.ics.uci.edu](https://archive.ics.uci.edu/dataset/228/sms+spam+collection) \| [HF](https://huggingface.co/datasets/sms_spam) \| [Kaggle](https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset) | CC BY 4.0 / Open | 5,574 English text messages for baseline legitimate (ham) & spam distribution. |
| **2** | **Hinglish & English Financial Scam Dataset** | [Hugging Face (`bolewara`)](https://huggingface.co/bolewara/hinglish-scam-text-dataset) | Open / Research | 3,787 Indian financial smishing & legitimate text messages in Roman Hinglish & English. |
| **3** | **Spam SMS in Hindi Language** | [IEEE Dataport](https://ieee-dataport.org/documents/spam-sms-hindi-language) / [DOI: 10.21227/5y8x-n678](https://dx.doi.org/10.21227/5y8x-n678) | Open Access (Free Account) | Devanagari Hindi spam & legitimate SMS corpus. |
| **4** | **SpamShield Multilingual Dataset** | [SpamShield Article](https://dev.to/arjun-m/i-built-a-multilingual-spam-detection-dataset-with-149k-messages-across-23-languages-52ac) | Open / Community | 149,000 messages across 23 languages (including Indic languages). |
| **5** | **Curated Indian Multilingual Scam Corpus** | Local Curated (`data/clean/`) | CC-BY 4.0 | Paraphrased templates covering Marathi, Hindi, and Hinglish across all 9 scam themes. |
| **6** | **PhishTank** | [phishtank.org](https://phishtank.org) | Developer API / Open Data | Verified active phishing URL database. |
| **7** | **OpenPhish** | [openphish.com](https://openphish.com) | Community Feed (Free) | Real-time zero-day phishing feed. |
| **8** | **URLhaus (abuse.ch)** | [urlhaus.abuse.ch](https://urlhaus.abuse.ch) | CC0 / Open Feed | Malicious URLs, malware and `.apk` mobile dropper links. |
| **9** | **Tranco Top Sites List** | [tranco-list.eu](https://tranco-list.eu) | Open Access | Top 1M benign domains for non-hardcoded whitelist & edit distance. |
| **10** | **I4C / Cyber Crime Portal** | [cybercrime.gov.in](https://cybercrime.gov.in) | Public Sector / Advisory | Indian cybercrime advisories (Digital Arrest, KYC, SIM swap). |
| **11** | **CERT-In** | [cert-in.org.in](https://www.cert-in.org.in) | Government Advisory | Official technical smishing & security bulletins. |
| **12** | **RBI Kehta Hai** | [rbikehtahai.rbi.org.in](https://rbikehtahai.rbi.org.in) | Public Awareness | Authentic banking alert phrasing and OTP safety patterns. |

---

## 2. Scam Themes & Taxonomies
1. **KYC & Account Expiration**: Fake bank/PAN deactivation threats requiring immediate verification.
2. **UPI Cashback & Refund Bait**: Claims of pending PhonePe/GooglePay/Paytm rewards.
3. **Lottery & Lucky Draw**: Fake KBC, automobile, or brand rewards.
4. **Part-Time Job / Task Scam**: Telegram YouTube video liking, daily income guarantees.
5. **Electricity Bill Disconnection**: Threatening same-night disconnection by fake discom officers.
6. **Customs & Parcel Fraud**: Fake India Post/courier package holding notices requiring address or fee payment.
7. **Digital Arrest & Police Impersonation**: Intimidation by fake CBI, ED, Cyber Police, or court notices.
8. **Predatory Loan Apps & Instant Credit**: Unsolicited high-interest instant loan links.
9. **Malicious APK Droppers**: Links prompting download of malicious `.apk` packages (e.g., "BankUpdate.apk").

---

## 3. Hard Negatives & Adversarial Controls
- **Genuine Bank Alerts & OTPs**: Authentic SBI, HDFC, ICICI, Axis alerts containing numeric codes and security warnings.
- **Genuine Delivery Trackers**: India Post, Amazon, Flipkart, BlueDart tracking SMS with legitimate URLs.
- **Scams with No Link**: Pure extortion or callback request scams (phone calls/WhatsApp chat).
- **Scams with Obfuscated Links**: Obfuscated URLs (e.g., `hxxp`, spaces around dots, punycode).

---

## 4. Provenance & Schema
Every record is tracked in `data/metadata.csv` with the following schema:
- `id`: Unique identifier (e.g., `IND_SCAM_0001`).
- `text`: Cleaned message content (with sensitive PII masked).
- `label`: `1` (Scam/Phishing) or `0` (Legitimate/Ham).
- `theme`: Specific theme category.
- `language`: `hi`, `mr`, `hinglish`, `en`.
- `script`: `Devanagari`, `Latin`, `Mixed`.
- `source`: Public repository, official advisory, donated, or synthetic.
- `source_url`: URL of source repository or advisory.
- `collection_method`: Manual collection, API scrape, or seed template expansion.
- `licence`: CC-BY, Public Domain, Research Only, etc.
- `date_collected`: ISO 8601 timestamp.
- `is_synthetic`: Boolean (`True` / `False`).
- `annotator`: Annotator ID or LLM generator model tag.

---

## 5. Annotation & Quality Control
- **Agreement Metric**: Inter-annotator agreement on a 300-sample validation batch measured via Cohen's Kappa ($\kappa \ge 0.80$).
- **De-identification**: Phone numbers masked as `<PHONE>`, OTPs as `<OTP>`, and currency amounts as `<AMOUNT>`.
