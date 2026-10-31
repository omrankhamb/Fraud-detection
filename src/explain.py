"""
Trilingual Explanation & Trigger Attribution Engine for CBL-01.

Provides:
1. Extraction of trigger words / highlight spans.
2. Faithful plain-language explanations in English, Hindi, and Marathi.
3. Actionable citizen safety advisory (Helpline 1930 & cybercrime.gov.in).
"""

from typing import Any, Dict, List, Optional


# Translation templates for detected cues
REASON_TEMPLATES = {
    "ARTIFICIAL_URGENCY": {
        "en": "Creates false urgency or pressure with threats of immediate deactivation or deadlines.",
        "hi": "तत्काल खाते बंद होने या समय सीमा की धमकी देकर झूठी जल्दबाजी पैदा करता है।",
        "mr": "त्वरित खाते बंद करण्याची किंवा मुदतीची भीती दाखवून बनावट घाई निर्माण करतो.",
    },
    "CREDENTIAL_HARVESTING": {
        "en": "Requests sensitive personal credentials such as OTP, UPI PIN, CVV, or PAN/Aadhaar details.",
        "hi": "ओटीपी (OTP), यूपीआई पिन, सीवीवी, या पैन/आधार जैसी संवेदनशील जानकारी मांगता है।",
        "mr": "ओटीपी (OTP), यूपीआय पिन, सीव्हीव्ही, किंवा पॅन/आधार सारखी गोपनीय माहिती मागतो.",
    },
    "THEME_ELECTRICITY_BILL": {
        "en": "Threatens electricity or power disconnection tonight due to an alleged unpaid bill.",
        "hi": "बकाया बिल का बहाना बनाकर आज रात बिजली काटने की फर्जी चेतावनी देता है।",
        "mr": "थकबाकी बिलाचे कारण सांगून आज रात्री वीज खंडित करण्याची खोटी धमकी देतो.",
    },
    "THEME_DIGITAL_ARREST": {
        "en": "Impersonates police, CBI, or court officials threatening digital arrest or legal action.",
        "hi": "पुलिस, सीबीआई या अदालत का नाम लेकर डिजिटल अरेस्ट और कानूनी कार्रवाई की धमकी देता है।",
        "mr": "पोलीस, सीबीआय किंवा कोर्टाचे नाव सांगून डिजिटल अरेस्ट आणि कारवाईची भीती दाखवतो.",
    },
    "THEME_JOB_TASK_SCAM": {
        "en": "Promises high daily income for simple tasks like liking videos or Telegram review ratings.",
        "hi": "यूट्यूब वीडियो लाइक करने या टेलीग्राम टास्क जैसे आसान कामों के नाम पर बड़े मुनाफे का लालच देता है।",
        "mr": "व्हिडीओ लाईक करणे किंवा टेलिग्राम टास्क सारख्या कामांसाठी मोठ्या रोजंदारीचे आमिष दाखवतो.",
    },
    "THEME_REWARD_LOTTERY": {
        "en": "Claims you have won a lottery, cashback, or prize requiring action to collect.",
        "hi": "लॉटरी, कैशबैक या इनाम जीतने का दावा करके पैसे ऐंठने की कोशिश करता है।",
        "mr": "लॉटरी, कॅशबॅक किंवा बक्षीस मिळाल्याचा दावा करून फसवणूक करण्याचा प्रयत्न करतो.",
    },
    "SENDER_ID_MISMATCH": {
        "en": "Official institution claim sent from an ordinary 10-digit mobile number instead of verified bank DLT header.",
        "hi": "बैंक या सरकारी संस्था का दावा किसी सामान्य 10 अंकों वाले मोबाइल नंबर से भेजा गया है।",
        "mr": "बँक किंवा सरकारी संस्थेचा संदेश अधिकृत हेडर ऐवजी १० अंकी मोबाईल नंबरवरून पाठवला आहे.",
    },
    "LOOKALIKE_DOMAIN": {
        "en": "Contains a suspicious lookalike link imitating a trusted Indian brand: '{brand}'.",
        "hi": "इसमें विश्वसनीय भारतीय ब्रांड '{brand}' की नकल करने वाली फर्जी लिंक शामिल है।",
        "mr": "यात '{brand}' या नामांकित संस्थेची हुबेहूब नक्कल करणारी बनावट लिंक आहे.",
    },
    "MALICIOUS_APK": {
        "en": "Prompts direct download of an APK application package, which can compromise your device.",
        "hi": "इसमें सीधे APK ऐप डाउनलोड करने का लिंक है, जो आपके फोन से डेटा चुरा सकता है।",
        "mr": "यात थेट APK ॲप डाऊनलोड करण्याची लिंक आहे, ज्यामुळे मोबाईलमधील माहिती चोरीला जाऊ शकते.",
    },
    "URL_SHORTENER": {
        "en": "Uses an obfuscated URL shortener to conceal the actual website destination.",
        "hi": "असली वेबसाइट छिपाने के लिए शार्टनर लिंक (URL Shortener) का उपयोग किया गया है।",
        "mr": "मूळ वेबसाईट लपवण्यासाठी शॉर्ट लिंकचा वापर करण्यात आला आहे.",
    },
    "SUSPICIOUS_TLD": {
        "en": "Uses an unusual, high-risk domain extension commonly associated with phishing sites.",
        "hi": "असामान्य और संदिग्ध डोमेन एक्सटेंशन का इस्तेमाल किया गया है।",
        "mr": "फसवणुकीसाठी वापरल्या जाणाऱ्या संशयास्पद डोमेन एक्स्टेंशनचा वापर केला आहे.",
    },
}

