import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  Link as LinkIcon, 
  FileText, 
  AlertCircle, 
  ArrowDown,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  RotateCcw,
  Loader2,
  FileSearch,
  Scale,
  Compass
} from 'lucide-react';

export const JURISDICTIONS = [
  { id: 'central', name: 'Central Government / India', description: 'PIB, The Gazette of India, Union Ministries' },
  { id: 'ap', name: 'Andhra Pradesh', description: 'GoAP Portals, I&PR Department' },
  { id: 'ts', name: 'Telangana', description: 'GoTS Portals, Digital Media Wing' },
  { id: 'tn', name: 'Tamil Nadu', description: 'DIPR, TNeGA Portals' },
  { id: 'an', name: 'Andaman & Nicobar Islands', description: 'UT Administration Official Gazettes' },
  { id: 'jk', name: 'Jammu & Kashmir', description: 'DIPR-J&K Official Announcements' },
];

export const LANGUAGES = [
  { id: 'en', name: 'English', native: 'English' },
  { id: 'te', name: 'Telugu', native: 'తెలుగు' },
  { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
];

/**
 * Validates a user-provided article URL using JavaScript's native URL constructor.
 * Strict protocol whitelist: only 'http:' and 'https:' are permitted.
 */
export const validateArticleUrl = (urlString) => {
  if (!urlString || !urlString.trim()) {
    return { valid: true, error: null };
  }
  const trimmed = urlString.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { 
        valid: false, 
        error: `Unsupported protocol "${parsed.protocol}". Only "http:" and "https:" URLs are allowed.` 
      };
    }
    return { valid: true, error: null };
  } catch {
    return { 
      valid: false, 
      error: 'Please enter a valid URL format (e.g., https://example.com/article).' 
    };
  }
};

