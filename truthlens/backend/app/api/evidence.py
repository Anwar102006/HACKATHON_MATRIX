import time
import logging
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from app.schemas.evidence import (
    EvidenceSearchRequest,
    EvidenceSearchResponse,
    EvidenceErrorResponse,
)
from app.schemas.comparison import (
    EvidenceCompareRequest,
    EvidenceCompareResponse,
    EvidenceAnalyzeRequest,
    EvidenceAnalyzeResponse,
)
from app.services.evidence_orchestrator import EvidenceOrchestrator
from app.services.claim_decomposer import ClaimDecomposer, DecompositionResult
from app.services.nli_service import NLIService
from app.services.providers.free_news_api import FreeNewsAPIError

logger = logging.getLogger("truthlens.api.evidence")

router = APIRouter(prefix="/evidence", tags=["Evidence Retrieval & Comparison"])
orchestrator = EvidenceOrchestrator()
decomposer = ClaimDecomposer()
nli_service = NLIService.get_instance()


@router.post(
    "/search",
    response_model=EvidenceSearchResponse,
    responses={
        400: {"model": EvidenceErrorResponse, "description": "Invalid search parameters"},
        422: {"model": EvidenceErrorResponse, "description": "Unprocessable parameter range"},
        429: {"model": EvidenceErrorResponse, "description": "Provider rate limit reached"},
        502: {"model": EvidenceErrorResponse, "description": "Upstream provider error"},
        504: {"model": EvidenceErrorResponse, "description": "Provider gateway timeout"},
    },
)
async def search_evidence(request: EvidenceSearchRequest):
    """Retrieve normalized evidence candidates relevant to a claim.

    Queries the Free News API provider through the Evidence Orchestrator.
    Returns candidate articles normalized into standard TruthLens evidence objects.
    """
    start_time = time.time()
    safe_claim = request.claim.strip()[:60] + "..." if len(request.claim.strip()) > 60 else request.claim.strip()
    logger.info("[Evidence] POST /api/evidence/search received claim='%s'", safe_claim)

    if not request.claim or not request.claim.strip():
        logger.warning("[Evidence] Empty claim rejected")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": {
                    "code": "EMPTY_CLAIM",
                    "message": "The claim text cannot be empty or whitespace.",
                }
            },
        )

    try:
        response = await orchestrator.search(request)
        duration_ms = int((time.time() - start_time) * 1000)
        logger.info(
            "[Evidence] response status=200 results=%d duration_ms=%d",
            response.results_count,
            duration_ms,
        )
        return response

    except FreeNewsAPIError as err:
        duration_ms = int((time.time() - start_time) * 1000)
        logger.warning(
            "[Evidence] Provider error status=%d code=%s message='%s' duration_ms=%d",
            err.status_code,
            err.code,
            err.message,
            duration_ms,
        )
        return JSONResponse(
            status_code=err.status_code,
            content={
                "error": {
                    "code": err.code,
                    "message": err.message,
                }
            },
        )

    except Exception as exc:
        duration_ms = int((time.time() - start_time) * 1000)
        logger.exception("[Evidence] Unexpected internal error during evidence retrieval: %s", type(exc).__name__)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_RETRIEVAL_ERROR",
                    "message": "An unexpected error occurred while retrieving evidence. Please try again.",
                }
            },
        )


@router.post(
    "/decompose",
    response_model=DecompositionResult,
    responses={
        400: {"model": EvidenceErrorResponse, "description": "Invalid input parameters"},
    },
)
async def decompose_claim(request: EvidenceSearchRequest):
    """Decompose a claim into atomic verifiable claims and detect language independently.

    Does not trigger retrieval or NLI. Useful for inspection and testing.
    """
    raw_claim = request.claim.strip() if request.claim else ""
    if not raw_claim:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": {
                    "code": "EMPTY_CLAIM",
                    "message": "Claim cannot be empty or whitespace.",
                }
            },
        )
    return decomposer.decompose(raw_claim, jurisdiction=request.jurisdiction)


@router.post(
    "/compare",
    response_model=EvidenceCompareResponse,
    responses={
        400: {"model": EvidenceErrorResponse, "description": "Invalid comparison parameters"},
        500: {"model": EvidenceErrorResponse, "description": "Comparison engine error"},
    },
)
async def compare_evidence(request: EvidenceCompareRequest):
    """Compare atomic claims against supplied evidence candidates using NLI.

    Does NOT fetch arbitrary URLs. Evaluates supplied claims and evidence objects.
    Produces individual pair relationships: ENTAILS, CONTRADICTS, NEUTRAL.
    """
    start_time = time.time()
    logger.info(
        "[Evidence] POST /api/evidence/compare claims=%d evidence=%d",
        len(request.claims),
        len(request.evidence),
    )

    if not request.claims:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": {
                    "code": "EMPTY_CLAIMS_LIST",
                    "message": "At least one atomic claim must be provided for comparison.",
                }
            },
        )

    if not request.evidence:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": {
                    "code": "EMPTY_EVIDENCE_LIST",
                    "message": "At least one evidence item must be provided for comparison.",
                }
            },
        )

    try:
        claims_data = [c.model_dump() for c in request.claims]
        evidence_data = [e.model_dump() for e in request.evidence]

        batch_result = nli_service.compare_batch(claims_data, evidence_data)
        duration_ms = int((time.time() - start_time) * 1000)
        logger.info(
            "[Evidence] Comparison finished: comparisons=%d duration_ms=%d",
            batch_result.total_comparisons,
            duration_ms,
        )

        return EvidenceCompareResponse(
            comparisons=batch_result.comparisons,
            total_comparisons=batch_result.total_comparisons,
            relationship_counts=batch_result.relationship_counts,
            model_name=batch_result.model_name,
            total_duration_ms=batch_result.total_duration_ms,
            truncation_applied=batch_result.truncation_applied,
            limitation_notice=batch_result.limitation_notice,
        )

    except Exception as exc:
        logger.exception("[Evidence] Comparison error: %s", type(exc).__name__)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "NLI_COMPARISON_ERROR",
                    "message": "An error occurred during evidence comparison. Please try again.",
                }
            },
        )


