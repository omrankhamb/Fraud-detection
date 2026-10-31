"""
URL Feature Extraction & Brand Lookalike Detection Engine for CBL-01.

Extracts lexical features, analyzes structural anomalies, detects brand
typosquatting/lookalike domains against Indian institutions, and flags known
malicious patterns (.apk, IP hosts, shorteners, high-risk TLDs).
"""

import math
import re
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse

# Whitelist of legitimate domains for Indian banks, fintech, and public services
GENUINE_DOMAINS_WHITELIST = {
    # Banks
    "sbi.co.in", "onlinesbi.sbi", "onlinesbi.com",
    "hdfcbank.com", "hdfc.com",
    "icicibank.com",
    "axisbank.com",
    "pnbindia.in",
    "bankofbaroda.in",
    "kotak.com",
    "indusind.com",
    "yesbank.in",
    # Fintech & UPI
    "paytm.com", "phonepe.com", "google.com", "bhimupi.org.in", "cred.club",
    # E-Commerce & Couriers
    "amazon.in", "amazon.com", "flipkart.com",
    "indiapost.gov.in", "bluedart.com", "dtdc.in",
    # Government Services & Utilities
    "uidai.gov.in", "incometax.gov.in", "epfindia.gov.in", "parivahan.gov.in",
    "cybercrime.gov.in", "sancharsaathi.gov.in", "rbi.org.in"
}

# Key targeted brand tokens
TARGET_BRANDS = [
    "sbi", "onlinesbi", "hdfc", "icici", "axis", "pnb", "bob", "kotak",
    "paytm", "phonepe", "gpay", "bhim", "indiapost", "amazon", "flipkart",
    "uidai", "aadhaar", "pan", "electricity", "bsnl", "jio", "airtel"
]

# Common URL Shorteners
URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly",
    "cutt.ly", "rb.gy", "shorturl.at", "rebrand.ly", "v.gd"
}

# High-risk / spam-heavy TLDs frequently used in smishing campaigns
SUSPICIOUS_TLDS = {
    "xyz", "top", "icu", "vip", "live", "site", "buzz", "club",
    "work", "online", "apk", "click", "rest", "cam", "link", "gq", "ml", "cf"
}

IP_PATTERN = re.compile(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$")


def _levenshtein_distance(s1: str, s2: str) -> int:
    """Pure-Python fallback for Levenshtein edit distance."""
    if len(s1) < len(s2):
        return _levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]


def _string_similarity(s1: str, s2: str) -> float:
    """Calculate normalized similarity [0.0 - 1.0] between two strings."""
    dist = _levenshtein_distance(s1, s2)
    max_len = max(len(s1), len(s2))
    return 1.0 - (dist / max_len) if max_len > 0 else 1.0


def parse_domain_parts(netloc: str) -> Tuple[str, str, str]:
    """
    Split network location into subdomain, domain, and suffix without requiring external libraries.
    Example: 'secure.sbi-kyc.co.in' -> ('secure', 'sbi-kyc', 'co.in')
    """
    netloc = netloc.lower().split(":")[0]  # strip port
    parts = netloc.split(".")
    if len(parts) <= 1:
        return "", netloc, ""

    # Known double suffixes
    double_suffixes = {"co.in", "gov.in", "org.in", "net.in", "ac.in", "co.uk", "com.au"}
    if len(parts) >= 3 and ".".join(parts[-2:]) in double_suffixes:
        suffix = ".".join(parts[-2:])
        domain = parts[-3]
        subdomain = ".".join(parts[:-3])
    else:
        suffix = parts[-1]
        domain = parts[-2]
        subdomain = ".".join(parts[:-2])

    return subdomain, domain, suffix


