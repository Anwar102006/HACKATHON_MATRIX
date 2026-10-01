"""TruthLens Claim Decomposer Service.

Decomposes user claims into atomic, independently verifiable claims.
Detects claim types (FACTUAL, NUMERICAL, DATE, LOCATION, POLICY / GOVERNMENT,
PERSON / ORGANIZATION, EVENT, OPINION / SUBJECTIVE, UNKNOWN).
Detects language (English, Telugu, Tamil, UNKNOWN) independently of jurisdiction.
"""

import re
from typing import Dict, List, Optional, Tuple
from pydantic import BaseModel, Field


class AtomicClaim(BaseModel):
    id: str
    text: str
    claim_type: str
    is_verifiable: bool = True
    subjective_reason: Optional[str] = None
    language: str = "en"
    detected_entities: List[str] = Field(default_factory=list)


class DecompositionResult(BaseModel):
    original_text: str
    detected_language: str
    language_confidence: float
    jurisdiction_hint: Optional[str] = None  # Explicitly kept independent of language
    claims: List[AtomicClaim] = Field(default_factory=list)
    total_claims: int = 0
    is_opinion_only: bool = False
    truncation_applied: bool = False


# Keyword lists for classification
OPINION_MARKERS = [
    r"\b(greatest|best|worst|terrible|horrible|amazing|awesome|magnificent|wonderful)\b",
    r"\b(beautiful|ugly|fantastic|disgusting|pathetic|unacceptable|superior|inferior)\b",
    r"\b(should|must|ought to)\b",
    r"\b(in my opinion|i believe|i feel|personally|i think|seems to me)\b",
    r"\b(undoubtedly the best|world['']?s greatest)\b",
]

POLICY_MARKERS = [
    r"\b(reserve bank of india|rbi|central bank)\b",
    r"\b(government|govt|ministry|minister|cabinet|parliament|assembly|ordinance)\b",
    r"\b(scheme|subsidy|yojana|policy|bill|act|order|supreme court|high court)\b",
    r"\b(cm|pm|chief minister|prime minister|governor|president|lok sabha|rajya sabha)\b",
    r"\b(welfare|pension|ration|quota|reservation|reform)\b",
]

NUMERICAL_MARKERS = [
    r"[₹$€£]\s*\d+",
    r"\b\d+[\d,]*(\.\d+)?\b",
    r"\b\d+\s*(percent|%|crore|crores|lakh|lakhs|million|millions|billion|billions|trillion)\b",
    r"\b(rupees|dollars|funds|grant|budget)\b",
]

DATE_MARKERS = [
    r"\b(january|february|march|april|may|june|july|august|september|october|november|december)\b",
    r"\b(jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b",
    r"\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
    r"\b(yesterday|today|tomorrow|last week|next week|last month|next month|last year|next year)\b",
    r"\b(19\d\d|20[0-3]\d)\b",
    r"\b\d{1,2}(st|nd|rd|th)?\s+(of\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|[a-z]+)\b",
]

LOCATION_MARKERS = [
    r"\b(india|delhi|mumbai|bengaluru|bangalore|hyderabad|chennai|kolkata)\b",
    r"\b(andhra pradesh|telangana|tamil nadu|kerala|karnataka|maharashtra|uttar pradesh)\b",
    r"\b(amaravati|visakhapatnam|vijayawada|warangal|madurai|coimbatore)\b",
    r"\b(andaman|nicobar|jammu|kashmir|srinagar|ladakh)\b",
    r"\b(us|usa|united states|uk|britain|china|pakistan|russia|ukraine)\b",
]

PERSON_ORG_MARKERS = [
    r"\b(modi|rahul gandhi|stalin|revanth reddy|chandrababu|jagan|biden|trump|putin)\b",
    r"\b(isro|drdo|nasa|who|un|united nations|bjp|congress|dmk|tdp|ysrcp|brs)\b",
    r"\b(tcs|infosys|reliance|adani|tata|wipro|google|microsoft|meta|apple)\b",
]