SAFETY_ADVICE = {
    "SCAM": {
        "en": [
            "DO NOT click any links or download any files attached to this message.",
            "NEVER share OTP, PIN, password, or banking credentials with anyone.",
            "Report immediately to the National Cyber Crime Reporting Portal at cybercrime.gov.in or call Helpline 1930.",
            "Block this sender immediately."
        ],
        "hi": [
            "संदेश में दिए गए किसी भी लिंक पर क्लिक न करें और न ही कोई फाइल डाउनलोड करें।",
            "अपना ओटीपी (OTP), यूपीआई पिन या बैंक पासवर्ड किसी के साथ साझा न करें।",
            "तुरंत राष्ट्रीय साइबर हेल्पलाइन 1930 पर कॉल करें या cybercrime.gov.in पर शिकायत दर्ज करें।",
            "इस नंबर को तुरंत ब्लॉक करें।"
        ],
        "mr": [
            "संदेशामध्ये दिलेल्या कोणत्याही लिंकवर क्लिक करू नका किंवा फाईल डाऊनलोड करू नका.",
            "तुमचा ओटीपी (OTP), यूपीआय पिन किंवा पासवर्ड कोणाशीही शेअर करू नका.",
            "तात्काळ राष्ट्रीय सायबर हेल्पलाइन १९३० (1930) वर कॉल करा किंवा cybercrime.gov.in वर तक्रार करा.",
            "हा नंबर त्वरित ब्लॉक करा."
        ]
    },
    "SUSPICIOUS": {
        "en": [
            "Exercise caution: Verify directly with the official bank branch or customer service using verified numbers.",
            "Do not enter passwords or personal details if you opened any link.",
            "If in doubt, call 1930 for cyber assistance."
        ],
        "hi": [
            "सावधानी बरतें: किसी भी कार्रवाई से पहले अपने बैंक की आधिकारिक शाखा या हेल्पलाइन से पुष्टि करें।",
            "लिंक खुलने पर अपनी निजी या वित्तीय जानकारी दर्ज न करें।",
            "संदेह होने पर सहायता के लिए 1930 डायल करें।"
        ],
        "mr": [
            "सावधगिरी बाळगा: कोणतीही कृती करण्यापूर्वी बँकेच्या अधिकृत शाखेशी संपर्क साधा.",
            "लिंक उघडल्यास कोणतीही वैयक्तिक किंवा बँकिंग माहिती भरू नका.",
            "शंका असल्यास मदतीसाठी १९३० वर संपर्क साधा."
        ]
    },
    "SAFE": {
        "en": [
            "Message appears to follow standard legitimate communication patterns.",
            "Always remember: Banks and official departments never ask for your confidential PIN or full password over SMS."
        ],
        "hi": [
            "यह संदेश सामान्य और वैध संचार प्रारूप का पालन करता प्रतीत होता है।",
            "हमेशा याद रखें: बैंक या सरकारी विभाग कभी भी एसएमएस पर आपका गोपनीय पिन या पासवर्ड नहीं मांगते।"
        ],
        "mr": [
            "हा संदेश सामान्य आणि अधिकृत स्वरूपाचा दिसतो.",
            "नेहमी लक्षात ठेवा: बँका कधीही एसएमएसवर गोपनीय पिन किंवा पासवर्ड मागत नाहीत."
        ]
    }
}


