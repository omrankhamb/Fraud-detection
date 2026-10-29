# Fraud Detection System

An end-to-end Machine Learning pipeline and web application for detecting fraudulent transactions in financial data.

## Features
- **Data Pipeline**: Synthetic transaction generator & Kaggle dataset support.
- **Model Training**: Balanced Random Forest / XGBoost with evaluation on ROC-AUC, PR-AUC, and precision-recall trade-offs.
- **Interactive UI**: Streamlit web dashboard for real-time risk assessment and fraud scoring.

---

## Project Structure
```text
Fraud-detection/
├── data/                       # Datasets (ignored from git)
├── models/                     # Serialized model artifacts (.joblib, ignored from git)
├── src/
│   ├── data/
│   │   └── generate_data.py    # Synthetic transaction generator
│   ├── models/
│   │   └── train.py            # Preprocessing and model training pipeline
│   └── app/
│       └── app.py              # Streamlit interactive dashboard
├── requirements.txt            # Python dependencies
└── README.md
```

---

## Quickstart

### 1. Setup Virtual Environment
```bash
# Recommended with Python 3.10
py -3.10 -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Generate Synthetic Data & Train Model
```bash
python -m src.models.train
```

### 3. Launch Streamlit Dashboard
```bash
streamlit run src/app/app.py
```
