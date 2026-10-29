# Fraud Detection System

An end-to-end Machine Learning pipeline and web application for detecting fraudulent transactions in financial data.

## Project Overview
- **Data Ingestion & Preprocessing**: Handling class imbalance (e.g., SMOTE, undersampling), feature scaling, and anomaly feature extraction.
- **Model Training**: Evaluation of multiple machine learning models (Random Forest, XGBoost, LightGBM, Logistic Regression).
- **Inference & API / UI**: Interactive dashboard / REST API for real-time transaction scoring and fraud alerts.

## Project Structure
```text
Fraud-detection/
├── data/              # Raw and processed datasets (ignored in git)
├── notebooks/         # Exploratory Data Analysis & experiments
├── src/               # Source code modules
│   ├── data/          # Data loading & preprocessing
│   ├── models/        # Training & evaluation pipelines
│   └── app/           # Web app / API interface (Streamlit / FastAPI)
├── models/            # Serialized trained model artifacts
├── requirements.txt   # Project dependencies
└── README.md          # Project documentation
```
