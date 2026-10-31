"""
FastAPI Backend Server for CBL-01 Multilingual Scam & Link Detector.
Powers the ScamDekho-style React + Vite Frontend.
"""

from pathlib import Path
import sys
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Ensure src modules are resolvable
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.explain import generate_explanation, SAFETY_ADVICE
from src.features_url import analyze_message_urls, extract_url_features
from src.preprocess import clean_message
from src.rules import extract_rule_cues

# Load ML artifacts if available
BASELINE_PATH = PROJECT_ROOT / "models" / "baseline_model.joblib"
FUSION_PATH = PROJECT_ROOT / "models" / "fusion_model.joblib"
fusion_artifact = None
baseline_pipe = None

try:
    import joblib
    if FUSION_PATH.exists():
        fusion_artifact = joblib.load(FUSION_PATH)
    if BASELINE_PATH.exists():
        baseline_pipe = joblib.load(BASELINE_PATH)["pipeline"]
except Exception as e:
    print(f"Warning loading ML artifacts in api.py: {e}")

app = FastAPI(
    title="CBL-01 Cyber Defense API",
    description="Multilingual Scam SMS & Malicious Link Detection API for Indian Cyber Threats",
    version="1.0.0",
)

# Enable CORS for React frontend (Vite default: http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MessageScanRequest(BaseModel):
    text: str = Field(..., description="Message text in Hindi, Marathi, Hinglish, or English")
    sender_id: Optional[str] = Field(None, description="Sender ID header or phone number (e.g. VK-SBIINB, 9876543210)")


class URLScanRequest(BaseModel):
    url: str = Field(..., description="Web address or link to analyze")


# Mock live feed of real-time scam incidents across Indian cities for the threat map
LIVE_SCAM_PATTERNS = [
    {
        "id": "SCAM-901",
        "theme": "UPI Fraud",
        "city": "Pune",
        "state": "Maharashtra",
        "coordinates": [18.5204, 73.8567],
        "snippet": "PhonePe cashback link asking for UPI PIN to receive money",
        "loss_amount": "₹4,999",
        "time_ago": "2 mins ago",
        "severity": "high",
    },
    {
        "id": "SCAM-902",
        "theme": "Digital Arrest",
        "city": "Delhi NCR",
        "state": "Delhi",
        "coordinates": [28.6139, 77.2090],
        "snippet": "Fake CBI summons Skype video call intimidation for parcel drugs",
        "loss_amount": "₹4,50,000",
        "time_ago": "12 mins ago",
        "severity": "critical",
    },
    {
        "id": "SCAM-903",
        "theme": "Electricity Bill Disconnection",
        "city": "Mumbai",
        "state": "Maharashtra",
        "coordinates": [19.0760, 72.8777],
        "snippet": "Urgent bill unpaid, power will be cut tonight at 9:30 PM",
        "loss_amount": "₹12,000",
        "time_ago": "28 mins ago",
        "severity": "high",
    },
    {
        "id": "SCAM-904",
        "theme": "Part-Time Task Scam",
        "city": "Bengaluru",
        "state": "Karnataka",
        "coordinates": [12.9716, 77.5946],
        "snippet": "Like YouTube videos and earn ₹3000 daily Telegram work from home",
        "loss_amount": "₹65,000",
        "time_ago": "45 mins ago",
        "severity": "medium",
    },
    {
        "id": "SCAM-905",
        "theme": "India Post Parcel Delivery",
        "city": "Hyderabad",
        "state": "Telangana",
        "coordinates": [17.3850, 78.4867],
        "snippet": "Parcel on hold due to wrong address, click link to pay ₹48 custom fee",
        "loss_amount": "₹1,800",
        "time_ago": "1 hour ago",
        "severity": "high",
    },
    {
        "id": "SCAM-906",
        "theme": "Bank KYC Suspension",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "coordinates": [23.0225, 72.5714],
        "snippet": "Dear customer your YONO SBI account is blocked, update PAN now",
        "loss_amount": "₹82,000",
        "time_ago": "1.5 hours ago",
        "severity": "critical",
    },
]


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "CBL-01 Cyber Defense Engine",
        "languages_supported": ["hi", "mr", "hinglish", "en"],
        "version": "1.0.0",
    }


