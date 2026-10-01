import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Link as LinkIcon, 
  FileText, 
  Info, 
  AlertTriangle, 
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function HomePage() {
  const [headline, setHeadline] = useState('');
  const [newsText, setNewsText] = useState('');
  const [newsUrl, setNewsUrl] = useState('');
  const [jurisdiction, setJurisdiction] = useState('Central Government / India');
  const [language, setLanguage] = useState('English');
  const [showDevNotice, setShowDevNotice] = useState(false);

  const handleVerifyClick = (e) => {
    e.preventDefault();
    setShowDevNotice(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/70 border border-sky-800/60 text-sky-300 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>Evidence-First Verification Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Verify Claims Against Authoritative Evidence
        </h1>
        <p className="text-slate-400 text-base max-w-3xl leading-relaxed">
          TruthLens is engineered to extract verifiable claims from news headlines, reports, and digital media, routing them directly against official public records, state gazettes, and verified news repositories.
        </p>
      </div>

      {/* Development State Notice Alert */}
      {showDevNotice && (
        <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-800/80 text-amber-200 text-sm space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Phase 1: Verification Pipeline Offline</span>
            </div>
            <button
              onClick={() => setShowDevNotice(false)}
              className="text-xs text-amber-400 hover:text-amber-200 underline"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-amber-300/90 leading-relaxed">
            The verification engine is currently in its initial foundation phase. In accordance with strict development rules, no fake verification results or placeholder AI predictions will be generated. The analysis endpoint, Brave Search retrieval, and NLI inference pipeline will be hooked up in subsequent development phases.
          </p>
        </div>
      )}

      {/* Main Verification Input Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="border-b border-slate-800 px-6 py-4 bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Claim Submission Console</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Jurisdiction &amp; Language Routing</span>
          </div>
        </div>

        <form onSubmit={handleVerifyClick} className="p-6 space-y-6">
          {/* Metadata Routing Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Jurisdiction
              </label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="Central Government / India">Central Government / India (PIB, Gazettes)</option>
                <option value="Andhra Pradesh">Andhra Pradesh (GoAP Portals)</option>
                <option value="Telangana">Telangana (GoTS Portals)</option>
                <option value="Tamil Nadu">Tamil Nadu (TNeGA, DIPR)</option>
                <option value="Andaman & Nicobar Islands">Andaman &amp; Nicobar Islands</option>
                <option value="Jammu & Kashmir">Jammu &amp; Kashmir</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Primary Content Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="English">English</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
              </select>
            </div>
          </div>

          {/* 1. Headline / Claim Input */}
          <div>
            <label htmlFor="claim-headline" className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Headline or Core Claim <span className="text-rose-400">*</span></span>
              <span className="text-slate-400 text-[11px]">Primary subject of verification</span>
            </label>
            <input
              id="claim-headline"
              type="text"
              placeholder="e.g., Central Government announces new pension eligibility criteria for 2026..."
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            />
          </div>

          {/* 2. News Text / Body Input */}
          <div>
            <label htmlFor="claim-body" className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Full News Article / Post Content</span>
              <span className="text-slate-400 text-[11px]">Optional extended context</span>
            </label>
            <textarea
              id="claim-body"
              rows={4}
              placeholder="Paste full article text, circulating WhatsApp message, or official statement context here..."
              value={newsText}
              onChange={(e) => setNewsText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            />
          </div>

          {/* 3. Source URL Input */}
          <div>
            <label htmlFor="claim-url" className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Reference URL / Origin Link</span>
              </span>
              <span className="text-slate-400 text-[11px]">Web source link</span>
            </label>
            <input
              id="claim-url"
              type="url"
              placeholder="https://news-outlet.example/article-path"
              value={newsUrl}
              onChange={(e) => setNewsUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors font-mono text-xs"
            />
          </div>

          {/* Screenshot / Media Notice (Phase 4 OCR) */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-300 font-medium">Image &amp; WhatsApp Screenshot Upload:</span> Scheduled for upcoming OCR module integration. Text &amp; URL ingestion is prioritized in the current baseline.
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Phase 1 Status:</span> Verification processing pipeline disabled until AI/Search integration.
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <Search className="w-4 h-4" />
                <span>Verify Claim</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* System Pipeline Roadmap & Foundation Architecture Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Architecture &amp; Pipeline Progression</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">Phase 1 of 5</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-sky-800/40 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                ACTIVE
              </span>
              <Cpu className="w-4 h-4 text-sky-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">1. Project Foundation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              FastAPI backend, Pydantic schemas, Uvicorn, CORS, React 18, Vite, Tailwind CSS, and Axios API service client.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                NEXT PHASE
              </span>
              <Database className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300 mb-1">2. Evidence &amp; Sources</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Brave Search API integration, PIB / Official state gazette scrapers, ClaimReview schemas, and SQLite claim caching.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                FUTURE
              </span>
              <Sparkles className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300 mb-1">3. NLI &amp; OCR Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transformers-based Natural Language Inference (Entailment / Contradiction / Neutral), EasyOCR, and multi-lingual processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
