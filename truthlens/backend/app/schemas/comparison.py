"""TruthLens Comparison and Analysis Schemas.

Defines schemas for:
- POST /api/evidence/compare
- POST /api/evidence/analyze
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field

from app.schemas.evidence import NormalizedEvidenceItem
from app.services.claim_decomposer import AtomicClaim
from app.services.nli_service import PairComparisonResult


class ClaimCompareItem(BaseModel):
    id: str = Field(..., description="Unique atomic claim ID")
    text: str = Field(..., min_length=1, max_length=1000, description="Claim text")
    language: Optional[str] = Field("en", description="Detected language code (en, te, ta, unknown)")
    is_verifiable: Optional[bool] = Field(True, description="Whether claim is objective/verifiable")


class EvidenceCompareItem(BaseModel):
    id: str = Field(..., description="Evidence candidate ID")
    title: str = Field(..., description="Headline or title")
    description: Optional[str] = Field(None, description="Article summary/description")
    content: Optional[str] = Field(None, description="Full article text if genuinely available")
    source_url: str = Field(..., description="Canonical source URL")
    publisher: Optional[str] = Field("Unknown Publisher", description="Publisher name")


class EvidenceCompareRequest(BaseModel):
    claims: List[ClaimCompareItem] = Field(..., min_length=1, max_length=50, description="Atomic claims to evaluate (truncated to 10 by service)")
    evidence: List[EvidenceCompareItem] = Field(..., min_length=1, max_length=50, description="Evidence items to compare against (truncated to 10 by service)")


class EvidenceCompareResponse(BaseModel):
    comparisons: List[PairComparisonResult]
    total_comparisons: int
    relationship_counts: Dict[str, int]
    model_name: str
    total_duration_ms: float
    truncation_applied: bool
    limitation_notice: str


class EvidenceAnalyzeRequest(BaseModel):
    claim: str = Field(..., min_length=1, max_length=2000, description="User submitted claim text")
    jurisdiction: Optional[str] = Field(None, description="Optional user-selected jurisdiction; remains None/null if not supplied")
    language: Optional[str] = Field(None, description="Optional language override; detected automatically if omitted")
    max_results: Optional[int] = Field(5, ge=1, le=10, description="Number of evidence articles to retrieve")


class EvidenceAnalyzeResponse(BaseModel):
    original_claim: str
    detected_language: str
    language_confidence: float
    jurisdiction: Optional[str] = Field(None, description="User-selected jurisdiction or None if unselected (never inferred from language)")
    atomic_claims: List[AtomicClaim]
    total_atomic_claims: int
    is_opinion_only: bool
    evidence: List[NormalizedEvidenceItem]
    total_evidence_retrieved: int
    relationships: List[PairComparisonResult]
    total_relationships: int
    relationship_counts: Dict[str, int]
    nli_model: str
    limitation_notice: str
    timings_ms: Dict[str, float]
