import React, { useState } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  ArrowLeft, 
  ShieldAlert, 
  FileText, 
  ExternalLink, 
  MapPin, 
  Globe, 
  Layers, 
  Search, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Compass,
  FileCheck,
  RotateCcw,
  Loader2,
  Info,
  CheckCircle2,
  Filter,
  Cpu,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import EvidenceCard from '../components/EvidenceCard';
import { analyzeClaimEvidence } from '../services/api';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve submitted payload from navigation state
  const submission = location.state || null;

  // Submitted claim metadata
  const headline = submission?.headline || null;
  const newsText = submission?.newsText || '';
  const newsUrl = submission?.newsUrl || '';
  const jurisdiction = submission?.jurisdiction || 'Central Government / India';
  const language = submission?.language || 'English';
  const submittedAt = submission?.submittedAt 
    ? new Date(submission.submittedAt).toLocaleString() 
    : null;

  // Phase 4 Decomposed claims & NLI relationships state
  const [atomicClaims, setAtomicClaims] = useState(submission?.atomicClaims || []);
  const [relationships, setRelationships] = useState(submission?.relationships || []);
  const [relationshipCounts, setRelationshipCounts] = useState(submission?.relationshipCounts || {});
  const [detectedLanguage, setDetectedLanguage] = useState(submission?.detectedLanguage || 'en');
  const [languageConfidence, setLanguageConfidence] = useState(submission?.languageConfidence || 0);
  const [isOpinionOnly, setIsOpinionOnly] = useState(submission?.isOpinionOnly || false);
  const [nliModel, setNliModel] = useState(submission?.nliModel || 'cross-encoder/nli-distilroberta-base');
  const [timingsMs, setTimingsMs] = useState(submission?.timingsMs || {});

  // Evidence state
  const [evidenceItems, setEvidenceItems] = useState(submission?.evidenceResults || []);
  const [evidenceTotal, setEvidenceTotal] = useState(submission?.evidenceTotal || 0);
  const [evidenceCount, setEvidenceCount] = useState(submission?.evidenceCount || submission?.evidenceResults?.length || 0);
  const [evidenceError, setEvidenceError] = useState(submission?.evidenceError || null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter state for Evidence Matrix
  const [selectedClaimFilter, setSelectedClaimFilter] = useState('ALL');
  const [selectedRelFilter, setSelectedRelFilter] = useState('ALL');
  const [expandedPairId, setExpandedPairId] = useState(null);

  // Authoritative sources mapped by jurisdiction
  const jurisdictionSourcesMap = {
    'Central Government / India': [
      { name: 'Press Information Bureau (PIB)', url: 'https://pib.gov.in', type: 'Official Bureau' },
      { name: 'The Gazette of India', url: 'https://egazette.gov.in', type: 'Official Gazette' },
      { name: 'National Portal of India', url: 'https://india.gov.in', type: 'Central Portal' },
    ],
    'Andhra Pradesh': [
      { name: 'Information & Public Relations (GoAP)', url: 'https://ipr.ap.gov.in', type: 'State Bureau' },
      { name: 'Government of Andhra Pradesh Portal', url: 'https://ap.gov.in', type: 'State Portal' },
    ],
    'Telangana': [
      { name: 'Digital Media Wing (GoTS)', url: 'https://digitalmedia.telangana.gov.in', type: 'State Bureau' },
      { name: 'Government of Telangana Portal', url: 'https://telangana.gov.in', type: 'State Portal' },
    ],
    'Tamil Nadu': [
      { name: 'DIPR Tamil Nadu', url: 'https://dipr.tn.gov.in', type: 'State Bureau' },
      { name: 'Government of Tamil Nadu Portal', url: 'https://tn.gov.in', type: 'State Portal' },
    ],
    'Andaman & Nicobar Islands': [
      { name: 'Andaman & Nicobar Administration', url: 'https://andaman.gov.in', type: 'UT Portal' },
    ],
    'Jammu & Kashmir': [
      { name: 'DIPR Jammu & Kashmir', url: 'https://dipr.jk.gov.in', type: 'UT Bureau' },
    ],
  };

  const relevantSources = jurisdictionSourcesMap[jurisdiction] || jurisdictionSourcesMap['Central Government / India'];

  // Re-run Phase 4 pipeline on demand
  const handleRefreshAnalysis = async () => {
    if (!headline || isRefreshing) return;
    setIsRefreshing(true);
    setEvidenceError(null);

    const result = await analyzeClaimEvidence({
      claim: headline,
      jurisdiction,
      max_results: 5,
    });

    setIsRefreshing(false);
    if (result.success) {
      setAtomicClaims(result.data.atomic_claims || []);
      setEvidenceItems(result.data.evidence || []);
      setEvidenceTotal(result.data.total_evidence_retrieved || 0);
      setEvidenceCount(result.data.total_evidence_retrieved || 0);
      setRelationships(result.data.relationships || []);
      setRelationshipCounts(result.data.relationship_counts || {});
      setDetectedLanguage(result.data.detected_language);
      setLanguageConfidence(result.data.language_confidence);
      setIsOpinionOnly(result.data.is_opinion_only);
      setNliModel(result.data.nli_model);
      setTimingsMs(result.data.timings_ms || {});
      setEvidenceError(null);
    } else {
      setEvidenceError(result.error);
    }
  };

  // Filtered relationships for matrix
  const filteredRelationships = relationships.filter(rel => {
    const claimMatches = selectedClaimFilter === 'ALL' || rel.claim_id === selectedClaimFilter;
    const relMatches = selectedRelFilter === 'ALL' || rel.relationship === selectedRelFilter;
    return claimMatches && relMatches;
  });

  // Empty state: accessed directly without submission
  if (!headline) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 sm:p-12 text-center space-y-5 shadow-xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400">
            <Activity className="w-6 h-6" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-xl font-bold text-white">
              No Claim Submitted for Verification
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Results Presentation Shell displays structured evidence citations and NLI inferences once a claim is submitted through the verification console.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => navigate('/#verify-workspace')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Go to Verification Console</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Relationship visual styling helpers
  const getRelationshipBadge = (rel) => {
    switch (rel) {
      case 'ENTAILS':
        return {
          bg: 'bg-emerald-950/70 text-emerald-300 border-emerald-800',
          dot: 'bg-emerald-400',
          label: 'ENTAILS',
          desc: 'Evidence is consistent with this claim.',
          icon: CheckCircle2,
        };
      case 'CONTRADICTS':
        return {
          bg: 'bg-rose-950/70 text-rose-300 border-rose-800',
          dot: 'bg-rose-400',
          label: 'CONTRADICTS',
          desc: 'Evidence conflicts with this claim.',
          icon: AlertCircle,
        };
      case 'UNSUPPORTED_LANGUAGE':
        return {
          bg: 'bg-purple-950/70 text-purple-300 border-purple-800',
          dot: 'bg-purple-400',
          label: 'LANG NOT SUPPORTED',
          desc: 'NLI model is English-only. Language preserved without unverified scores.',
          icon: Globe,
        };
      case 'NEUTRAL':
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
          label: 'NEUTRAL',
          desc: 'Evidence does not clearly establish or contradict this claim.',
          icon: HelpCircle,
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <NavLink
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Verification Console</span>
          </NavLink>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-sky-400" />
            <span>Claim Decomposition &amp; Evidence Comparison</span>
          </h1>
          <p className="text-xs text-slate-400">
            Phase 4: Natural Language Inference (NLI) relationship modeling between atomic claims and candidate news evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshAnalysis}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-medium text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Re-run decomposition and NLI comparison"
          >
            {isRefreshing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{isRefreshing ? 'Analyzing...' : 'Re-run Analysis'}</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Check Another Claim</span>
          </button>
        </div>
      </div>

      {/* Mandatory Honest Limitation Notice (Section 23) */}
      <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/80 flex items-start gap-3 text-xs text-sky-200 shadow-sm">
        <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-sky-300 block">
            Honest Modeling Notice (Phase 4 Foundation)
          </span>
          <p className="text-sky-200/90 leading-relaxed">
            TruthLens currently compares claims with retrieved evidence using a pretrained NLI model (<code className="font-mono text-sky-300">{nliModel}</code>). 
            These relationships are model predictions of premise-hypothesis consistency, <strong>NOT final determinations of objective truth</strong>. 
            Source authority, jurisdiction alignment, and multi-source evidence fusion are evaluated in later stages.
          </p>
        </div>
      </div>

      {/* Phase 4 Status & Metric Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 flex-shrink-0">
            <Cpu className="w-5 h-5 text-sky-400" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                Pipeline State:
              </span>
              <span className="px-2 py-0.5 rounded font-mono font-medium border bg-sky-950/60 text-sky-300 border-sky-800">
                NLI Evidence Comparison Completed
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Model: <span className="font-mono text-slate-300">{nliModel}</span> &bull; 
              Decomposed into <span className="font-semibold text-slate-300">{atomicClaims.length}</span> atomic claim{atomicClaims.length === 1 ? '' : 's'} &bull; 
              <span className="font-semibold text-slate-300">{relationships.length}</span> pairwise evaluation{relationships.length === 1 ? '' : 's'}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          {timingsMs.total_ms && (
            <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800">
              Total: {timingsMs.total_ms}ms
            </span>
          )}
          {submittedAt && <span>Submitted: {submittedAt}</span>}
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Submitted Claim, Atomic Decomposition, Evidence Matrix, Evidence Records */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Submitted Claim Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Submitted Claim &amp; Context</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                  Lang: {detectedLanguage.toUpperCase()} {languageConfidence > 0 ? `(${(languageConfidence * 100).toFixed(0)}%)` : ''}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Jurisdiction: {jurisdiction}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 text-sm font-medium text-slate-100 leading-relaxed">
                "{headline}"
              </div>

              {newsText && (
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Associated News Text / Extended Body:
                  </span>
                  <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs text-slate-300 leading-relaxed max-h-40 overflow-y-auto">
                    {newsText}
                  </div>
                </div>
              )}

              {newsUrl && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Reference Source Link:
                  </span>
                  <a
                    href={newsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors break-all"
                  >
                    <span>{newsUrl}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 2. Decomposed Atomic Claims (Section 4 & 5) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Atomic Claim Decomposition ({atomicClaims.length})</span>
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                Independently Verifiable Units
              </span>
            </div>

            <div className="space-y-3">
              {atomicClaims.map((claim) => (
                <div 
                  key={claim.id} 
                  className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                    claim.is_verifiable 
                      ? 'bg-slate-950/60 border-slate-800' 
                      : 'bg-amber-950/20 border-amber-900/60'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800">
                        {claim.id.toUpperCase()}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        Type: {claim.claim_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {claim.is_verifiable ? (
                        <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verifiable Factual Claim</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Subjective / Opinion Statement</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-medium text-slate-200">
                    "{claim.text}"
                  </p>

                  {!claim.is_verifiable && claim.subjective_reason && (
                    <p className="text-[11px] text-amber-300/80 italic">
                      Notice: {claim.subjective_reason}
                    </p>
                  )}
                </div>
              ))}

              {atomicClaims.length === 0 && (
                <p className="text-xs text-slate-400 italic p-3 text-center">
                  No atomic claims extracted.
                </p>
              )}
            </div>
          </div>

          {/* 3. CORE PHASE 4: Evidence Relationships Matrix (Section 14, 15, 16) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="space-y-0.5">
                <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  <span>Claim-to-Evidence Relationship Matrix</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Individual NLI pairwise consistency evaluations ({filteredRelationships.length} shown)
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Filter className="w-3 h-3 text-slate-500" />
                  <span>Claim:</span>
                  <select
                    value={selectedClaimFilter}
                    onChange={(e) => setSelectedClaimFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-slate-300"
                  >
                    <option value="ALL">All Claims</option>
                    {atomicClaims.map(c => (
                      <option key={c.id} value={c.id}>{c.id.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span>Rel:</span>
                  <select
                    value={selectedRelFilter}
                    onChange={(e) => setSelectedRelFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-slate-300"
                  >
                    <option value="ALL">All Relationships</option>
                    <option value="ENTAILS">ENTAILS</option>
                    <option value="CONTRADICTS">CONTRADICTS</option>
                    <option value="NEUTRAL">NEUTRAL</option>
                    <option value="UNSUPPORTED_LANGUAGE">UNSUPPORTED LANG</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Matrix Cards List */}
            <div className="space-y-4">
              {filteredRelationships.map((pair, idx) => {
                const badge = getRelationshipBadge(pair.relationship);
                const BadgeIcon = badge.icon;
                const isExpanded = expandedPairId === `${pair.claim_id}_${pair.evidence_id}_${idx}`;

                return (
                  <div 
                    key={`${pair.claim_id}_${pair.evidence_id}_${idx}`}
                    className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden shadow-sm transition-all hover:border-slate-700"
                  >
                    {/* Header Row: Claim ID, Source, Relationship, Confidence */}
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/60">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-sky-400 bg-sky-950 px-1.5 py-0.5 rounded border border-sky-800">
                            {pair.claim_id.toUpperCase()}
                          </span>
                          <span className="text-xs font-semibold text-slate-200">
                            {pair.evidence_publisher}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            (used: {pair.evidence_text_source})
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 italic">
                          Claim: "{pair.claim_text}"
                        </p>
                      </div>

                      {/* Relationship & Confidence Badges */}
                      <div className="flex items-center gap-3">
                        <div className={`px-2.5 py-1 rounded-lg border font-mono text-xs font-semibold flex items-center gap-1.5 ${badge.bg}`}>
                          <BadgeIcon className="w-3.5 h-3.5" />
                          <span>{badge.label}</span>
                        </div>

                        {pair.scores && (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-mono">
                              NLI Confidence:
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-200">
                              {(pair.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle: Evidence Text Used & Relationship Explanation */}
                    <div className="p-4 space-y-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          What It Establishes:
                        </span>
                        <p className="text-xs font-medium text-slate-200 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                          {pair.relationship_explanation}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-semibold uppercase tracking-wider">
                            Evidence Text Analyzed:
                          </span>
                          <span className="font-mono text-slate-500">
                            Source: {pair.evidence_text_source}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/60 text-slate-300 font-serif leading-relaxed">
                          "{pair.evidence_text_used || pair.evidence_title}"
                        </div>
                      </div>

                      {/* Toggleable Detailed Probabilities */}
                      {pair.scores && (
                        <div>
                          <button
                            onClick={() => setExpandedPairId(isExpanded ? null : `${pair.claim_id}_${pair.evidence_id}_${idx}`)}
                            className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition-colors font-mono cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide Detailed NLI Scores' : 'View Full Probability Distribution'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 p-3 rounded-lg bg-slate-900/80 border border-slate-800 grid grid-cols-3 gap-2 font-mono text-center">
                              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                <span className="text-[10px] text-emerald-400 block">ENTAILS</span>
                                <span className="text-xs font-bold text-slate-200">{(pair.scores.entails * 100).toFixed(2)}%</span>
                              </div>
                              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                <span className="text-[10px] text-rose-400 block">CONTRADICTS</span>
                                <span className="text-xs font-bold text-slate-200">{(pair.scores.contradicts * 100).toFixed(2)}%</span>
                              </div>
                              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                <span className="text-[10px] text-amber-400 block">NEUTRAL</span>
                                <span className="text-xs font-bold text-slate-200">{(pair.scores.neutral * 100).toFixed(2)}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Source Link */}
                      {pair.evidence_source_url && (
                        <div className="pt-1 flex items-center justify-between border-t border-slate-800/40 text-[11px]">
                          <span className="text-slate-500 font-mono">
                            Inference: {pair.inference_time_ms}ms
                          </span>
                          <a
                            href={pair.evidence_source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
                          >
                            <span>Inspect Source Article</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredRelationships.length === 0 && (
                <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
                  No relationships match the selected filters or no evidence candidates were available for comparison.
                </div>
              )}
            </div>
          </div>

          {/* 4. Retrieved Evidence Candidates (Phase 3 Foundation) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-sky-400" />
                <span>Retrieved Evidence Records ({evidenceItems.length})</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Free News API
              </span>
            </div>

            {/* Error State */}
            {evidenceError && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-xs text-rose-200 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>Evidence Provider Communication Error</span>
                </div>
                <p className="text-rose-200/90 leading-relaxed">
                  {evidenceError}
                </p>
                <button
                  onClick={handleRefreshAnalysis}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-white font-medium text-xs border border-rose-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Pipeline</span>
                </button>
              </div>
            )}

            {/* Evidence Cards List */}
            {!isRefreshing && !evidenceError && evidenceItems.length > 0 && (
              <div className="space-y-4">
                {evidenceItems.map((item) => (
                  <EvidenceCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Metadata, Relationship Scorecard, Official Sources, Integrity Standard */}
        <div className="space-y-6">

          {/* Relationship Distribution Scorecard */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800/80 pb-2 flex items-center justify-between">
              <span>NLI Relationship Summary</span>
              <span className="text-[10px] font-mono text-sky-400">Phase 4</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/60">
                <span className="text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ENTAILS (Consistent):
                </span>
                <span className="font-mono font-bold text-emerald-200">
                  {relationshipCounts['ENTAILS'] || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/40 border border-rose-900/60">
                <span className="text-rose-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  CONTRADICTS (Conflicts):
                </span>
                <span className="font-mono font-bold text-rose-200">
                  {relationshipCounts['CONTRADICTS'] || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  NEUTRAL (Unrelated / Partial):
                </span>
                <span className="font-mono font-bold text-slate-200">
                  {relationshipCounts['NEUTRAL'] || 0}
                </span>
              </div>

              {(relationshipCounts['UNSUPPORTED_LANGUAGE'] || 0) > 0 && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-purple-950/40 border border-purple-900/60">
                  <span className="text-purple-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-purple-400" />
                    Unsupported Lang:
                  </span>
                  <span className="font-mono font-bold text-purple-200">
                    {relationshipCounts['UNSUPPORTED_LANGUAGE']}
                  </span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/60">
              Note: Relationship counts reflect single claim-evidence pairs. They do not constitute a final verdict.
            </p>
          </div>

          {/* Routing Parameters Metadata Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800/80 pb-2">
              Routing Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  Jurisdiction:
                </span>
                <span className="font-medium text-slate-200">{jurisdiction}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  Detected Language:
                </span>
                <span className="font-medium text-slate-200 uppercase font-mono">{detectedLanguage}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">NLI Model:</span>
                <span className="font-mono text-[10px] text-sky-400 truncate max-w-[130px]" title={nliModel}>
                  {nliModel}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Provider:</span>
                <span className="font-mono text-sky-400">Free News API</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Verdict State:</span>
                <span className="font-semibold text-amber-400">NO FINAL VERDICT (Phase 4)</span>
              </div>
            </div>
          </div>

          {/* Authoritative Sources Registry for Jurisdiction */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>Target Official Sources</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Registry</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Official publications mapped for {jurisdiction} verification searches:
            </p>

            <div className="space-y-2 pt-1">
              {relevantSources.map((source) => (
                <div 
                  key={source.name}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="font-medium text-slate-200 block">{source.name}</span>
                    <span className="text-[10px] text-slate-400">{source.type}</span>
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-sky-400 transition-colors p-1"
                    title={`Visit ${source.name}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Integrity Standard Note */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200 block">Verification Integrity Standard</span>
            <p className="leading-relaxed">
              TruthLens strictly prohibits generating artificial truth probabilities or synthetic verdicts. NLI relationships describe logical consistency between a single premise and hypothesis, not the factual truth of the world.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
