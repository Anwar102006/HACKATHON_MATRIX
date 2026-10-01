import os
import time
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import httpx

from app.schemas.evidence import NormalizedEvidenceItem

logger = logging.getLogger("truthlens.providers.free_news_api")

FREE_NEWS_API_BASE_URL = os.getenv("FREE_NEWS_API_BASE_URL", "https://freenewsapi.ai/v1")


class FreeNewsAPIError(Exception):
    """Custom exception for Free News API failures."""
    def __init__(self, code: str, message: str, status_code: int = 502):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class FreeNewsProvider:
    """Provider service interface for Free News API (https://freenewsapi.ai).

    A keyless, public article retrieval provider for news corpus search.
    Treats results as candidate news evidence items, not authoritative verdicts.
    """

    def __init__(self, base_url: str = FREE_NEWS_API_BASE_URL, timeout: float = 12.0):
        self.base_url = base_url.rstrip("/")
        self.search_url = f"{self.base_url}/search"
        self.timeout = timeout

    async def search(
        self,
        claim: str,
        country: Optional[str] = None,
        language: Optional[str] = None,
        date: Optional[str] = None,
        size: int = 10,
    ) -> Dict[str, Any]:
        """Search the Free News API for articles relevant to a claim.

        Args:
            claim: Search query/claim text.
            country: Optional ISO 3166-1 alpha-2 country code (e.g., 'IN').
            language: Optional ISO 639-1 language code (e.g., 'en').
            date: Optional date preset ('today', 'yesterday', '24h', '48h', '7d', '30d').
            size: Number of results (1-100).

        Returns:
            Dict containing raw took_ms, total, and normalized items list.
        """
        # 1. Parameter assembly according to official documentation
        params: Dict[str, Any] = {
            "q": claim.strip()[:500],
            "size": min(max(size, 1), 100),
            "sort": "relevance",
            "full_text": False,  # Lightweight search metadata per Phase 3 requirements
        }

        if country and country.strip():
            params["country"] = country.strip().upper()

        if language and language.strip():
            # Lowercase language code per docs
            params["lang"] = language.strip().lower()

        if date and date.strip():
            allowed_dates = {"today", "yesterday", "24h", "48h", "7d", "30d"}
            cleaned_date = date.strip().lower()
            if cleaned_date in allowed_dates:
                params["date"] = cleaned_date

        start_time = time.time()
        logger.info("[FreeNewsAPI] request started: endpoint=%s params_keys=%s", self.search_url, list(params.keys()))

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(self.search_url, params=params)

            duration_ms = int((time.time() - start_time) * 1000)
            logger.info("[FreeNewsAPI] response received: status=%d duration_ms=%d", response.status_code, duration_ms)

            # Handle known HTTP status codes
            if response.status_code == 200:
                try:
                    payload = response.json()
                except Exception as json_err:
                    logger.error("[FreeNewsAPI] Malformed JSON response: %s", str(json_err))
                    raise FreeNewsAPIError(
                        code="PROVIDER_MALFORMED_RESPONSE",
                        message="Free News API returned an invalid JSON response format.",
                        status_code=502,
                    )

                results = payload.get("results", [])
                normalized_items = self._normalize_results(results)
                return {
                    "took_ms": payload.get("took_ms", duration_ms),
                    "total": payload.get("total", len(normalized_items)),
                    "items": normalized_items,
                }

            elif response.status_code == 400:
                detail = self._extract_error_detail(response, "Malformed search parameter.")
                logger.warning("[FreeNewsAPI] 400 Bad Request: %s", detail)
                raise FreeNewsAPIError(code="PROVIDER_BAD_REQUEST", message=detail, status_code=400)

            elif response.status_code == 422:
                detail = self._extract_error_detail(response, "Parameter value out of accepted range.")
                logger.warning("[FreeNewsAPI] 422 Unprocessable: %s", detail)
                raise FreeNewsAPIError(code="PROVIDER_INVALID_PARAMS", message=detail, status_code=422)

            elif response.status_code == 429:
                logger.warning("[FreeNewsAPI] 429 Rate limited by upstream provider.")
                raise FreeNewsAPIError(
                    code="PROVIDER_RATE_LIMIT",
                    message="Upstream evidence search is currently rate limited. Please try again shortly.",
                    status_code=429,
                )

            elif response.status_code in (502, 503, 504):
                logger.error("[FreeNewsAPI] Upstream server error status=%d", response.status_code)
                raise FreeNewsAPIError(
                    code="PROVIDER_UNAVAILABLE",
                    message="Free News API search backend is currently unavailable.",
                    status_code=503,
                )

            else:
                logger.error("[FreeNewsAPI] Unexpected upstream HTTP status=%d", response.status_code)
                raise FreeNewsAPIError(
                    code="PROVIDER_ERROR",
                    message=f"Evidence search provider returned unexpected HTTP {response.status_code}.",
                    status_code=502,
                )

        except httpx.TimeoutException:
            logger.error("[FreeNewsAPI] Request timed out after %.1fs", self.timeout)
            raise FreeNewsAPIError(
                code="PROVIDER_TIMEOUT",
                message="The evidence provider took too long to respond. Please try a simpler search phrase.",
                status_code=504,
            )
        except httpx.RequestError as exc:
            logger.error("[FreeNewsAPI] Network error connecting to provider: %s", type(exc).__name__)
            raise FreeNewsAPIError(
                code="PROVIDER_NETWORK_ERROR",
                message="Network communication error while connecting to Free News API.",
                status_code=502,
            )

    def _normalize_results(self, raw_results: List[Dict[str, Any]]) -> List[NormalizedEvidenceItem]:
        """Normalize raw Free News API article objects into TruthLens evidence candidates."""
        now_iso = datetime.now(timezone.utc).isoformat()
        normalized: List[NormalizedEvidenceItem] = []

        for item in raw_results:
            if not isinstance(item, dict):
                continue

            article_url = item.get("url") or ""
            if not article_url:
                continue

            normalized_item = NormalizedEvidenceItem(
                id=str(item.get("id") or hash(article_url)),
                title=item.get("title") or "Untitled Document",
                publisher=item.get("sitename") or item.get("host") or None,
                source_url=article_url,
                published_at=item.get("published_at"),
                description=item.get("description"),
                content=item.get("text"),  # May be None when full_text=False
                source_type="news",
                provider="free_news_api",
                language=item.get("lang"),
                country=item.get("country"),
                retrieval_timestamp=now_iso,
            )
            normalized.append(normalized_item)

        return normalized

    @staticmethod
    def _extract_error_detail(response: httpx.Response, fallback: str) -> str:
        """Safely extract human-readable error detail without exposing stack traces."""
        try:
            data = response.json()
            if isinstance(data, dict) and "detail" in data:
                detail = data["detail"]
                if isinstance(detail, str):
                    return detail
                if isinstance(detail, list) and detail and isinstance(detail[0], dict):
                    return detail[0].get("msg", fallback)
        except Exception:
            pass
        return fallback
