import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Clock, ArrowLeft, Layers, ShieldAlert, Cpu } from 'lucide-react';

export default function ResultsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <NavLink
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Claim Submission</span>
        </NavLink>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Evidence Assessment &amp; Verification Results
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Placeholder View &bull; Initial Foundation Phase
            </p>
          </div>
        </div>
      </div>

      {/* Research-oriented Placeholder Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800/80 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-100">
              Analysis Engine Not Yet Connected
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              In accordance with project guidelines for the <span className="text-slate-200 font-medium">Initial Foundation Phase</span>, no synthetic verification verdicts, simulated confidence scores, or mock sources are rendered here.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Planned Verification Results Output</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="font-semibold text-slate-200">1. Evidence Citations</span>
              <p className="text-slate-400">
                Direct extracts from PIB, state government gazettes, and verified news publications retrieved via Brave Search.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="font-semibold text-slate-200">2. Natural Language Inference</span>
              <p className="text-slate-400">
                Contradiction, Entailment, or Neutral classification comparing specific claim clauses against retrieved authoritative excerpts.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="font-semibold text-slate-200">3. ClaimReview Metadata</span>
              <p className="text-slate-400">
                Matches from certified fact-checking signatories (IFCN) when identical or similar claims have been previously evaluated.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="font-semibold text-slate-200">4. Explainable Summary</span>
              <p className="text-slate-400">
                Clear, evidence-backed narrative summarizing official documentation without opaque black-box assertions.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <NavLink
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <span>Return to Verification Console</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