def generate_explanation(
    text: str,
    url_analysis: Dict[str, Any],
    rule_analysis: Dict[str, Any],
    calibrated_score: float,
) -> Dict[str, Any]:
    """
    Synthesize model score, URL features, and rule cues into trilingual explanations.
    """
    # 1. Determine Verdict Band
    if calibrated_score > 0.70:
        verdict = "SCAM"
        badge_color = "#E53935"  # Red
    elif calibrated_score >= 0.30:
        verdict = "SUSPICIOUS"
        badge_color = "#FB8C00"  # Orange/Amber
    else:
        verdict = "SAFE"
        badge_color = "#43A047"  # Green

    reasons_en = []
    reasons_hi = []
    reasons_mr = []
    highlight_tokens = set()

    # Rule cues
    for cue in rule_analysis.get("cues_detected", []):
        if cue in REASON_TEMPLATES:
            reasons_en.append(REASON_TEMPLATES[cue]["en"])
            reasons_hi.append(REASON_TEMPLATES[cue]["hi"])
            reasons_mr.append(REASON_TEMPLATES[cue]["mr"])

    for phrase in rule_analysis.get("matched_phrases", []):
        if not phrase.startswith("Claimed institution"):
            highlight_tokens.add(phrase.lower())

    # URL cues
    for url_info in url_analysis.get("analyzed_urls", []):
        if url_info.get("lookalike_detected"):
            brand = url_info.get("lookalike_brand", "trusted entity")
            reasons_en.append(REASON_TEMPLATES["LOOKALIKE_DOMAIN"]["en"].format(brand=brand))
            reasons_hi.append(REASON_TEMPLATES["LOOKALIKE_DOMAIN"]["hi"].format(brand=brand))
            reasons_mr.append(REASON_TEMPLATES["LOOKALIKE_DOMAIN"]["mr"].format(brand=brand))
            highlight_tokens.add(url_info["url"].lower())

        if url_info.get("has_apk"):
            reasons_en.append(REASON_TEMPLATES["MALICIOUS_APK"]["en"])
            reasons_hi.append(REASON_TEMPLATES["MALICIOUS_APK"]["hi"])
            reasons_mr.append(REASON_TEMPLATES["MALICIOUS_APK"]["mr"])
            highlight_tokens.add(".apk")

        if url_info.get("is_shortener"):
            reasons_en.append(REASON_TEMPLATES["URL_SHORTENER"]["en"])
            reasons_hi.append(REASON_TEMPLATES["URL_SHORTENER"]["hi"])
            reasons_mr.append(REASON_TEMPLATES["URL_SHORTENER"]["mr"])

        if url_info.get("has_suspicious_tld"):
            reasons_en.append(REASON_TEMPLATES["SUSPICIOUS_TLD"]["en"])
            reasons_hi.append(REASON_TEMPLATES["SUSPICIOUS_TLD"]["hi"])
            reasons_mr.append(REASON_TEMPLATES["SUSPICIOUS_TLD"]["mr"])

    # If classified as scam or suspicious but no specific rule fired, provide generalized rationale
    if verdict in ("SCAM", "SUSPICIOUS") and not reasons_en:
        reasons_en.append("The message structure and vocabulary closely match known fraud templates identified by the ML classifier.")
        reasons_hi.append("संदेश की संरचना और भाषा मशीन लर्निंग मॉडल द्वारा चिन्हित धोखाधड़ी वाले संदेशों से मिलती है।")
        reasons_mr.append("संदेशाची रचना आणि भाषा मशिन लर्निंग मॉडेलनुसार ज्ञात फसवणुकीच्या संदेशांसारखी आहे.")

    if verdict == "SAFE" and not reasons_en:
        reasons_en.append("No common phishing indicators, impersonation tactics, or malicious links were detected.")
        reasons_hi.append("संदेश में कोई भी फ़िशिंग संकेत, धोखाधड़ी या संदिग्ध लिंक नहीं पाए गए।")
        reasons_mr.append("संदेशात कोणतेही फिशिंग संकेत किंवा संशयास्पद लिंक आढळल्या नाहीत.")

    # Deduplicate reasons
    reasons_en = list(dict.fromkeys(reasons_en))
    reasons_hi = list(dict.fromkeys(reasons_hi))
    reasons_mr = list(dict.fromkeys(reasons_mr))

    return {
        "verdict": verdict,
        "badge_color": badge_color,
        "calibrated_score": round(calibrated_score, 3),
        "highlight_tokens": list(highlight_tokens),
        "reasons": {
            "en": reasons_en,
            "hi": reasons_hi,
            "mr": reasons_mr,
        },
        "safety_advice": SAFETY_ADVICE[verdict],
    }


if __name__ == "__main__":
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    from src.features_url import analyze_message_urls
    from src.preprocess import clean_message
    from src.rules import extract_rule_cues

    sample_msg = (
        "Dear Customer, your electricity will be disconnected tonight at 9.30 pm "
        "due to unpaid bill. Update bill immediately: http://power-bill-update.xyz or call 9876543210"
    )
    sender = "9876543210"

    cleaned, entities = clean_message(sample_msg)
    urls = entities["urls"]
    url_res = analyze_message_urls(urls)
    rule_res = extract_rule_cues(sample_msg, sender)

    # Simulated ensemble calibrated score
    simulated_score = 0.92

    explanation = generate_explanation(sample_msg, url_res, rule_res, simulated_score)

    print("--- Trilingual Explanation Engine Output ---")
    print(f"Verdict: {explanation['verdict']} (Score: {explanation['calibrated_score']})")
    print(f"Highlights: {explanation['highlight_tokens']}")
    print("\n[English Reasons]:")
    for r in explanation["reasons"]["en"]:
        print(f" - {r}")
    print("\n[Hindi Reasons]:")
    for r in explanation["reasons"]["hi"]:
        print(f" - {r}")
    print("\n[Marathi Reasons]:")
    for r in explanation["reasons"]["mr"]:
        print(f" - {r}")
    print("\n[English Advice]:")
    for a in explanation["safety_advice"]["en"]:
        print(f" * {a}")
