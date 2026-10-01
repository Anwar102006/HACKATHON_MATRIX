import React from 'react';
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
  CheckCircle2, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Compass,
  FileCheck,
  RotateCcw
} from 'lucide-react';
import EvidenceCard from '../components/EvidenceCard';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve submitted payload from navigation state (if available)
  const submission = location.state || null;

  // Fallback defaults if accessed without direct submission
  const headline = submission?.headline || null;
  const newsText = submission?.newsText || '';
  const newsUrl = submission?.newsUrl || '';
  const jurisdiction = submission?.jurisdiction || 'Central Government / India';
  const language = submission?.language || 'English';
  const submittedAt = submission?.submittedAt 
    ? new Date(submission.submittedAt).toLocaleString() 
    : null;

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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
            <span>Verification Assessment Shell</span>
          </h1>
        </div>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors w-fit cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Check Another Claim</span>
        </button>
      </div>

      {/* Verification Status Banner (Clear Non-Fabricated Status) */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200 text-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-900/60 border border-amber-700 flex items-center justify-center text-amber-300 flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px]">
                Status:
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700/80 font-mono font-medium">
                Awaiting Live Verification (Phase 2 Shell)
              </span>
            </div>
            <p className="text-[11px] text-amber-300/80">
              Submitted for verification. Live NLP/NLI comparison models and Brave Search indexing will populate final verdicts in subsequent phases.
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono sm:text-right">
          {submittedAt && <span>Submitted: {submittedAt}</span>}
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Submitted Claim, Clause Breakdown, Evidence */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Submitted Claim Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Submitted Claim</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                Input Scope: Primary Assertion
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 text-sm font-medium text-slate-100 leading-relaxed">
                "{headline}"
              </div>

              {newsText && (
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Associated News Text / Message Body:
                  </span>
                  <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs text-slate-300 leading-relaxed max-h-40 overflow-y-auto">
                    {newsText}
                  </div>
                </div>
              )}

              {newsUrl && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Reference Article Link:
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

          {/* 2. Detected Claims / Clause Decomposition Shell */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Decomposed Claim Clauses</span>
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Phase 3 Pipeline
              </span>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-slate-200">Sentence Segmentation &amp; Clause Extraction:</span>
                  <p className="leading-relaxed">
                    Once the NLP parsing service is connected, complex news statements will be automatically split into individual verifiable factual claims. Each clause will then be independently scored against retrieved evidence.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Evidence Cards Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-sky-400" />
                <span>Retrieved Evidence Records</span>
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                0 Live Records
              </span>
            </div>

            {/* EvidenceCard component in Phase 2 empty/dev state */}
            <EvidenceCard
              isEmptyState={true}
              emptyMessage="External Evidence Retrieval Pipeline Pending"
            />
          </div>

          {/* 4. Explainable Summary Shell */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-sky-400" />
                <span>Explainable Assessment Summary</span>
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Pending NLI Inference
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              When verification execution is connected, this section will synthesize evidence into an explainable narrative detailing whether official records substantiate, refute, or qualify the submitted claim clauses. No automated decision is rendered without explicit citations.
            </p>
          </div>
        </div>

        {/* Right Column (1 col): Metadata, Jurisdiction Sources, Audit Info */}
        <div className="space-y-6">
          {/* Metadata Card */}
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
                  Language:
                </span>
                <span className="font-medium text-slate-200">{language}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Inferred Topic:</span>
                <span className="font-mono text-slate-300">Public Policy / Governance</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Verdict State:</span>
                <span className="font-semibold text-amber-400">UNVERIFIED (Phase 2)</span>
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

          {/* Integrity Notice */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200 block">Verification Integrity Standard</span>
            <p className="leading-relaxed">
              TruthLens strictly prohibits generating artificial confidence percentages or synthetic verdicts. In Phase 2, this presentation shell validates the end-to-end user experience and data structure layout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
