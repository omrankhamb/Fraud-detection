"""
Pre-processing & Text Normalization Pipeline for CBL-01 Scam Detection.

Handles:
1. Unicode normalization (NFKC) & zero-width character stripping.
2. Entity extraction & PII masking (Phone numbers, OTPs, Amounts, URLs).
3. Hinglish phonetic & spelling variant normalization.
4. Whitespace and punctuation cleanup.
5. Deduplication (exact & near-duplicate).
"""

import re
import unicodedata
from typing import Dict, List, Set, Tuple


# Regex patterns
ZERO_WIDTH_CHARS_PATTERN = re.compile(r"[\u200B-\u200D\uFEFF\u00A0]")
WHITESPACE_PATTERN = re.compile(r"\s+")

# URL extraction regex (handles http, https, www, and bare domain lookalikes)
URL_PATTERN = re.compile(
    r"(?:https?://|www\.)[^\s/$.?#].[^\s]*"
    r"|(?:[a-zA-Z0-9-]+\.)+(?:com|org|in|co\.in|net|xyz|top|online|vip|icu|info|live|site|buzz|app|apk)(?:/[^\s]*)?",
    re.IGNORECASE,
)

# Indian phone numbers: +91, 0, or bare 10-digit numbers starting with 6-9
PHONE_PATTERN = re.compile(
    r"(?:\+91[\-\s]?|91[\-\s]?|0)?[6-9]\d{9}\b"
)

# Currency amounts (e.g., Rs. 5000, Rs 500, INR 10,000, ₹1500, 25000/-)
AMOUNT_PATTERN = re.compile(
    r"(?:Rs\.?|INR|₹|\$)\s*[\d,]+(?:\.\d{1,2})?|-?\b[\d,]+(?:\.\d{1,2})?\s*(?:/-|rs|rupees|inr)\b",
    re.IGNORECASE,
)

# OTP / Verification codes pattern using capture groups
OTP_PREFIX_PATTERN = re.compile(
    r"\b(otp|code|pin|verification\s*code|one\s*time\s*password)(?:\s+is|\s*[\s:\-#=]{1,5})\s*(\d{4,8})\b",
    re.IGNORECASE,
)
OTP_SUFFIX_PATTERN = re.compile(
    r"\b(\d{4,8})\b(?=\s*(?:is\s*your\s*otp|is\s*your\s*secret\s*code|aapka\s*otp))",
    re.IGNORECASE,
)

# Hinglish spelling variant normalizer map
HINGLISH_VARIANT_MAP = {
    # Actions
    "kro": "karein",
    "karo": "karein",
    "kijiye": "karein",
    "kijiye": "karein",
    "krain": "karein",
    "karen": "karein",
    "kre": "karein",
    "dekho": "dekhein",
    "dekho": "dekhein",
    "bhejo": "bheinjein",
    # Urgency & Time
    "jaldi": "turant",
    "jldi": "turant",
    "aj": "aaj",
    "abhi": "turant",
    # Verification & Account
    "ac": "account",
    "a/c": "account",
    "acc": "account",
    "num": "number",
    "no": "number",
    "mob": "mobile",
    "msg": "message",
    "blk": "blocked",
    "blck": "blocked",
}


def normalize_unicode(text: str) -> str:
    """Normalize Unicode characters to NFKC form and remove hidden zero-width marks."""
    if not isinstance(text, str):
        return ""
    text = unicodedata.normalize("NFKC", text)
    text = ZERO_WIDTH_CHARS_PATTERN.sub("", text)
    return text


def extract_urls(text: str) -> List[str]:
    """Extract all URLs from text before masking."""
    if not isinstance(text, str):
        return []
    matches = URL_PATTERN.findall(text)
    cleaned_urls = []
    for url in matches:
        # Strip trailing punctuation often caught in SMS
        url = url.rstrip(".,;!?'\"()[]{}")
        if url:
            cleaned_urls.append(url)
    return cleaned_urls


def mask_entities(text: str) -> Tuple[str, Dict[str, List[str]]]:
    """
    Extract and mask entities (URLs, Phone Numbers, Amounts, OTPs).
    Returns (masked_text, extracted_entities_dict).
    """
    extracted = {
        "urls": [],
        "phones": [],
        "amounts": [],
        "otps": [],
    }

    # 1. URLs
    urls = extract_urls(text)
    extracted["urls"] = urls
    for u in urls:
        text = text.replace(u, " <URL> ")

    # 2. OTPs
    otps = []
    for match in OTP_PREFIX_PATTERN.finditer(text):
        otps.append(match.group(2))
    for match in OTP_SUFFIX_PATTERN.finditer(text):
        otps.append(match.group(1))
    extracted["otps"] = otps

    text = OTP_PREFIX_PATTERN.sub(r"\1 <OTP>", text)
    text = OTP_SUFFIX_PATTERN.sub(" <OTP> ", text)

    # 3. Currency / Amounts
    amounts = AMOUNT_PATTERN.findall(text)
    extracted["amounts"] = amounts
    text = AMOUNT_PATTERN.sub(" <AMOUNT> ", text)

    # 4. Phone numbers
    phones = PHONE_PATTERN.findall(text)
    extracted["phones"] = phones
    text = PHONE_PATTERN.sub(" <PHONE> ", text)

    # Collapse excess whitespace
    text = WHITESPACE_PATTERN.sub(" ", text).strip()
    return text, extracted


def normalize_hinglish_variants(text: str) -> str:
    """Normalize common Hinglish phonetic spelling variations to canonical tokens."""
    tokens = text.split()
    normalized = []
    for token in tokens:
        lower_token = token.lower()
        if lower_token in HINGLISH_VARIANT_MAP:
            normalized.append(HINGLISH_VARIANT_MAP[lower_token])
        else:
            normalized.append(token)
    return " ".join(normalized)


def clean_message(text: str, mask_pii: bool = True) -> Tuple[str, Dict[str, List[str]]]:
    """Full preprocessing pipeline for incoming SMS/WhatsApp messages."""
    text = normalize_unicode(text)
    if mask_pii:
        text, entities = mask_entities(text)
    else:
        entities = {"urls": extract_urls(text), "phones": [], "amounts": [], "otps": []}
    text = normalize_hinglish_variants(text)
    text = WHITESPACE_PATTERN.sub(" ", text).strip()
    return text, entities


def deduplicate_messages(
    texts: List[str], jaccard_threshold: float = 0.90
) -> List[int]:
    """
    Identify indices of non-duplicate messages using character/word n-gram Jaccard similarity.
    Returns list of retained indices.
    """
    retained_indices = []
    seen_token_sets: List[Set[str]] = []

    for idx, text in enumerate(texts):
        tokens = set(text.lower().split())
        if not tokens:
            continue
        is_duplicate = False
        for seen in seen_token_sets:
            intersection = len(tokens & seen)
            union = len(tokens | seen)
            similarity = intersection / union if union > 0 else 0
            if similarity >= jaccard_threshold:
                is_duplicate = True
                break
        if not is_duplicate:
            seen_token_sets.append(tokens)
            retained_indices.append(idx)

    return retained_indices


if __name__ == "__main__":
    sample_text = (
        "Dear Customer, your SBI A/C 4589 is blck! Update KYC immediately. "
        "OTP is 482910. Visit http://sbi-kyc-update.xyz/verify or call 9876543210. "
        "Pending charges Rs. 500."
    )
    print("Original text:")
    print(sample_text)
    cleaned, ents = clean_message(sample_text)
    print("\nCleaned & Masked text:")
    print(cleaned)
    print("\nExtracted Entities:")
    print(ents)
