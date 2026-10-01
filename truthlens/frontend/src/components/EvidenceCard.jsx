import React from 'react';
import { ExternalLink, Calendar, Shield, FileCheck, AlertCircle } from 'lucide-react';

/**
 * Reusable EvidenceCard component for TruthLens.
 *
 * Designed to represent retrieved evidence items from authoritative sources,
 * official gazettes, press releases, or fact-checking bodies.
 *
 * In Phase 2, this renders a clean structured shell with development/empty indicators
 * if live evidence retrieval is not yet active.
 */
export default function EvidenceCard({
  sourceName,
  sourceType,
  articleTitle,
  url,
  publicationDate,
  evidenceRelationship,
  explanation,
  isEmptyState = false,
  emptyMessage,
}) {
  if (isEmptyState) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
          <AlertCircle className="w-5 h-5 text-sky-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-slate-300">
            {emptyMessage || 'No Live Evidence Retrieved Yet'}
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            The external search connector (Brave Search API) and official gazette retrieval pipelines are scheduled for upcoming phases. No fabricated citations or simulated search results are shown.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4 hover:border-slate-700 transition-colors shadow-sm">
      {/* Header: Source Name, Type, and Evidence Relationship */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-200">
              {sourceName || 'Authoritative Source'}
            </span>
            {sourceType && (
              <span className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {sourceType}
              </span>
            )}
          </div>
        </div>

        {evidenceRelationship && (
          <div className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
            <FileCheck className="w-3 h-3 text-sky-400" />
            <span>{evidenceRelationship}</span>
          </div>
        )}
      </div>

      {/* Article Title and External Link */}
      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold text-white leading-snug">
          {articleTitle || 'Document / Archive Citation'}
        </h4>

        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors break-all group"
          >
            <span className="group-hover:underline">{url}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        ) : (
          <span className="text-xs text-slate-400 italic">No external URL provided</span>
        )}
      </div>

      {/* Explanation / Context */}
      {explanation && (
        <div className="text-xs text-slate-300 bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 leading-relaxed">
          <span className="font-semibold text-slate-400 block mb-1">Evidence Summary:</span>
          {explanation}
        </div>
      )}

      {/* Footer: Date metadata */}
      {publicationDate && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono pt-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>Published: {publicationDate}</span>
        </div>
      )}
    </div>
  );
}
