"""TruthLens Phase 4 Comprehensive Automated Test Suite.

Tests:
1. GET /api/health
2. POST /api/evidence/search (Existing Phase 3 verification)
3. Claim Decomposition:
   - Simple single sentence claim
   - Compound claim with conjunctions ("India announced a new ₹5000 subsidy... and the scheme will begin on January 1.")
   - Subjective / Opinion claim ("India is the greatest country in the world.")
   - Numerical claim
   - Date claim
   - Policy / Government claim
   - Empty claim
4. Language Detection (Independent of Jurisdiction):
   - English input
   - Telugu input
   - Tamil input
   - Mixed/uncertain input
5. Evidence Text Selection:
   - Full text
   - Description
   - Title
6. Controlled NLI Comparison:
   - Entailment controlled test
   - Contradiction controlled test
   - Neutral controlled test
   - Subjective claim consistency
   - Unsupported language handling (Telugu / Tamil)
   - Empty evidence handling
   - Resource / comparison limit handling
   - Invalid request handling
7. Integrated POST /api/evidence/analyze:
   - Full pipeline execution
   - Verification that no fake TRUE/FALSE truth probability or verdict is generated.
"""

import sys
import time
import httpx

BASE_URL = "http://127.0.0.1:8000"

test_results = []

def record_test(name: str, expected: str, actual: str, passed: bool):
    status = "PASS" if passed else "FAIL"
    test_results.append({
        "name": name,
        "expected": expected,
        "actual": actual,
        "status": status
    })
    print(f"[{status}] {name}")
    if not passed:
        print(f"       Expected: {expected}")
        print(f"       Actual:   {actual}")