def extract_url_features(url: str) -> Dict[str, Any]:
    """
    Extract comprehensive lexical, structural, and brand lookalike features for a single URL.
    """
    if not url.startswith(("http://", "https://")):
        # Prepend scheme for proper parsing
        parsed = urlparse("http://" + url)
    else:
        parsed = urlparse(url)

    netloc = parsed.netloc.lower()
    path = parsed.path.lower()
    full_url = url.lower()

    subdomain, domain_name, suffix = parse_domain_parts(netloc)
    registered_domain = f"{domain_name}.{suffix}" if suffix else domain_name

    # Check Whitelist
    is_whitelisted = registered_domain in GENUINE_DOMAINS_WHITELIST or netloc in GENUINE_DOMAINS_WHITELIST

    # Check IP host
    is_ip = bool(IP_PATTERN.match(netloc))

    # Check shorteners
    is_shortener = netloc in URL_SHORTENERS or registered_domain in URL_SHORTENERS

    # Check suspicious TLD
    has_suspicious_tld = suffix in SUSPICIOUS_TLDS

    # Check APK reference
    has_apk = path.endswith(".apk") or ".apk" in full_url or "apk" in path

    # Check Punycode (IDN homograph attack)
    has_punycode = "xn--" in netloc

    # Brand Lookalike Detection
    lookalike_detected = False
    lookalike_brand = None
    max_brand_similarity = 0.0

    if not is_whitelisted and not is_shortener and not is_ip:
        # Check if any legitimate brand token is embedded inside domain or subdomain
        combined_host = f"{subdomain}.{domain_name}"
        for brand in TARGET_BRANDS:
            # Exact brand token inside domain (e.g. 'sbi-update', 'paytmcash')
            if brand in domain_name or brand in subdomain:
                lookalike_detected = True
                lookalike_brand = brand
                max_brand_similarity = 1.0
                break
            # Fuzzy match (e.g. 'sbii' or 'hdfcbk')
            sim = _string_similarity(brand, domain_name)
            if sim > 0.75 and sim > max_brand_similarity:
                max_brand_similarity = sim
                if sim >= 0.80:
                    lookalike_detected = True
                    lookalike_brand = brand

    # Shannon Entropy of domain name
    entropy = 0.0
    if domain_name:
        prob = [float(domain_name.count(c)) / len(domain_name) for c in dict.fromkeys(list(domain_name))]
        entropy = -sum([p * math.log(p) / math.log(2.0) for p in prob])

    # Structure counters
    length = len(url)
    num_dots = url.count(".")
    num_hyphens = url.count("-")
    num_digits = sum(c.isdigit() for c in url)
    num_subdomains = len(subdomain.split(".")) if subdomain else 0
    has_at_symbol = "@" in url
    is_https = url.startswith("https://")

    # Heuristic Risk Score (0.0 to 1.0)
    risk_score = 0.0
    reasons = []

    if is_whitelisted:
        risk_score = 0.0
        reasons.append("Verified genuine institutional domain.")
    else:
        if lookalike_detected:
            risk_score += 0.50
            reasons.append(f"Domain imitates trusted brand: '{lookalike_brand}'.")
        if has_apk:
            risk_score += 0.45
            reasons.append("Contains direct APK app installation download.")
        if is_ip:
            risk_score += 0.40
            reasons.append("Uses raw IP address instead of registered domain.")
        if is_shortener:
            risk_score += 0.25
            reasons.append("Uses URL shortener hiding true destination.")
        if has_suspicious_tld:
            risk_score += 0.25
            reasons.append(f"Uses high-risk/uncommon top-level domain (.{suffix}).")
        if has_punycode:
            risk_score += 0.35
            reasons.append("Uses punycode character substitution (homograph attack).")
        if num_hyphens >= 2:
            risk_score += 0.15
            reasons.append(f"Abnormal hyphen count ({num_hyphens}) in address.")
        if not is_https and not is_shortener:
            risk_score += 0.10

        risk_score = min(1.0, risk_score)

    return {
        "url": url,
        "length": length,
        "num_dots": num_dots,
        "num_hyphens": num_hyphens,
        "num_digits": num_digits,
        "num_subdomains": num_subdomains,
        "has_at_symbol": int(has_at_symbol),
        "is_https": int(is_https),
        "is_ip": int(is_ip),
        "is_shortener": int(is_shortener),
        "has_suspicious_tld": int(has_suspicious_tld),
        "has_apk": int(has_apk),
        "has_punycode": int(has_punycode),
        "is_whitelisted": int(is_whitelisted),
        "lookalike_detected": int(lookalike_detected),
        "lookalike_brand": lookalike_brand,
        "domain_entropy": round(entropy, 3),
        "heuristic_url_risk": round(risk_score, 3),
        "reasons": reasons,
    }


def analyze_message_urls(urls: List[str]) -> Dict[str, Any]:
    """Aggregate analysis across all URLs found in a message."""
    if not urls:
        return {
            "has_url": 0,
            "max_url_risk": 0.0,
            "any_whitelisted": 0,
            "any_lookalike": 0,
            "any_apk": 0,
            "any_shortener": 0,
            "any_suspicious_tld": 0,
            "url_reasons": [],
            "analyzed_urls": [],
        }

    results = [extract_url_features(u) for u in urls]
    max_risk = max(r["heuristic_url_risk"] for r in results)
    all_reasons = []
    for r in results:
        all_reasons.extend(r["reasons"])

    return {
        "has_url": 1,
        "max_url_risk": max_risk,
        "any_whitelisted": int(any(r["is_whitelisted"] for r in results)),
        "any_lookalike": int(any(r["lookalike_detected"] for r in results)),
        "any_apk": int(any(r["has_apk"] for r in results)),
        "any_shortener": int(any(r["is_shortener"] for r in results)),
        "any_suspicious_tld": int(any(r["has_suspicious_tld"] for r in results)),
        "url_reasons": list(dict.fromkeys(all_reasons)),  # deduplicate
        "analyzed_urls": results,
    }


if __name__ == "__main__":
    test_urls = [
        "https://www.onlinesbi.sbi/portal",                         # Genuine SBI
        "http://sbi-kyc-verification.xyz/login.php",               # Lookalike + Suspicious TLD
        "http://192.168.1.10/update/banking_app.apk",              # IP + APK
        "https://bit.ly/3xPendingUPI",                              # Shortener
        "https://indiapost.gov.in/tracking?id=123",                 # Genuine India Post
        "http://indiapost-parcel-delivery.top/claim"                # Lookalike India Post + .top TLD
    ]

    print("--- URL Feature Extraction & Lookalike Testing ---")
    for u in test_urls:
        res = extract_url_features(u)
        status = "LEGIT" if res["is_whitelisted"] else ("MALICIOUS" if res["heuristic_url_risk"] >= 0.5 else "NEUTRAL")
        print(f"\nURL: {u}")
        print(f"Status: [{status}] | Risk Score: {res['heuristic_url_risk']}")
        print(f"Reasons: {res['reasons']}")
