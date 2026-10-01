# TruthLens: Evidence-Based Misinformation Verification Platform

TruthLens is an evidence-first misinformation and news verification engine designed to combat digital falsehoods, misleading viral claims, and inaccurate headlines by routing assertions directly against official public records, government gazettes, and authoritative reporting repositories.

> **Visual & Architectural Principle:**  
> *"Evidence first, explanation second."*

---

## Current Status: Phase 4 (Claim Decomposition + Evidence Comparison — NLI Foundation)

This repository has completed **Phase 4 (Claim Decomposition + Evidence Comparison)**.  
The platform now features an operational Natural Language Inference (NLI) comparison layer that decomposes user submissions into atomic claims and evaluates them pairwise against retrieved news candidates.

### CRITICAL HONESTY RULE
> **NLI confidence is model confidence for an evidence relationship, not a probability that a claim is true.**
>
> TruthLens strictly does NOT compute a "truth probability" (e.g. "87% true") or render final `TRUE` / `FALSE` / `FAKE` / `REAL` verdicts.  
> An `ENTAILS` prediction means the cited evidence text logically entails the claim statement. It does NOT prove the claim is objectively true. Complete truth determination belongs to subsequent stages involving source authority, multi-source evidence fusion, and official record verification.

### What is IMPLEMENTED in Phase 4:
- [x] **Claim Decomposition Service** (`claim_decomposer.py`):
  - Breaks compound statements into atomic, independently verifiable claims while preserving original meaning.
  - Detects claim types: `FACTUAL`, `NUMERICAL`, `DATE`, `LOCATION`, `POLICY / GOVERNMENT`, `PERSON / ORGANIZATION`, `EVENT`, `OPINION / SUBJECTIVE`, `UNKNOWN`.
  - Flags subjective / opinion statements (`is_verifiable = False`) so they are not sent through factual NLI as objective facts.
- [x] **Independent Language Detection**:
  - Detects English (`en`), Telugu (`te`), and Tamil (`ta`) independently of jurisdiction.
  - Avoids assuming language equates to jurisdiction.
- [x] **Honest Multilingual Strategy**:
  - Selected NLI model (`cross-encoder/nli-distilroberta-base`) is trained on English benchmarks.
  - Non-English submissions (Telugu, Tamil) return an honest `UNSUPPORTED_LANGUAGE` state without fabricating unverified inferences or synthetic translations.
- [x] **Pretrained NLI Cross-Encoder Service** (`nli_service.py`):
  - Model: `cross-encoder/nli-distilroberta-base` (Hugging Face / Apache 2.0).
  - Pre-warmed singleton in FastAPI lifespan to prevent per-request reloading.
  - Verified label mapping: `0: contradiction` &rarr; `CONTRADICTS`, `1: entailment` &rarr; `ENTAILS`, `2: neutral` &rarr; `NEUTRAL`.
  - Outputs normalized model confidence scores for `entails`, `contradicts`, and `neutral`.
- [x] **Evidence Text Source Tracking**:
  - Explicitly determines and tracks what text was analyzed: `full_text`, `description`, `title_description`, or `title`. Never claims an article was verified when only its headline or summary was inspected.
- [x] **Dedicated & Integrated Endpoints**:
  - `POST /api/evidence/compare`: Pairwise claim-to-evidence comparison.
  - `POST /api/evidence/decompose`: Standalone claim decomposition inspection.
  - `POST /api/evidence/analyze`: Integrated Phase 4 pipeline (decomposition + retrieval + NLI comparison).
  - `POST /api/evidence/search`: Phase 3 evidence search preserved and backwards-compatible.
- [x] **Interactive Evidence Matrix UI** (`ResultsPage.jsx`):
  - Decomposed atomic claims card with type badges and verifiability indicators.
  - Claim-to-evidence relationship matrix showing: Atomic Claim | Source | Relationship | NLI Model Confidence | Evidence Text Used | What It Establishes.
  - Filtering by claim ID and relationship type.
  - Expandable full probability distribution for each pair.
  - Mandatory Honest Modeling Disclosure notice displayed prominently.
- [x] **Resource & Performance Limits**:
  - Limits execution to maximum 10 atomic claims and maximum 10 evidence items per claim to prevent combinatorial explosion.

### What is NOT Implemented Yet (Planned Future Modules):
- [ ] **Final Truth Verdict Engine**: No `TRUE`, `FALSE`, or `truth_probability` calculations.
- [ ] **Multi-Source Evidence Fusion**: Cross-source authority weighting and contradiction arbitration.
- [ ] **ClaimReview Ingestion (Google Fact Check / IFCN)**: Fact-checker metadata schema lookup.
- [ ] **OCR Engine (EasyOCR)**: Image and WhatsApp screenshot extraction.
- [ ] **Database Persistence (SQLite / ORM)**: Historical claims caching and persistence.

---

## NLI Model Architecture & Specifications

