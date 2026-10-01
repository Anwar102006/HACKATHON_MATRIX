"""TruthLens Natural Language Inference (NLI) Service.

Provides claim-to-evidence relationship comparison using a pretrained cross-encoder:
Model: cross-encoder/nli-distilroberta-base
Hosted: Hugging Face (Apache 2.0 license)
Input format: (premise=evidence_text, hypothesis=atomic_claim)
Output labels normalized to: ENTAILS, CONTRADICTS, NEUTRAL

CRITICAL HONESTY RULES:
1. NLI confidence is model confidence in the PREMISE-HYPOTHESIS relationship,
   NOT the probability that a claim is true.
2. Telugu/Tamil are detected honestly; unsupported language state is returned
   rather than fabricating misleading inferences.
3. Evidence text source is strictly tracked (full_text vs description vs title).
"""

import logging
import time
from typing import Any, Dict, List, Optional
import torch
from pydantic import BaseModel, Field

logger = logging.getLogger("truthlens.nli")


class NLIScores(BaseModel):
    entails: float
    contradicts: float
    neutral: float


class PairComparisonResult(BaseModel):
    claim_id: str
    claim_text: str
    evidence_id: str
    evidence_title: str
    evidence_source_url: str
    evidence_publisher: str
    relationship: str  # ENTAILS | CONTRADICTS | NEUTRAL | UNSUPPORTED_LANGUAGE | ERROR
    confidence: float
    scores: Optional[NLIScores] = None
    evidence_text_source: str  # full_text | description | title | title_description
    evidence_text_used: str
    relationship_explanation: str
    inference_time_ms: float
    error_message: Optional[str] = None


class BatchComparisonResponse(BaseModel):
    comparisons: List[PairComparisonResult] = Field(default_factory=list)
    total_comparisons: int = 0
    relationship_counts: Dict[str, int] = Field(default_factory=dict)
    model_name: str = "cross-encoder/nli-distilroberta-base"
    total_duration_ms: float = 0.0
    truncation_applied: bool = False
    limitation_notice: str = (
        "TruthLens currently compares claims with retrieved evidence using a pretrained NLI model. "
        "These relationships are model predictions of premise-hypothesis consistency, NOT final determinations "
        "of objective truth. Source authority and evidence fusion are evaluated in later stages."
    )


