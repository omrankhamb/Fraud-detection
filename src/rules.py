"""
Rule-Based Scam Cue & Contextual Mismatch Detection Engine for CBL-01.

Detects psychological manipulation patterns:
1. Artificial urgency & immediate deadline threats
2. Credential harvesting (OTP, PIN, Password, Aadhaar, PAN)
3. Specific Indian scam themes:
   - Electricity bill disconnection
   - Digital arrest / law enforcement impersonation
   - Part-time Telegram job / task scams
   - UPI cashback / refund bait
   - Lottery & prize scams
   - Loan app fraud
4. Contextual mismatch: Financial/bank claims from 10-digit personal mobile numbers
   instead of registered Indian telecom sender IDs (DLT headers).
"""

import re
from typing import Any, Dict, List, Optional


# Urgency & Threat cues across English, Hindi, Marathi, and Hinglish
URGENCY_PATTERNS = [
    re.compile(r"\b(immediately|urgent|turant|jaldi|aaj\s*hi|abhi|within\s*24\s*hours?|24\s*ghante\s*mein)\b", re.IGNORECASE),
    re.compile(r"\b(suspended|blocked|deactivated|disconnected|band\s*ho\s*jayega|rok\s*diya\s*jayega|khatam)\b", re.IGNORECASE),
    re.compile(r"\b(last\s*chance|aakhri\s*mauka|final\s*warning|antim\s*chetavani)\b", re.IGNORECASE),
]

# Credential harvesting cues
CREDENTIAL_PATTERNS = [
    re.compile(r"\b(share\s*otp|send\s*otp|enter\s*pin|upi\s*pin|cvv|password|passcode)\b", re.IGNORECASE),
    re.compile(r"\b(update\s*(?:pan|aadhaar|kyc)|link\s*(?:pan|aadhaar)|pan\s*card\s*update)\b", re.IGNORECASE),
    re.compile(r"\b(otp\s*(?:bhejo|bhejein|share\s*karein|batayein|sanga))\b", re.IGNORECASE),
]

# Electricity disconnection cues
ELECTRICITY_PATTERNS = [
    re.compile(r"\b(electricity|power|bijli|vidyut|light)\b.*\b(disconnect|cut|band|khandit)\b", re.IGNORECASE),
    re.compile(r"\b(bill\s*(?:unpaid|pending|bakaya)|previous\s*month\s*bill)\b", re.IGNORECASE),
    re.compile(r"\b(electricity\s*officer|bijli\s*adhikari|contact\s*officer)\b", re.IGNORECASE),
]

# Digital arrest / legal intimidation cues
DIGITAL_ARREST_PATTERNS = [
    re.compile(r"\b(cbi|cyber\s*crime\s*branch|narcotics|ed\s*office|police|court\s*order)\b", re.IGNORECASE),
    re.compile(r"\b(digital\s*arrest|arrest\s*warrant|money\s*laundering|illegal\s*parcel|drugs)\b", re.IGNORECASE),
    re.compile(r"\b(skype\s*call|whatsapp\s*video\s*call|do\s*not\s*disconnect)\b", re.IGNORECASE),
]

# Part-time job / task scams
JOB_SCAM_PATTERNS = [
    re.compile(r"\b(part\s*time\s*job|work\s*from\s*home|daily\s*income|earn\s*daily)\b", re.IGNORECASE),
    re.compile(r"\b(like\s*youtube\s*videos?|telegram\s*task|google\s*review|hotel\s*rating)\b", re.IGNORECASE),
    re.compile(r"\b(?:earn|kamayein|kamava)\s*(?:rs\.?|inr|₹)?\s*\d{3,5}\s*(?:daily|per\s*day|pratidin)\b", re.IGNORECASE),
]

# UPI Cashback & Lottery bait
REWARD_PATTERNS = [
    re.compile(r"\b(congratulations?|badhai|abhinandan|lucky\s*winner|won\s*a\s*prize|kbc\s*lottery)\b", re.IGNORECASE),
    re.compile(r"\b(cashback|upi\s*reward|refund\s*credited|receive\s*money|claim\s*bonus)\b", re.IGNORECASE),
    re.compile(r"\b(claim\s*now|claim\s*karein|turant\s*prapt\s*karein)\b", re.IGNORECASE),
]

# Registered DLT Sender ID pattern (e.g. AD-HDFCBK, VM-SBIINB, BZ-AMAZON)
DLT_SENDER_PATTERN = re.compile(r"^[A-Z]{2}-[A-Z0-9]{6}$", re.IGNORECASE)
TEN_DIGIT_PHONE_PATTERN = re.compile(r"^(?:\+91|91|0)?[6-9]\d{9}$")