| Attribute | Specification |
|---|---|
| **Model Name** | `cross-encoder/nli-distilroberta-base` |
| **Model Source** | [Hugging Face Hub](https://huggingface.co/cross-encoder/nli-distilroberta-base) |
| **License** | Apache 2.0 |
| **Architecture** | DistilRoBERTa cross-encoder for sequence classification |
| **Model Size** | ~328 MB (`model.safetensors`) |
| **Input Format** | `(premise=evidence_text, hypothesis=atomic_claim)` |
| **Raw Model Labels** | `0: contradiction`, `1: entailment`, `2: neutral` |
| **TruthLens Normalized Labels** | `CONTRADICTS`, `ENTAILS`, `NEUTRAL` |
| **Language Coverage** | English (MNLI & SNLI trained). Telugu & Tamil return `UNSUPPORTED_LANGUAGE`. |
| **Inference Time** | ~30ms to 60ms per pair on CPU |

---

## API Endpoints

### 1. `POST /api/evidence/compare`
Compares pre-retrieved evidence items with atomic claims.
- **Request Body**:
  ```json
  {
    "claims": [
      { "id": "claim_1", "text": "The Earth orbits the Sun.", "language": "en", "is_verifiable": true }
    ],
    "evidence": [
      {
        "id": "ev_1",
        "title": "Solar System",
        "description": "The Earth travels around the Sun.",
        "source_url": "https://example.com",
        "publisher": "Science Daily"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "comparisons": [
      {
        "claim_id": "claim_1",
        "claim_text": "The Earth orbits the Sun.",
        "evidence_id": "ev_1",
        "evidence_title": "Solar System",
        "evidence_publisher": "Science Daily",
        "relationship": "ENTAILS",
        "confidence": 0.9796,
        "scores": { "entails": 0.9796, "contradicts": 0.0064, "neutral": 0.014 },
        "evidence_text_source": "description",
        "relationship_explanation": "Evidence text is logically consistent with this claim."
      }
    ],
    "total_comparisons": 1,
    "relationship_counts": { "ENTAILS": 1, "CONTRADICTS": 0, "NEUTRAL": 0 },
    "model_name": "cross-encoder/nli-distilroberta-base",
    "truncation_applied": false
  }
  ```

### 2. `POST /api/evidence/analyze`
Integrated pipeline executing decomposition, candidate retrieval, and NLI comparison.
- **Request Body**:
  ```json
  {
    "claim": "India announced a new subsidy for students and ISRO launched a rocket.",
    "jurisdiction": "india",
    "max_results": 5
  }
  ```

### 3. `POST /api/evidence/decompose`
Decomposes complex sentences into atomic claims without running NLI.

### 4. `POST /api/evidence/search`
Phase 3 evidence retrieval endpoint (preserved and backwards-compatible).

---

## Testing & Verification

### Running Automated Test Suite
From `truthlens/backend`:
```powershell
.\.venv\Scripts\python.exe test_phase4.py
```

Expected output:
```
============================================================
STARTING TRUTHLENS PHASE 4 TEST SUITE
============================================================
[PASS] 1. Backend Health
[PASS] 2. Existing Evidence Search
[PASS] 3. Simple Single-Sentence Decomposition
[PASS] 4. Compound Claim Decomposition
[PASS] 5. Subjective / Opinion Claim Detection
[PASS] 6. Empty Claim Decomposition Error
[PASS] 7. English Language Detection
[PASS] 8. Telugu Language Detection (Independent of Jurisdiction)
[PASS] 9. Tamil Language Detection (Independent of Jurisdiction)
[PASS] 10. Uncertain Language Handling
[PASS] 11. Controlled NLI Entailment
[PASS] 12. Controlled NLI Contradiction
[PASS] 13. Controlled NLI Neutral Pair Inspection
[PASS] 14. Unsupported Language NLI Handling (Telugu)
[PASS] 15. Evidence Text Source Selection Tracking
[PASS] 16. Subjective Claim In NLI Comparison
[PASS] 17. Empty Evidence Text Handling
[PASS] 18. Comparison Limit / Truncation Check
[PASS] 19. Invalid Request Validation (Empty claims list)
[PASS] 20. Integrated /api/evidence/analyze
[PASS] 21. Strict Verdict Absence Audit
============================================================
TEST RESULTS: 21/21 PASSED
============================================================
```

### Running Frontend Production Build
From `truthlens/frontend`:
```powershell
npm.cmd run build
```

---

## Roadmap

| Phase | Focus | Status |
|---|---|---|
| **Phase 1** | Foundation: FastAPI + React + Vite + Tailwind + Health check | **Completed** |
| **Phase 2** | Frontend Verification Experience: Form, URL validation, EvidenceCard, Results Shell | **Completed** |
| **Phase 3** | Evidence Retrieval Foundation: Free News API Provider, Orchestrator, Normalization | **Completed** |
| **Phase 4** | Claim Decomposition + Evidence Comparison: NLI Foundation, Atomic Matrix | **Completed** |
| **Phase 5** | Persistence & Audit: SQLite claims database, historical tracking | Next |