EVENT_MARKERS = [
    r"\b(launch|launched|summit|conference|election|elections|vote|voting)\b",
    r"\b(earthquake|flood|cyclone|disaster|accident|crash|explosion)\b",
    r"\b(protest|strike|rally|inauguration|meeting|ceremony|treaty)\b",
]


class ClaimDecomposer:
    """Service to decompose user claims, identify claim types, and detect language."""

    MAX_ATOMIC_CLAIMS = 10

    def detect_language(self, text: str) -> Tuple[str, float]:
        """Detect language independently from jurisdiction.

        Supported:
        - English ('en')
        - Telugu ('te')
        - Tamil ('ta')
        - UNKNOWN ('unknown')
        """
        if not text or not text.strip():
            return "unknown", 0.0

        clean_text = text.strip()
        total_chars = len(clean_text)

        telugu_chars = len(re.findall(r"[\u0C00-\u0C7F]", clean_text))
        tamil_chars = len(re.findall(r"[\u0B80-\u0BFF]", clean_text))
        latin_chars = len(re.findall(r"[a-zA-Z]", clean_text))

        # Check Telugu
        if telugu_chars > 0 and (telugu_chars / max(total_chars, 1)) > 0.15:
            conf = min(0.99, round(telugu_chars / max(latin_chars + telugu_chars, 1), 2))
            return "te", max(conf, 0.6)

        # Check Tamil
        if tamil_chars > 0 and (tamil_chars / max(total_chars, 1)) > 0.15:
            conf = min(0.99, round(tamil_chars / max(latin_chars + tamil_chars, 1), 2))
            return "ta", max(conf, 0.6)

        # Check English
        if latin_chars > 0 and (latin_chars / max(total_chars, 1)) > 0.4:
            conf = min(0.99, round(latin_chars / max(total_chars, 1), 2))
            return "en", max(conf, 0.7)

        return "unknown", 0.0

    def detect_claim_type(self, text: str) -> Tuple[str, bool, Optional[str]]:
        """Detect basic claim type and determine if it is verifiable or subjective opinion.

        Returns: (claim_type, is_verifiable, subjective_reason)
        """
        lower = text.lower()

        # 1. Check for opinion / subjective first
        for pat in OPINION_MARKERS:
            if re.search(pat, lower, re.IGNORECASE):
                return (
                    "OPINION / SUBJECTIVE",
                    False,
                    "Subjective or opinion-based statement; not an objective verifiable fact.",
                )

        # 2. Check for Policy / Government
        for pat in POLICY_MARKERS:
            if re.search(pat, lower, re.IGNORECASE):
                # Also check if it contains numerical or date aspects
                return "POLICY / GOVERNMENT", True, None

        # 3. Check for Numerical
        for pat in NUMERICAL_MARKERS:
            if re.search(pat, lower, re.IGNORECASE):
                return "NUMERICAL", True, None

        # 4. Check for Date
        for pat in DATE_MARKERS:
            if re.search(pat, lower, re.IGNORECASE):
                return "DATE", True, None

        # 5. Check for Event
        for pat in EVENT_MARKERS:
            if re.search(pat, lower, re.IGNORECASE):
                return "EVENT", True, None

        # 6. Check for Person / Organization
        for pat in PERSON_ORG_MARKERS:
            if re.search(pat, lower, re.IGNORECASE):
                return "PERSON / ORGANIZATION", True, None

        # 7. Check for Location
        for pat in LOCATION_MARKERS:
            if re.search(pat, lower, re.IGNORECASE):
                return "LOCATION", True, None

        # 8. Check if general factual or unknown
        words = text.strip().split()
        if len(words) >= 3:
            return "FACTUAL", True, None

        return "UNKNOWN", False, "Insufficient context to formulate a verifiable factual claim."

    def _split_compound_sentences(self, sentence: str) -> List[str]:
        """Split a sentence on coordinating conjunctions if both parts are substantial clauses."""
        s = sentence.strip()
        if not s:
            return []

        # Common compound conjunction patterns: " and the ", " and will ", " and it ", " while ", " but "
        # Avoid splitting "India and Pakistan" (subject coordination)
        conjunction_patterns = [
            r"\s+and\s+(?:the\s+|it\s+|this\s+|that\s+|they\s+|he\s+|she\s+|scheme\s+|policy\s+|will\s+|shall\s+|has\s+|have\s+)",
            r";\s*",
            r"\s+while\s+(?:the\s+|it\s+|india\s+|govt\s+|officials\s+)",
            r",\s+and\s+(?:the\s+|it\s+|this\s+|will\s+|scheme\s+)",
        ]

        for pattern in conjunction_patterns:
            parts = re.split(pattern, s, flags=re.IGNORECASE)
            if len(parts) > 1:
                # Check that both parts have at least 3 words to avoid chopping phrases
                valid_parts = [p.strip() for p in parts if len(p.strip().split()) >= 3]
                if len(valid_parts) == len(parts) and len(valid_parts) > 1:
                    reconstructed = []
                    for i, p in enumerate(parts):
                        cleaned = p.strip()
                        # If a split part lost its subject like "will begin on January 1", reconstruct context
                        if re.match(r"^(will|shall|has|have|is|are|was|were)\b", cleaned, re.IGNORECASE):
                            cleaned = f"The scheme {cleaned}"
                        elif re.match(r"^(begin|begins|starts|started)\b", cleaned, re.IGNORECASE):
                            cleaned = f"The scheme will {cleaned}"

                        # Capitalize first letter and ensure ending punctuation
                        cleaned = cleaned[0].upper() + cleaned[1:] if len(cleaned) > 0 else cleaned
                        if not cleaned.endswith((".", "!", "?")):
                            cleaned += "."
                        reconstructed.append(cleaned)
                    return reconstructed

        # Fallback: if no substantial conjunction split, return single cleaned sentence
        cleaned = s[0].upper() + s[1:] if len(s) > 0 else s
        if not cleaned.endswith((".", "!", "?")):
            cleaned += "."
        return [cleaned]

    def decompose(self, text: str, jurisdiction: Optional[str] = None) -> DecompositionResult:
        """Decompose user claim text into atomic claims."""
        if not text or not text.strip():
            return DecompositionResult(
                original_text="",
                detected_language="unknown",
                language_confidence=0.0,
                jurisdiction_hint=jurisdiction,
                claims=[],
                total_claims=0,
                is_opinion_only=False,
                truncation_applied=False,
            )

        raw_text = text.strip()
        lang, lang_conf = self.detect_language(raw_text)

        # 1. Split on major sentence delimiters (. ! ? \n)
        sentences = re.split(r"(?<=[.!?])\s+|\n+", raw_text)
        candidate_clauses: List[str] = []

        for s in sentences:
            s_clean = s.strip()
            if not s_clean:
                continue
            # Decompose compound sentences
            atomic_parts = self._split_compound_sentences(s_clean)
            candidate_clauses.extend(atomic_parts)

        # Truncation check (max atomic claims limit)
        truncation_applied = len(candidate_clauses) > self.MAX_ATOMIC_CLAIMS
        limited_clauses = candidate_clauses[: self.MAX_ATOMIC_CLAIMS]

        # 2. Analyze each atomic claim
        atomic_claims: List[AtomicClaim] = []
        opinion_count = 0

        for idx, clause in enumerate(limited_clauses, start=1):
            claim_type, is_verifiable, subjective_reason = self.detect_claim_type(clause)
            if claim_type == "OPINION / SUBJECTIVE":
                opinion_count += 1

            claim_obj = AtomicClaim(
                id=f"claim_{idx}",
                text=clause,
                claim_type=claim_type,
                is_verifiable=is_verifiable,
                subjective_reason=subjective_reason,
                language=lang,
                detected_entities=[],
            )
            atomic_claims.append(claim_obj)

        is_opinion_only = (opinion_count == len(atomic_claims)) and len(atomic_claims) > 0

        return DecompositionResult(
            original_text=raw_text,
            detected_language=lang,
            language_confidence=lang_conf,
            jurisdiction_hint=jurisdiction,
            claims=atomic_claims,
            total_claims=len(atomic_claims),
            is_opinion_only=is_opinion_only,
            truncation_applied=truncation_applied,
        )