@router.post(
    "/analyze",
    response_model=EvidenceAnalyzeResponse,
    responses={
        400: {"model": EvidenceErrorResponse, "description": "Invalid input parameters"},
        500: {"model": EvidenceErrorResponse, "description": "Analysis pipeline error"},
    },
)
async def analyze_claim_evidence(request: EvidenceAnalyzeRequest):
    """Integrated pipeline endpoint for Phase 4:

    1. Claim Decomposition & Claim Type Detection
    2. Independent Language Detection
    3. Candidate Evidence Retrieval (Free News API)
    4. NLI Claim-Evidence Comparison (cross-encoder)

    CRITICAL HONESTY NOTICE:
    This endpoint returns atomic claims, candidate evidence, and individual
    evidence relationships. It does NOT generate a final TRUE/FALSE truth verdict.
    """
    t_start = time.time()
    raw_claim = request.claim.strip() if request.claim else ""

    if not raw_claim:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": {
                    "code": "EMPTY_CLAIM",
                    "message": "Claim cannot be empty or whitespace.",
                }
            },
        )

    timings: Dict[str, float] = {}

    # 1. Decomposition & Language Detection
    t_decomp_start = time.time()
    decomp = decomposer.decompose(raw_claim, jurisdiction=request.jurisdiction)
    timings["decomposition_ms"] = round((time.time() - t_decomp_start) * 1000, 2)

    logger.info(
        "[Analysis] claim_len=%d detected_lang=%s confidence=%.2f atomic_claims=%d",
        len(raw_claim),
        decomp.detected_language,
        decomp.language_confidence,
        decomp.total_claims,
    )

    # 2. Evidence Retrieval
    t_search_start = time.time()
    search_req = EvidenceSearchRequest(
        claim=raw_claim,
        jurisdiction=request.jurisdiction,
        size=request.max_results or 5,
    )

    retrieved_evidence = []
    try:
        search_res = await orchestrator.search(search_req)
        retrieved_evidence = search_res.results
    except Exception as search_err:
        logger.warning("[Analysis] Evidence retrieval returned error/zero: %s", search_err)
        retrieved_evidence = []
    timings["retrieval_ms"] = round((time.time() - t_search_start) * 1000, 2)

    # 3. NLI Comparison
    t_nli_start = time.time()
    claims_payload = [
        {
            "id": c.id,
            "text": c.text,
            "language": c.language,
            "is_verifiable": c.is_verifiable,
        }
        for c in decomp.claims
    ]

    evidence_payload = [e.model_dump() for e in retrieved_evidence]

    if claims_payload and evidence_payload:
        batch_res = nli_service.compare_batch(claims_payload, evidence_payload)
        relationships = batch_res.comparisons
        relationship_counts = batch_res.relationship_counts
    else:
        relationships = []
        relationship_counts = {"ENTAILS": 0, "CONTRADICTS": 0, "NEUTRAL": 0, "UNSUPPORTED_LANGUAGE": 0, "ERROR": 0}

    timings["nli_comparison_ms"] = round((time.time() - t_nli_start) * 1000, 2)
    timings["total_ms"] = round((time.time() - t_start) * 1000, 2)

    limitation_notice = (
        "TruthLens currently compares claims with retrieved evidence using a pretrained NLI model. "
        "These relationships are model predictions of premise-hypothesis consistency, NOT final determinations "
        "of objective truth. Source authority and evidence fusion are evaluated in later stages."
    )

    return EvidenceAnalyzeResponse(
        original_claim=raw_claim,
        detected_language=decomp.detected_language,
        language_confidence=decomp.language_confidence,
        jurisdiction=request.jurisdiction,
        atomic_claims=decomp.claims,
        total_atomic_claims=decomp.total_claims,
        is_opinion_only=decomp.is_opinion_only,
        evidence=retrieved_evidence,
        total_evidence_retrieved=len(retrieved_evidence),
        relationships=relationships,
        total_relationships=len(relationships),
        relationship_counts=relationship_counts,
        nli_model=nli_service.MODEL_NAME,
        limitation_notice=limitation_notice,
        timings_ms=timings,
    )

