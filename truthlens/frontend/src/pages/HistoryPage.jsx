import React from 'react';
import { NavLink } from 'react-router-dom';
import { History, Database, ArrowLeft, ShieldCheck, HardDrive } from 'lucide-react';

export default function HistoryPage() {
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
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Verification Audit History
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Placeholder View &bull; Initial Foundation Phase
            </p>
          </div>
        </div>
      </div>

      {/* History Placeholder Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-sky-400 flex-shrink-0 mt-0.5">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-100">
              Database Persistence Layer Pending
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              No historical claims are stored yet. The local SQLite database and query caching layers are scheduled to be implemented in an upcoming phase.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400" />
            <span>Planned History Features</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-400">
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Local Claims Cache:</span> Re-verifications of identical claims or viral forwards will instantly resolve using stored authoritative snapshots.
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Audit Trail:</span> Timestamped record of sources queried, evidence snippets parsed, and jurisdiction assignments.
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Export &amp; Research Citations:</span> Downloadable verification logs in JSON/CSV for journalistic inquiry and fact-checking workflows.
              </div>
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
