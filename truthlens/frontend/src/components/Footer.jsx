import React from 'react';
import { ShieldCheck, MapPin, Globe, Terminal } from 'lucide-react';

export default function Footer() {
  const jurisdictions = [
    'Central Government / India',
    'Andhra Pradesh',
    'Telangana',
    'Tamil Nadu',
    'Andaman & Nicobar',
    'Jammu & Kashmir',
  ];

  const languages = ['English', 'Telugu (తెలుగు)', 'Tamil (தமிழ்)'];

  return (
    <footer className="border-t border-slate-800 bg-slate-900/60 mt-auto text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mission & Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold">
              <ShieldCheck className="w-5 h-5 text-sky-500" />
              <span>TruthLens</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evidence-based news and claim verification. Designed to validate public assertions against official gazettes, press bureaus, and authoritative public records.
            </p>
            <p className="text-xs font-mono text-sky-400">
              "Evidence first, explanation second."
            </p>
          </div>

          {/* Jurisdictions Scope */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Priority Indian Jurisdictions</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {jurisdictions.map((item) => (
                <span
                  key={item}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Supported Languages & Phase Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 uppercase tracking-wider">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Language Prioritization</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                >
                  {lang}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-[11px] text-sky-400 font-mono">
                <Terminal className="w-3.5 h-3.5" />
                <span>Phase 2: Frontend Verification Experience Active</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Brave Search API, Hugging Face NLI, ClaimReview, and SQLite storage planned for upcoming releases.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} TruthLens Platform. Evidence-based news and claim verification.
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Backend: FastAPI &bull; Frontend: React/Vite/Tailwind
          </div>
        </div>
      </div>
    </footer>
  );
}