class NLIService:
    """Singleton service for loading NLI model and executing inference."""

    MODEL_NAME = "cross-encoder/nli-distilroberta-base"
    MAX_CLAIMS = 10
    MAX_EVIDENCE_PER_CLAIM = 10

    _instance: Optional["NLIService"] = None
    _model = None
    _tokenizer = None
    _is_loaded: bool = False
    _load_time_seconds: float = 0.0

    @classmethod
    def get_instance(cls) -> "NLIService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def ensure_model_loaded(self) -> bool:
        """Lazy loader for NLI model and tokenizer."""
        if self._is_loaded and self._model is not None and self._tokenizer is not None:
            return True

        try:
            logger.info(f"[NLI] Loading model '{self.MODEL_NAME}'...")
            t0 = time.time()
            from transformers import AutoModelForSequenceClassification, AutoTokenizer

            self._tokenizer = AutoTokenizer.from_pretrained(self.MODEL_NAME)
            self._model = AutoModelForSequenceClassification.from_pretrained(self.MODEL_NAME)
            self._model.eval()
            self._load_time_seconds = round(time.time() - t0, 2)
            self._is_loaded = True
            logger.info(f"[NLI] Model loaded successfully in {self._load_time_seconds}s")
            return True
        except Exception as e:
            logger.error(f"[NLI] Failed to load NLI model: {e}")
            self._is_loaded = False
            return False

    def select_evidence_text(self, evidence: Dict[str, Any]) -> tuple[str, str]:
        """Determine actual text available and record its source.

        Priority:
        1. article full text if available (> 50 chars)
        2. article description (> 20 chars)
        3. title + description
        4. title
        """
        content = (evidence.get("content") or "").strip()
        description = (evidence.get("description") or "").strip()
        title = (evidence.get("title") or "").strip()

        if len(content) > 50:
            return content[:1000], "full_text"

        if len(description) > 20 and len(title) > 5:
            # Combine title and description for richer context
            combined = f"{title}. {description}"
            return combined[:800], "title_description"

        if len(description) > 20:
            return description[:800], "description"

        if len(title) > 0:
            return title[:500], "title"

        return "", "none"

    def compare_pair(
        self,
        claim_id: str,
        claim_text: str,
        claim_lang: str,
        is_verifiable: bool,
        evidence: Dict[str, Any],
    ) -> PairComparisonResult:
        """Compare a single atomic claim against a single piece of evidence."""
        ev_id = str(evidence.get("id") or "ev_unknown")
        ev_title = str(evidence.get("title") or "Untitled Evidence")
        ev_url = str(evidence.get("source_url") or "")
        ev_publisher = str(evidence.get("publisher") or "Unknown Publisher")

        ev_text, ev_source = self.select_evidence_text(evidence)

        # Handle subjective / opinion claims
        if not is_verifiable:
            return PairComparisonResult(
                claim_id=claim_id,
                claim_text=claim_text,
                evidence_id=ev_id,
                evidence_title=ev_title,
                evidence_source_url=ev_url,
                evidence_publisher=ev_publisher,
                relationship="NEUTRAL",
                confidence=0.0,
                scores=NLIScores(entails=0.0, contradicts=0.0, neutral=1.0),
                evidence_text_source=ev_source,
                evidence_text_used=ev_text[:150],
                relationship_explanation="Claim is subjective or opinion-based; factual NLI consistency cannot be evaluated.",
                inference_time_ms=0.0,
            )

        # Handle unsupported language (Telugu, Tamil, unknown)
        if claim_lang.lower() not in ("en", "english"):
            return PairComparisonResult(
                claim_id=claim_id,
                claim_text=claim_text,
                evidence_id=ev_id,
                evidence_title=ev_title,
                evidence_source_url=ev_url,
                evidence_publisher=ev_publisher,
                relationship="UNSUPPORTED_LANGUAGE",
                confidence=0.0,
                scores=None,
                evidence_text_source=ev_source,
                evidence_text_used=ev_text[:150],
                relationship_explanation=(
                    f"Language '{claim_lang}' is not supported by the English NLI model. "
                    "Claim preserved honestly without fabricating unverified predictions."
                ),
                inference_time_ms=0.0,
                error_message="NLI_LANGUAGE_NOT_SUPPORTED",
            )

        # Empty evidence check
        if not ev_text:
            return PairComparisonResult(
                claim_id=claim_id,
                claim_text=claim_text,
                evidence_id=ev_id,
                evidence_title=ev_title,
                evidence_source_url=ev_url,
                evidence_publisher=ev_publisher,
                relationship="NEUTRAL",
                confidence=0.0,
                scores=NLIScores(entails=0.0, contradicts=0.0, neutral=1.0),
                evidence_text_source="none",
                evidence_text_used="",
                relationship_explanation="Evidence item has no textual body or description for comparison.",
                inference_time_ms=0.0,
            )

        # Ensure model is ready
        if not self.ensure_model_loaded():
            return PairComparisonResult(
                claim_id=claim_id,
                claim_text=claim_text,
                evidence_id=ev_id,
                evidence_title=ev_title,
                evidence_source_url=ev_url,
                evidence_publisher=ev_publisher,
                relationship="ERROR",
                confidence=0.0,
                scores=None,
                evidence_text_source=ev_source,
                evidence_text_used=ev_text[:150],
                relationship_explanation="NLI model is temporarily unavailable.",
                inference_time_ms=0.0,
                error_message="NLI_MODEL_UNAVAILABLE",
            )

        t_start = time.time()
        try:
            # Cross-encoder inference: Premise = Evidence, Hypothesis = Claim
            inputs = self._tokenizer(ev_text, claim_text, return_tensors="pt", truncation=True, max_length=512)
            with torch.no_grad():
                logits = self._model(**inputs).logits
                probs = torch.softmax(logits, dim=-1)[0].tolist()

            # Label mapping from cross-encoder/nli-distilroberta-base:
            # 0: contradiction -> CONTRADICTS
            # 1: entailment    -> ENTAILS
            # 2: neutral       -> NEUTRAL
            scores = NLIScores(
                contradicts=round(probs[0], 4),
                entails=round(probs[1], 4),
                neutral=round(probs[2], 4),
            )

            # Determine top relationship
            top_idx = int(torch.argmax(logits, dim=-1)[0])
            label_map = {0: "CONTRADICTS", 1: "ENTAILS", 2: "NEUTRAL"}
            relationship = label_map.get(top_idx, "NEUTRAL")

            conf_map = {"CONTRADICTS": scores.contradicts, "ENTAILS": scores.entails, "NEUTRAL": scores.neutral}
            confidence = conf_map[relationship]

            # Explanations using non-absolute terminology
            explanations = {
                "ENTAILS": "Evidence text is logically consistent with this claim.",
                "CONTRADICTS": "Evidence text conflicts with or refutes this claim.",
                "NEUTRAL": "Evidence text neither directly confirms nor refutes this claim.",
            }

            elapsed_ms = round((time.time() - t_start) * 1000, 2)

            return PairComparisonResult(
                claim_id=claim_id,
                claim_text=claim_text,
                evidence_id=ev_id,
                evidence_title=ev_title,
                evidence_source_url=ev_url,
                evidence_publisher=ev_publisher,
                relationship=relationship,
                confidence=confidence,
                scores=scores,
                evidence_text_source=ev_source,
                evidence_text_used=ev_text[:200] + ("..." if len(ev_text) > 200 else ""),
                relationship_explanation=explanations.get(relationship, "Evidence comparison completed."),
                inference_time_ms=elapsed_ms,
            )
        except Exception as e:
            logger.error(f"[NLI] Inference error for claim '{claim_id}': {e}")
            elapsed_ms = round((time.time() - t_start) * 1000, 2)
            return PairComparisonResult(
                claim_id=claim_id,
                claim_text=claim_text,
                evidence_id=ev_id,
                evidence_title=ev_title,
                evidence_source_url=ev_url,
                evidence_publisher=ev_publisher,
                relationship="ERROR",
                confidence=0.0,
                scores=None,
                evidence_text_source=ev_source,
                evidence_text_used=ev_text[:150],
                relationship_explanation="Inference failed due to an internal error.",
                inference_time_ms=elapsed_ms,
                error_message=str(e),
            )

    def compare_batch(
        self,
        claims: List[Dict[str, Any]],
        evidence_items: List[Dict[str, Any]],
    ) -> BatchComparisonResponse:
        """Compare multiple claims against multiple evidence items with resource limits."""
        t_overall_start = time.time()

        # Apply comparison limits
        truncation_applied = False
        limited_claims = claims[: self.MAX_CLAIMS]
        if len(claims) > self.MAX_CLAIMS:
            truncation_applied = True

        limited_evidence = evidence_items[: self.MAX_EVIDENCE_PER_CLAIM]
        if len(evidence_items) > self.MAX_EVIDENCE_PER_CLAIM:
            truncation_applied = True

        logger.info(
            f"[Analysis] claims={len(claims)} (evaluated={len(limited_claims)}) "
            f"evidence={len(evidence_items)} (evaluated={len(limited_evidence)})"
        )

        comparisons: List[PairComparisonResult] = []
        counts: Dict[str, int] = {"ENTAILS": 0, "CONTRADICTS": 0, "NEUTRAL": 0, "UNSUPPORTED_LANGUAGE": 0, "ERROR": 0}

        for c in limited_claims:
            c_id = str(c.get("id") or "claim_unknown")
            c_text = str(c.get("text") or "").strip()
            c_lang = str(c.get("language") or "en")
            is_verifiable = bool(c.get("is_verifiable", True))

            if not c_text:
                continue

            for ev in limited_evidence:
                res = self.compare_pair(
                    claim_id=c_id,
                    claim_text=c_text,
                    claim_lang=c_lang,
                    is_verifiable=is_verifiable,
                    evidence=ev,
                )
                comparisons.append(res)
                counts[res.relationship] = counts.get(res.relationship, 0) + 1

        total_duration = round((time.time() - t_overall_start) * 1000, 2)
        logger.info(
            f"[NLI] comparisons={len(comparisons)} "
            f"entails={counts.get('ENTAILS', 0)} contradicts={counts.get('CONTRADICTS', 0)} neutral={counts.get('NEUTRAL', 0)} "
            f"duration={total_duration}ms"
        )

        return BatchComparisonResponse(
            comparisons=comparisons,
            total_comparisons=len(comparisons),
            relationship_counts=counts,
            model_name=self.MODEL_NAME,
            total_duration_ms=total_duration,
            truncation_applied=truncation_applied,
        )


nli_service = NLIService.get_instance()