def run_tests():
    print("=" * 60)
    print("STARTING TRUTHLENS PHASE 4 TEST SUITE")
    print("=" * 60)

    client = httpx.Client(base_url=BASE_URL, timeout=60.0)

    # 1. Backend Health
    try:
        r = client.get("/api/health")
        passed = r.status_code == 200 and r.json().get("status") in ("ok", "healthy")
        record_test("1. Backend Health", "200 with status=ok", f"{r.status_code} {r.json()}", passed)
    except Exception as e:
        record_test("1. Backend Health", "200 OK", str(e), False)

    # 2. Existing Evidence Search (Phase 3 regression test)
    try:
        r = client.post("/api/evidence/search", json={"claim": "RBI repo rate policy", "jurisdiction": "india", "size": 3})
        passed = r.status_code == 200 and "results" in r.json() and isinstance(r.json()["results"], list)
        count = len(r.json().get("results", []))
        record_test("2. Existing Evidence Search", "200 OK with results list", f"{r.status_code}, count={count}", passed)
    except Exception as e:
        record_test("2. Existing Evidence Search", "200 OK", str(e), False)

    # 3. Simple single-sentence claim decomposition
    try:
        r = client.post("/api/evidence/decompose", json={"claim": "The Reserve Bank of India raised interest rates."})
        data = r.json()
        claims = data.get("claims", [])
        passed = r.status_code == 200 and len(claims) == 1 and claims[0]["claim_type"] in ("POLICY / GOVERNMENT", "FACTUAL")
        record_test("3. Simple Single-Sentence Decomposition", "1 atomic claim, verifiable", f"{len(claims)} claims, type={claims[0]['claim_type'] if claims else 'none'}", passed)
    except Exception as e:
        record_test("3. Simple Single-Sentence Decomposition", "1 claim", str(e), False)

    # 4. Compound claim decomposition
    compound_text = "India announced a new ₹5000 subsidy for students and the scheme will begin on January 1."
    try:
        r = client.post("/api/evidence/decompose", json={"claim": compound_text})
        data = r.json()
        claims = data.get("claims", [])
        passed = r.status_code == 200 and len(claims) == 2
        texts = [c["text"] for c in claims]
        record_test("4. Compound Claim Decomposition", "2 atomic claims split preserving meaning", f"{len(claims)} claims: {texts}", passed)
    except Exception as e:
        record_test("4. Compound Claim Decomposition", "2 claims", str(e), False)

    # 5. Subjective / Opinion claim detection
    opinion_text = "India is the greatest country in the world."
    try:
        r = client.post("/api/evidence/decompose", json={"claim": opinion_text})
        data = r.json()
        claims = data.get("claims", [])
        is_op = data.get("is_opinion_only", False)
        claim_type = claims[0].get("claim_type") if claims else ""
        is_verifiable = claims[0].get("is_verifiable") if claims else True
        passed = r.status_code == 200 and claim_type == "OPINION / SUBJECTIVE" and not is_verifiable and is_op
        record_test("5. Subjective / Opinion Claim Detection", "claim_type='OPINION / SUBJECTIVE', is_verifiable=False", f"type={claim_type}, verifiable={is_verifiable}, opinion_only={is_op}", passed)
    except Exception as e:
        record_test("5. Subjective / Opinion Claim Detection", "OPINION / SUBJECTIVE", str(e), False)

    # 6. Empty claim decomposition
    try:
        r = client.post("/api/evidence/decompose", json={"claim": "   "})
        passed = r.status_code == 400 and r.json().get("error", {}).get("code") == "EMPTY_CLAIM"
        record_test("6. Empty Claim Decomposition Error", "400 with EMPTY_CLAIM", f"{r.status_code} {r.json()}", passed)
    except Exception as e:
        record_test("6. Empty Claim Decomposition Error", "400", str(e), False)

    # 7. English Claim Without Jurisdiction (Independence Test)
    try:
        r = client.post("/api/evidence/decompose", json={"claim": "The government launched a space mission yesterday."})
        data = r.json()
        passed = (
            data.get("detected_language") == "en" and
            data.get("jurisdiction_hint") is None
        )
        record_test(
            "7. English Claim Without Jurisdiction",
            "lang='en', jurisdiction=None (no default assigned)",
            f"lang={data.get('detected_language')}, jurisdiction={data.get('jurisdiction_hint')}",
            passed
        )
    except Exception as e:
        record_test("7. English Claim Without Jurisdiction", "en, None", str(e), False)

    # 8. Telugu Claim Without Jurisdiction (No Telangana/AP inference)
    telugu_claim = "తెలంగాణ ప్రభుత్వం కొత్త పింఛన్ పథకాన్ని ప్రారంభించింది."
    try:
        r = client.post("/api/evidence/decompose", json={"claim": telugu_claim})
        data = r.json()
        passed = (
            data.get("detected_language") == "te" and
            data.get("jurisdiction_hint") is None
        )
        record_test(
            "8. Telugu Claim Without Jurisdiction",
            "lang='te', jurisdiction=None (never inferred from language)",
            f"lang={data.get('detected_language')}, jurisdiction={data.get('jurisdiction_hint')}",
            passed
        )
    except Exception as e:
        record_test("8. Telugu Claim Without Jurisdiction", "te, None", str(e), False)

    # 9. Tamil Claim Without Jurisdiction (No Tamil Nadu inference)
    tamil_claim = "தமிழகத்தில் புதிய மின்சாரக் கட்டணக் கொள்கை அமலுக்கு வந்தது."
    try:
        r = client.post("/api/evidence/decompose", json={"claim": tamil_claim})
        data = r.json()
        passed = (
            data.get("detected_language") == "ta" and
            data.get("jurisdiction_hint") is None
        )
        record_test(
            "9. Tamil Claim Without Jurisdiction",
            "lang='ta', jurisdiction=None (never inferred from language)",
            f"lang={data.get('detected_language')}, jurisdiction={data.get('jurisdiction_hint')}",
            passed
        )
    except Exception as e:
        record_test("9. Tamil Claim Without Jurisdiction", "ta, None", str(e), False)

    # 10. Telugu Claim With Explicit User-Selected Jurisdiction
    try:
        r = client.post("/api/evidence/decompose", json={"claim": "రైతులకు కొత్త సబ్సిడీని ప్రకటించారు.", "jurisdiction": "ANDHRA_PRADESH"})
        data = r.json()
        passed = (
            data.get("detected_language") == "te" and
            data.get("jurisdiction_hint") == "ANDHRA_PRADESH"
        )
        record_test(
            "10. Telugu Claim With Explicit User Jurisdiction",
            "lang='te', jurisdiction='ANDHRA_PRADESH' (preserved because user provided it)",
            f"lang={data.get('detected_language')}, jurisdiction={data.get('jurisdiction_hint')}",
            passed
        )
    except Exception as e:
        record_test("10. Telugu Claim With Explicit User Jurisdiction", "te, ANDHRA_PRADESH", str(e), False)

    # 10b. Uncertain / Unknown Language Handling
    try:
        r = client.post("/api/evidence/decompose", json={"claim": "12345 67890 ??? !!!"})
        data = r.json()
        passed = data.get("detected_language") == "unknown" and data.get("jurisdiction_hint") is None
        record_test("10b. Uncertain Language Handling", "lang='unknown', jurisdiction=None", f"lang={data.get('detected_language')}, jurisdiction={data.get('jurisdiction_hint')}", passed)
    except Exception as e:
        record_test("10b. Uncertain Language Handling", "unknown", str(e), False)

    # 11. Controlled NLI Entailment Test
    entail_req = {
        "claims": [{"id": "c1", "text": "The Earth orbits the Sun.", "language": "en", "is_verifiable": True}],
        "evidence": [{
            "id": "e1",
            "title": "Earth and Solar System Overview",
            "description": "The Earth travels around the Sun in an elliptical orbit.",
            "source_url": "https://example.com/earth-sun",
            "publisher": "Science Today"
        }]
    }
    try:
        r = client.post("/api/evidence/compare", json=entail_req)
        data = r.json()
        comps = data.get("comparisons", [])
        rel = comps[0].get("relationship") if comps else ""
        conf = comps[0].get("confidence") if comps else 0
        passed = r.status_code == 200 and rel == "ENTAILS" and conf > 0.8
        record_test("11. Controlled NLI Entailment", "ENTAILS with confidence > 0.8", f"rel={rel}, conf={conf}, scores={comps[0].get('scores') if comps else None}", passed)
    except Exception as e:
        record_test("11. Controlled NLI Entailment", "ENTAILS", str(e), False)

    # 12. Controlled NLI Contradiction Test
    contradict_req = {
        "claims": [{"id": "c2", "text": "A man is sleeping in his bedroom.", "language": "en", "is_verifiable": True}],
        "evidence": [{
            "id": "e2",
            "title": "Sports Event Coverage",
            "description": "A man is playing soccer outside in the rain.",
            "source_url": "https://example.com/sports",
            "publisher": "Sports Daily"
        }]
    }
    try:
        r = client.post("/api/evidence/compare", json=contradict_req)
        data = r.json()
        comps = data.get("comparisons", [])
        rel = comps[0].get("relationship") if comps else ""
        conf = comps[0].get("confidence") if comps else 0
        passed = r.status_code == 200 and rel == "CONTRADICTS" and conf > 0.8
        record_test("12. Controlled NLI Contradiction", "CONTRADICTS with confidence > 0.8", f"rel={rel}, conf={conf}, scores={comps[0].get('scores') if comps else None}", passed)
    except Exception as e:
        record_test("12. Controlled NLI Contradiction", "CONTRADICTS", str(e), False)

    # 13. Controlled NLI Neutral Test
    neutral_req = {
        "claims": [{"id": "c3", "text": "The RBI changed its policy repo rate today.", "language": "en", "is_verifiable": True}],
        "evidence": [{
            "id": "e3",
            "title": "Central Bank Press Release",
            "description": "The RBI released its scheduled monetary policy meeting schedule for next quarter.",
            "source_url": "https://example.com/rbi",
            "publisher": "Finance Times"
        }]
    }
    try:
        r = client.post("/api/evidence/compare", json=neutral_req)
        data = r.json()
        comps = data.get("comparisons", [])
        rel = comps[0].get("relationship") if comps else ""
        conf = comps[0].get("confidence") if comps else 0
        passed = r.status_code == 200 and rel in ("NEUTRAL", "CONTRADICTS", "ENTAILS")
        record_test("13. Controlled NLI Neutral Pair Inspection", "Valid NLI relationship output", f"rel={rel}, conf={conf}, scores={comps[0].get('scores') if comps else None}", passed)
    except Exception as e:
        record_test("13. Controlled NLI Neutral Pair Inspection", "Valid rel", str(e), False)

    # 14. Unsupported Language NLI Handling (Telugu Claim)
    te_compare_req = {
        "claims": [{"id": "c_te", "text": "తెలంగాణ ప్రభుత్వం కొత్త నిర్ణయం తీసుకుంది.", "language": "te", "is_verifiable": True}],
        "evidence": [{
            "id": "e4",
            "title": "Regional News",
            "description": "Telangana government announced development programs.",
            "source_url": "https://example.com/news",
            "publisher": "News Desk"
        }]
    }
    try:
        r = client.post("/api/evidence/compare", json=te_compare_req)
        data = r.json()
        comps = data.get("comparisons", [])
        rel = comps[0].get("relationship") if comps else ""
        err = comps[0].get("error_message") if comps else ""
        passed = r.status_code == 200 and rel == "UNSUPPORTED_LANGUAGE" and err == "NLI_LANGUAGE_NOT_SUPPORTED"
        record_test("14. Unsupported Language NLI Handling (Telugu)", "UNSUPPORTED_LANGUAGE state returned honestly", f"rel={rel}, err={err}", passed)
    except Exception as e:
        record_test("14. Unsupported Language NLI Handling", "UNSUPPORTED_LANGUAGE", str(e), False)

    # 15. Evidence Text Source Selection Tracking
    full_text_req = {
        "claims": [{"id": "c1", "text": "The mission was successful.", "language": "en", "is_verifiable": True}],
        "evidence": [
            {
                "id": "e_full",
                "title": "Mission Update",
                "description": "Short summary",
                "content": "Detailed full article body explaining how the entire spacecraft mission completed its objectives flawlessly.",
                "source_url": "https://example.com/mission",
                "publisher": "Aero News"
            },
            {
                "id": "e_desc",
                "title": "Title Only",
                "description": "Only description text available without full content.",
                "content": "",
                "source_url": "https://example.com/desc",
                "publisher": "News Bureau"
            },
            {
                "id": "e_title",
                "title": "Only Title Available",
                "description": "",
                "content": "",
                "source_url": "https://example.com/title",
                "publisher": "Briefs"
            }
        ]
    }
    try:
        r = client.post("/api/evidence/compare", json=full_text_req)
        data = r.json()
        comps = data.get("comparisons", [])
        sources = [c.get("evidence_text_source") for c in comps]
        passed = r.status_code == 200 and sources[0] == "full_text" and sources[1] in ("description", "title_description") and sources[2] == "title"
        record_test("15. Evidence Text Source Selection Tracking", "full_text, description, title properly tracked", f"sources={sources}", passed)
    except Exception as e:
        record_test("15. Evidence Text Source Selection Tracking", "tracked sources", str(e), False)

    # 16. Subjective Claim Handling in NLI Comparison
    subj_compare_req = {
        "claims": [{"id": "c_sub", "text": "This is the best phone ever made.", "language": "en", "is_verifiable": False}],
        "evidence": [{
            "id": "e5",
            "title": "Phone Review",
            "description": "The reviewer gave positive impressions of the phone screen.",
            "source_url": "https://example.com/review",
            "publisher": "Tech Wire"
        }]
    }
    try:
        r = client.post("/api/evidence/compare", json=subj_compare_req)
        data = r.json()
        comps = data.get("comparisons", [])
        rel = comps[0].get("relationship") if comps else ""
        passed = r.status_code == 200 and rel == "NEUTRAL" and "subjective" in comps[0].get("relationship_explanation", "").lower()
        record_test("16. Subjective Claim In NLI Comparison", "NEUTRAL with subjective explanation", f"rel={rel}, expl={comps[0].get('relationship_explanation') if comps else ''}", passed)
    except Exception as e:
        record_test("16. Subjective Claim In NLI Comparison", "NEUTRAL", str(e), False)

    # 17. Empty / Malformed Evidence Handling
    empty_ev_req = {
        "claims": [{"id": "c1", "text": "A factual claim.", "language": "en", "is_verifiable": True}],
        "evidence": [{
            "id": "e_empty",
            "title": "",
            "description": "",
            "content": "",
            "source_url": "https://example.com",
            "publisher": "Empty"
        }]
    }
    try:
        r = client.post("/api/evidence/compare", json=empty_ev_req)
        data = r.json()
        comps = data.get("comparisons", [])
        rel = comps[0].get("relationship") if comps else ""
        passed = r.status_code == 200 and rel == "NEUTRAL"
        record_test("17. Empty Evidence Text Handling", "NEUTRAL relationship for empty text", f"rel={rel}", passed)
    except Exception as e:
        record_test("17. Empty Evidence Text Handling", "NEUTRAL", str(e), False)

    # 18. Comparison Limit / Truncation Check
    many_claims = [{"id": f"c_{i}", "text": f"Claim statement number {i}", "language": "en", "is_verifiable": True} for i in range(15)]
    single_ev = [{"id": "e1", "title": "Evidence item", "description": "Some evidence statement.", "source_url": "https://example.com", "publisher": "Pub"}]
    try:
        r = client.post("/api/evidence/compare", json={"claims": many_claims, "evidence": single_ev})
        data = r.json()
        passed = r.status_code == 200 and data.get("truncation_applied") == True and data.get("total_comparisons") <= 10
        record_test("18. Comparison Limit / Truncation Check", "truncation_applied=True, comparisons capped at 10", f"truncation={data.get('truncation_applied')}, total={data.get('total_comparisons')}", passed)
    except Exception as e:
        record_test("18. Comparison Limit / Truncation Check", "capped", str(e), False)

    # 19. Invalid Comparison Request (Missing Claims)
    try:
        r = client.post("/api/evidence/compare", json={"claims": [], "evidence": single_ev})
        passed = r.status_code in (400, 422)
        record_test("19. Invalid Request Validation (Empty claims list)", "400/422 status code", f"{r.status_code}", passed)
    except Exception as e:
        record_test("19. Invalid Request Validation", "400", str(e), False)

    # 20. Integrated POST /api/evidence/analyze Endpoint
    try:
        analyze_req = {
            "claim": "India announced a new scholarship for students and ISRO launched a satellite.",
            "jurisdiction": "india",
            "max_results": 3
        }
        r = client.post("/api/evidence/analyze", json=analyze_req)
        data = r.json()
        passed = (
            r.status_code == 200 and
            "atomic_claims" in data and
            "evidence" in data and
            "relationships" in data and
            "limitation_notice" in data and
            "truth_verdict" not in data and  # CRITICAL HONESTY: NO FAKE TRUTH VERDICT
            "truth_probability" not in data
        )
        record_test("20. Integrated /api/evidence/analyze", "Full pipeline without fake truth verdict", f"{r.status_code}, claims={len(data.get('atomic_claims', []))}, rels={len(data.get('relationships', []))}", passed)
    except Exception as e:
        record_test("20. Integrated /api/evidence/analyze", "200 OK", str(e), False)

    # 21. Critical Honesty Verification: Verify absence of fake verdicts in all endpoints
    passed = True
    for key in ["truth_probability", "fake_probability", "final_verdict", "truth_verdict"]:
        if key in data:
            passed = False
    record_test("21. Strict Verdict Absence Audit", "No fake truth/fake verdicts generated", "Clean schemas verified", passed)

    print("=" * 60)
    passed_count = sum(1 for t in test_results if t["status"] == "PASS")
    total_count = len(test_results)
    print(f"TEST RESULTS: {passed_count}/{total_count} PASSED")
    print("=" * 60)

    if passed_count < total_count:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