export default function HomePage() {
  const navigate = useNavigate();

  // Controlled form state
  const [headline, setHeadline] = useState('');
  const [newsText, setNewsText] = useState('');
  const [newsUrl, setNewsUrl] = useState('');
  const [jurisdiction, setJurisdiction] = useState(JURISDICTIONS[0].name);
  const [language, setLanguage] = useState(LANGUAGES[0].name);

  // Validation & Submission state
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState(null);

  // Maximum character thresholds for counters
  const MAX_HEADLINE_LENGTH = 350;
  const MAX_TEXT_LENGTH = 5000;

  const scrollToWorkspace = () => {
    const el = document.getElementById('verify-workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setHeadline('');
    setNewsText('');
    setNewsUrl('');
    setJurisdiction(JURISDICTIONS[0].name);
    setLanguage(LANGUAGES[0].name);
    setFormErrors({});
    setSubmissionFeedback(null);
  };

  const handleHeadlineChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_HEADLINE_LENGTH) {
      setHeadline(value);
      if (formErrors.headline) {
        setFormErrors(prev => ({ ...prev, headline: null }));
      }
    }
  };

  const handleNewsTextChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_TEXT_LENGTH) {
      setNewsText(value);
    }
  };

  const handleUrlChange = (e) => {
    const value = e.target.value;
    setNewsUrl(value);
    if (formErrors.url) {
      setFormErrors(prev => ({ ...prev, url: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // 1. Validation
    const errors = {};
    if (!headline.trim()) {
      errors.headline = 'Please enter a headline or core claim to submit for verification.';
    }

    if (newsUrl.trim()) {
      const urlCheck = validateArticleUrl(newsUrl);
      if (!urlCheck.valid) {
        errors.url = urlCheck.error;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmissionFeedback({
        type: 'error',
        message: 'Please resolve the highlighted validation errors before submitting.',
      });
      return;
    }

    // 2. Submission progression
    setFormErrors({});
    setIsSubmitting(true);
    setSubmissionFeedback({
      type: 'info',
      message: 'Processing submission payload...',
    });

    // Simulate structured processing and route to /results with payload
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/results', {
        state: {
          headline: headline.trim(),
          newsText: newsText.trim(),
          newsUrl: newsUrl.trim(),
          jurisdiction,
          language,
          submittedAt: new Date().toISOString(),
          status: 'Awaiting Live Verification',
        },
      });
    }, 700);
  };

  return (
    <div className="space-y-16 py-10">
      {/* 1. HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950/80 border border-sky-800/70 text-sky-300 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>Evidence-Based News and Claim Verification</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Before you believe it, <br />
          <span className="text-sky-400">check the evidence.</span>
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          TruthLens is engineered to validate assertions through traceable evidence. The platform is designed to extract claims, detect jurisdiction and language, retrieve official government gazettes, and compare assertions using explainable inference.
        </p>

        {/* Phase 2 Scope Notice */}
        <div className="inline-block max-w-xl mx-auto p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-400">
          <span className="font-semibold text-slate-200">Phase 2 Status:</span> Interactive verification console active. Live external web search, Hugging Face NLI reasoning, and OCR image parsing are being integrated in upcoming phases.
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={scrollToWorkspace}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition-colors shadow-lg shadow-sky-900/30 cursor-pointer"
          >
            <span>Check a Claim</span>
            <ArrowDown className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/results')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-sm border border-slate-700 transition-colors cursor-pointer"
          >
            <span>View Results Presentation Shell</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 2. PROCESS EXPLANATION CARDS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-sky-400">
            How TruthLens Operates
          </h2>
          <p className="text-xl sm:text-2xl font-bold text-white">
            Evidence First, Explanation Second
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-xl bg-slate-900 border border-sky-800/40 relative space-y-3 shadow-md">
            <div className="w-10 h-10 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 font-bold text-sm">
              01
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">1. Submit a Claim</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide a news headline, full article text, or source link. Select the target Indian jurisdiction and language for contextual routing.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 relative space-y-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm">
              02
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-200">2. Retrieve Relevant Evidence</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  UPCOMING
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The engine will query Brave Search and official state gazettes (PIB, GoAP, GoTS, TN DIPR) to aggregate primary source records.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 relative space-y-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm">
              03
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-200">3. Compare Claim With Evidence</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  UPCOMING
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Natural Language Inference (NLI) will evaluate entailment and contradiction against retrieved evidence, generating a traceable synthesis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VERIFICATION INPUT WORKSPACE */}
      <section id="verify-workspace" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="border-b border-slate-800 px-6 py-4 bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
              <FileSearch className="w-4 h-4 text-sky-400" />
              <span>Claim Submission Console</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Jurisdiction &amp; Language Routing</span>
            </div>
          </div>

          {/* Feedback Banner */}
          {submissionFeedback && (
            <div 
              className={`px-6 py-3 border-b text-xs flex items-center justify-between ${
                submissionFeedback.type === 'error'
                  ? 'bg-rose-950/40 border-rose-900/80 text-rose-200'
                  : 'bg-sky-950/40 border-sky-900/80 text-sky-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{submissionFeedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setSubmissionFeedback(null)}
                className="text-xs opacity-75 hover:opacity-100 underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Metadata Selectors: Jurisdiction and Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="jurisdiction-select" className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  <span>Target Jurisdiction</span>
                </label>
                <select
                  id="jurisdiction-select"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                >
                  {JURISDICTIONS.map((j) => (
                    <option key={j.id} value={j.name}>
                      {j.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Routes claim against regional portals and state information bureaus.
                </p>
              </div>

              <div>
                <label htmlFor="language-select" className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-sky-400" />
                  <span>Primary Content Language</span>
                </label>
                <select
                  id="language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.id} value={l.name}>
                      {l.name} ({l.native})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Multilingual NLI models will process regional scripts in later phases.
                </p>
              </div>
            </div>

            {/* 1. Headline / Claim Input (Required) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="headline-input" className="block text-xs font-medium text-slate-200">
                  Headline or Core Claim <span className="text-rose-400">*</span>
                </label>
                <span className={`text-[11px] font-mono ${
                  headline.length >= MAX_HEADLINE_LENGTH ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  {headline.length} / {MAX_HEADLINE_LENGTH}
                </span>
              </div>
              <input
                id="headline-input"
                type="text"
                placeholder="e.g., Central Government announces revised criteria for citizen welfare subsidies..."
                value={headline}
                onChange={handleHeadlineChange}
                disabled={isSubmitting}
                className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none transition-colors ${
                  formErrors.headline 
                    ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                    : 'border-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500'
                }`}
              />
              {formErrors.headline && (
                <p className="text-xs text-rose-400 flex items-center gap-1.5 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{formErrors.headline}</span>
                </p>
              )}
            </div>

            {/* 2. News Article Text (Optional Context) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="text-input" className="block text-xs font-medium text-slate-300">
                  Extended Article Text / Message Body <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {newsText.length} / {MAX_TEXT_LENGTH}
                </span>
              </div>
              <textarea
                id="text-input"
                rows={4}
                placeholder="Paste the full news article body, circulating message excerpt, or social media post content here..."
                value={newsText}
                onChange={handleNewsTextChange}
                disabled={isSubmitting}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              />
            </div>

            {/* 3. Reference URL (Optional) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="url-input" className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Article or Reference URL <span className="text-slate-400 font-normal">(Optional)</span></span>
                </label>
                <span className="text-[11px] text-slate-400">Must begin with http:// or https://</span>
              </div>
              <input
                id="url-input"
                type="text"
                placeholder="https://news-portal.example/story/item-id"
                value={newsUrl}
                onChange={handleUrlChange}
                disabled={isSubmitting}
                className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 font-mono text-xs focus:outline-none transition-colors ${
                  formErrors.url 
                    ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                    : 'border-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500'
                }`}
              />
              {formErrors.url && (
                <p className="text-xs text-rose-400 flex items-center gap-1.5 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{formErrors.url}</span>
                </p>
              )}
            </div>

            {/* Actions Row */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>Phase 2: Submissions route to the structured results presentation shell.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting || (!headline && !newsText && !newsUrl)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors shadow-sm cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Claim...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Submit for Verification</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* 4. PRODUCT PHILOSOPHY & TRUST */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Product Philosophy &amp; Verification Integrity</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            TruthLens is designed around <span className="text-white font-medium">evidence retrieval and explainability</span> rather than simply asking an AI model whether a claim is true. The platform avoids opaque black-box verdicts or ungrounded confidence percentages. Every assessment will link directly to cited official documentation, verifiable gazettes, and reputable news records.
          </p>
          <div className="text-[11px] text-slate-400 font-mono pt-1">
            "Evidence first, explanation second."
          </div>
        </div>
      </section>
    </div>
  );
}
