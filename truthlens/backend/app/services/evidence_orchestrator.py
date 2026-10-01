import logging
from typing import List
from urllib.parse import urlparse

from app.schemas.evidence import (
    EvidenceSearchRequest,
    EvidenceSearchResponse,
    NormalizedEvidenceItem,
)
from app.services.providers.free_news_api import FreeNewsProvider, FreeNewsAPIError

logger = logging.getLogger("truthlens.services.orchestrator")


class EvidenceOrchestrator:
    """Coordinates evidence retrieval across configured news and public record providers.

    In Phase 3, queries Free News API as the foundational evidence candidate provider.
    Designed for subsequent expansion to Brave Search, ClaimReview, and official gazette connectors.
    """

    def __init__(self, free_news_provider: FreeNewsProvider = None):
        self.free_news_provider = free_news_provider or FreeNewsProvider()

    async def search(self, request: EvidenceSearchRequest) -> EvidenceSearchResponse:
        """Search evidence candidates for a validated claim.

        Args:
            request: Validated EvidenceSearchRequest containing claim and filters.

        Returns:
            EvidenceSearchResponse with deduplicated, normalized evidence items.
        """
        safe_claim_preview = request.claim[:60] + "..." if len(request.claim) > 60 else request.claim
        logger.info(
            "[Orchestrator] Starting evidence search: query='%s' jurisdiction='%s' country='%s' lang='%s'",
            safe_claim_preview,
            request.jurisdiction,
            request.country,
            request.language,
        )

        logger.info("[Orchestrator] Dispatching to provider=free_news_api")

        # 1. Fetch from provider
        provider_data = await self.free_news_provider.search(
            claim=request.claim,
            country=request.country,
            language=request.language,
            date=request.date,
            size=request.size or 10,
        )

        raw_items: List[NormalizedEvidenceItem] = provider_data.get("items", [])
        logger.info("[Normalizer] received=%d normalized=%d", len(raw_items), len(raw_items))

        # 2. Deterministic Deduplication
        deduped_items = self._deduplicate_items(raw_items)
        logger.info("[Deduplication] before=%d after=%d", len(raw_items), len(deduped_items))

        warning = None
        if not deduped_items:
            warning = "No matching evidence documents found for this query in the active 30-day news index."

        return EvidenceSearchResponse(
            claim=request.claim,
            total_found=provider_data.get("total", len(deduped_items)),
            results_count=len(deduped_items),
            provider="free_news_api",
            took_ms=provider_data.get("took_ms"),
            results=deduped_items,
            jurisdiction=request.jurisdiction,
            warning=warning,
        )

    @staticmethod
    def _deduplicate_items(items: List[NormalizedEvidenceItem]) -> List[NormalizedEvidenceItem]:
        """Perform deterministic deduplication using canonical URL and/or article ID.

        Normalizes URL by stripping trailing slashes, tracking query parameters (utm_*), and lowercase host.
        """
        seen_keys = set()
        deduped = []

        for item in items:
            canonical_key = None
            if item.source_url:
                try:
                    parsed = urlparse(item.source_url)
                    # Host + path without trailing slash
                    clean_path = parsed.path.rstrip("/")
                    canonical_key = f"{parsed.netloc.lower()}{clean_path}"
                except Exception:
                    canonical_key = item.source_url.strip().lower()

            if not canonical_key:
                canonical_key = item.id or f"{item.title.strip().lower()}::{item.publisher or ''}"

            if canonical_key not in seen_keys:
                seen_keys.add(canonical_key)
                deduped.append(item)

        return deduped