@app.get("/api/stats")
def get_official_stats():
    """Returns official 2024 cybercrime figures from I4C & MHA."""
    return {
        "source": "Indian Cyber Crime Coordination Centre (I4C) & Ministry of Home Affairs",
        "year": "2024",
        "daily_crimes": "7,000+",
        "daily_crimes_label": "Cyber Crimes Reported Daily",
        "daily_crimes_desc": "Average complaints filed every day on the national portal",
        "total_crimes": "22.68 lakh",
        "total_crimes_label": "Total Cyber Crimes",
        "total_crimes_desc": "Complaints filed across India in 2024",
        "lost_amount": "₹22,846 cr",
        "lost_amount_label": "Lost to Cyber Fraud",
        "lost_amount_desc": "Money reported lost across India in 2024",
        "helpline": "1930",
        "portal_url": "https://cybercrime.gov.in",
    }


@app.get("/api/threats/live")
def get_live_threats():
    """Returns real-time scam reports across India for the animated threat radar."""
    return {
        "count": len(LIVE_SCAM_PATTERNS),
        "threats": LIVE_SCAM_PATTERNS,
    }


@app.post("/api/scan/message")
def scan_message(req: MessageScanRequest):
    """
    Multimodal scan for incoming SMS / WhatsApp / email message.
    Evaluates text triggers, extracts and verifies URLs, checks sender identity,
    and returns trilingual explanations and actionable citizen guidance.
    """
    raw_text = req.text.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="Message text cannot be empty.")

    sender = req.sender_id.strip() if req.sender_id else None

    # 1. Preprocessing & Entity extraction
    cleaned_text, entities = clean_message(raw_text, mask_pii=False)
    urls = entities.get("urls", [])

    # 2. URL Threat Analysis
    url_analysis = analyze_message_urls(urls)

    # 3. Rule Cue & Psychological Threat Analysis
    rule_analysis = extract_rule_cues(raw_text, sender)

    # 4. Synthesized Calibrated Risk Score
    if fusion_artifact:
        from src.fusion import predict_fusion_proba
        calibrated_score = predict_fusion_proba(raw_text, sender, fusion_artifact)
    elif baseline_pipe:
        text_prob = float(baseline_pipe.predict_proba([cleaned_text])[0, 1])
        url_risk = url_analysis.get("max_url_risk", 0.0)
        rule_risk = rule_analysis.get("rule_risk_score", 0.0)
        calibrated_score = (0.55 * text_prob) + (0.30 * url_risk) + (0.15 * rule_risk)
    else:
        url_risk = url_analysis.get("max_url_risk", 0.0)
        rule_risk = rule_analysis.get("rule_risk_score", 0.0)
        if url_analysis["has_url"] and url_analysis["any_whitelisted"] and rule_risk < 0.3:
            calibrated_score = 0.05
        elif url_risk >= 0.8 or rule_risk >= 0.7:
            calibrated_score = max(url_risk, rule_risk)
        else:
            calibrated_score = (url_risk * 0.55) + (rule_risk * 0.45)

    calibrated_score = round(min(1.0, max(0.0, calibrated_score)), 3)

    # 5. Trilingual Explanation & Action Guidance
    explanation = generate_explanation(raw_text, url_analysis, rule_analysis, calibrated_score)

    return {
        "raw_text": raw_text,
        "sender_id": sender,
        "cleaned_text": cleaned_text,
        "entities": entities,
        "verdict": explanation["verdict"],
        "badge_color": explanation["badge_color"],
        "risk_score": explanation["calibrated_score"],
        "highlight_tokens": explanation["highlight_tokens"],
        "reasons": explanation["reasons"],
        "safety_advice": explanation["safety_advice"],
        "url_analysis": url_analysis,
        "rule_analysis": rule_analysis,
    }


@app.post("/api/scan/url")
def scan_url(req: URLScanRequest):
    """Deep inspection of a single web address or URL."""
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty.")

    feat = extract_url_features(url)
    risk = feat["heuristic_url_risk"]

    if risk >= 0.70:
        verdict = "SCAM / MALICIOUS"
        color = "#E53935"
    elif risk >= 0.30:
        verdict = "SUSPICIOUS / UNVERIFIED"
        color = "#FB8C00"
    else:
        verdict = "SAFE / REPUTABLE"
        color = "#43A047"

    return {
        "url": url,
        "verdict": verdict,
        "badge_color": color,
        "risk_score": risk,
        "details": feat,
        "reasons": feat["reasons"],
    }


# Mount production frontend build if dist folder exists
FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api:app", host="0.0.0.0", port=8000, reload=True)