def extract_rule_cues(text: str, sender_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Evaluate text and optional sender ID against high-precision scam heuristics.
    Returns detected cue flags and heuristic confidence score.
    """
    cues_detected = []
    matched_phrases = []

    # 1. Urgency cues
    has_urgency = False
    for pat in URGENCY_PATTERNS:
        match = pat.search(text)
        if match:
            has_urgency = True
            cues_detected.append("ARTIFICIAL_URGENCY")
            matched_phrases.append(match.group(0))
            break

    # 2. Credential harvesting
    has_credential_threat = False
    for pat in CREDENTIAL_PATTERNS:
        match = pat.search(text)
        if match:
            has_credential_threat = True
            cues_detected.append("CREDENTIAL_HARVESTING")
            matched_phrases.append(match.group(0))
            break

    # 3. Electricity disconnection
    has_electricity = False
    for pat in ELECTRICITY_PATTERNS:
        match = pat.search(text)
        if match:
            has_electricity = True
            cues_detected.append("THEME_ELECTRICITY_BILL")
            matched_phrases.append(match.group(0))
            break

    # 4. Digital arrest
    has_digital_arrest = False
    for pat in DIGITAL_ARREST_PATTERNS:
        match = pat.search(text)
        if match:
            has_digital_arrest = True
            cues_detected.append("THEME_DIGITAL_ARREST")
            matched_phrases.append(match.group(0))
            break

    # 5. Job scam
    has_job_scam = False
    for pat in JOB_SCAM_PATTERNS:
        match = pat.search(text)
        if match:
            has_job_scam = True
            cues_detected.append("THEME_JOB_TASK_SCAM")
            matched_phrases.append(match.group(0))
            break

    # 6. Reward / Cashback
    has_reward = False
    for pat in REWARD_PATTERNS:
        match = pat.search(text)
        if match:
            has_reward = True
            cues_detected.append("THEME_REWARD_LOTTERY")
            matched_phrases.append(match.group(0))
            break

    # 7. Sender ID Mismatch
    sender_mismatch = False
    if sender_id:
        sender_id = sender_id.strip()
        # If message claims bank / institutional keywords but sender is a personal mobile number
        claims_institution = bool(re.search(r"\b(sbi|hdfc|icici|axis|bank|bijli|cbi|police|post)\b", text, re.IGNORECASE))
        is_personal_number = bool(TEN_DIGIT_PHONE_PATTERN.match(sender_id))
        is_official_dlt = bool(DLT_SENDER_PATTERN.match(sender_id))

        if claims_institution and is_personal_number and not is_official_dlt:
            sender_mismatch = True
            cues_detected.append("SENDER_ID_MISMATCH")
            matched_phrases.append(f"Claimed institution sent from personal mobile: {sender_id}")

    # Compute rule severity score (0.0 to 1.0)
    rule_score = 0.0
    if has_digital_arrest:
        rule_score += 0.70
    if has_credential_threat:
        rule_score += 0.55
    if has_electricity:
        rule_score += 0.50
    if has_job_scam:
        rule_score += 0.50
    if has_reward:
        rule_score += 0.40
    if has_urgency:
        rule_score += 0.25
    if sender_mismatch:
        rule_score += 0.35

    rule_score = min(1.0, rule_score)

    return {
        "rule_risk_score": round(rule_score, 3),
        "has_urgency": int(has_urgency),
        "has_credential_threat": int(has_credential_threat),
        "has_electricity": int(has_electricity),
        "has_digital_arrest": int(has_digital_arrest),
        "has_job_scam": int(has_job_scam),
        "has_reward": int(has_reward),
        "sender_mismatch": int(sender_mismatch),
        "cues_detected": cues_detected,
        "matched_phrases": matched_phrases,
    }


if __name__ == "__main__":
    test_messages = [
        (
            "Dear customer, your electricity will be disconnected tonight at 9.30 pm. "
            "Please contact our electricity officer at 9876543210 immediately.",
            "9876543210"
        ),
        (
            "CBI Cyber Branch Notice: You are under digital arrest for illegal money laundering. "
            "Join Skype call immediately and do not disconnect.",
            "+919988776655"
        ),
        (
            "Part-time job offer: Like YouTube videos and earn Rs 3000 daily from home. Join Telegram.",
            "TelegramBot"
        ),
        (
            "Your SBI account OTP is 591024 for Rs 1200 payment. Never share your OTP with anyone.",
            "VK-SBIINB"
        ),
    ]

    print("--- Rule Cue Extraction Testing ---")
    for text, sender in test_messages:
        res = extract_rule_cues(text, sender)
        print(f"\nMessage: {text[:60]}... (Sender: {sender})")
        print(f"Risk Score: {res['rule_risk_score']} | Cues: {res['cues_detected']}")
        print(f"Matched: {res['matched_phrases']}")
