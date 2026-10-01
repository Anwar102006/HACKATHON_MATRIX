import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { History, Database, ArrowLeft, ShieldCheck, HardDrive, Clock, FileText } from 'lucide-react';

export default function HistoryPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <NavLink
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Verification Console</span>
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
              Placeholder View &bull; Phase 2 Frontend Experience
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
              No historical claims are stored yet. In accordance with Phase 2 project boundaries, local SQLite persistence and caching layers will be introduced in an upcoming phase.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400" />
            <span>Planned History Storage Scope</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                Submitted Claims &amp; Text
              </span>
              <p>Indexed archive of user-submitted headlines, article bodies, and source reference URLs.</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Timestamps &amp; Audit Trail
              </span>
              <p>Cryptographic timestamps, verification session metadata, and regional jurisdiction tags.</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                Verification Results &amp; Inference
              </span>
              <p>Traceable assessment summaries and multi-clause entailment classifications.</p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-sky-400" />
                Evidence &amp; Source Snapshots
              </span>
              <p>Permanent caching of cited official gazette URLs and retrieved Brave Search evidence excerpts.</p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigate('/#verify-workspace')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            <span>Return to Verification Console</span>
          </button>
        </div>
      </div>
    </div>
  );
}
