from typing import List, Optional
from pydantic import BaseModel, Field


class EvidenceSearchRequest(BaseModel):
    """Request schema for evidence retrieval."""
    claim: str = Field(..., min_length=1, max_length=500, description="The core claim or news headline to retrieve evidence for.")
    country: Optional[str] = Field(None, max_length=10, description="ISO country code filter (e.g., 'IN').")
    language: Optional[str] = Field(None, max_length=10, description="ISO language code filter (e.g., 'en', 'te', 'ta').")
    date: Optional[str] = Field(None, description="Preset period: 'today', 'yesterday', '24h', '48h', '7d', '30d'.")
    size: Optional[int] = Field(10, ge=1, le=100, description="Number of results to retrieve (1-100).")
    jurisdiction: Optional[str] = Field(None, description="TruthLens target jurisdiction context.")


class NormalizedEvidenceItem(BaseModel):
    """Normalized evidence candidate model.

    Represents a candidate article or public record retrieved from an evidence provider.
    NOTE: An evidence candidate is NOT proof of truth.
    """
    id: str
    title: str
    publisher: Optional[str] = None
    source_url: str
    published_at: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    source_type: str = "news"
    provider: str = "free_news_api"
    language: Optional[str] = None
    country: Optional[str] = None
    retrieval_timestamp: str


class EvidenceSearchResponse(BaseModel):
    """Normalized search response returned to the frontend."""
    claim: str
    total_found: int
    results_count: int
    provider: str
    took_ms: Optional[int] = None
    results: List[NormalizedEvidenceItem]
    jurisdiction: Optional[str] = None
    warning: Optional[str] = None


class EvidenceErrorDetail(BaseModel):
    code: str
    message: str


class EvidenceErrorResponse(BaseModel):
    error: EvidenceErrorDetail
