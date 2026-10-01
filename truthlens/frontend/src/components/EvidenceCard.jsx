import React from 'react';
import { ExternalLink, Calendar, Globe, AlertCircle, Newspaper } from 'lucide-react';

/**
 * Reusable EvidenceCard component for TruthLens.
 *
 * Renders normalized candidate evidence items retrieved from news archives,
 * official gazettes, or press bureaus.
 *
 * NOTE: Every candidate evidence card represents an empirical reference item,
 * NOT an automated proof or judgment of truth.
 */
export default function EvidenceCard({
  item,
  sourceName,
  sourceType,
  articleTitle,
  url,
  publicationDate,
  description,
  explanation,
  provider,
  language,
  country,
  isEmptyState = false,
  emptyMessage,
}) {
  // Support either single normalized item object or individual props
  const finalTitle = item?.title || articleTitle || 'Untitled Evidence Candidate';
  const finalPublisher = item?.publisher || sourceName || 'News Publisher';
  const finalUrl = item?.source_url || item?.url || url;
  const rawDate = item?.published_at || item?.publicationDate || publicationDate;
  const finalDate = rawDate ? new Date(rawDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : null;
  const finalDescription = item?.description || description || explanation;
  const finalSourceType = item?.source_type || sourceType || 'news';
  const finalProvider = item?.provider || provider || 'free_news_api';
  const finalLang = item?.language || language;
  const finalCountry = item?.country || country;

  if (isEmptyState) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
          <AlertCircle className="w-5 h-5 text-amber-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-slate-300">
            {emptyMessage || 'No Relevant Evidence Sources Found'}
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            No matching news articles or reports were indexed for this query within the rolling 30-day window. Absence of retrieved news articles does not mean the claim is false.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4 hover:border-slate-700 transition-colors shadow-sm">
      {/* Header: Publisher / Source Name, Source Type, Provider Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
            <Newspaper className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-200">
              {finalPublisher}
            </span>
            <span className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {finalSourceType}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {finalCountry && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {finalCountry}
            </span>
          )}
          {finalLang && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
              {finalLang}
            </span>
          )}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
            {finalProvider === 'free_news_api' ? 'Free News API' : finalProvider}
          </span>
        </div>
      </div>

      {/* Article Title and Link */}
      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold text-white leading-snug">
          {finalTitle}
        </h4>

        {finalUrl ? (
          <a
            href={finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors break-all group"
          >
            <span className="group-hover:underline">{finalUrl}</span>
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
          </a>
        ) : (
          <span className="text-xs text-slate-400 italic">No external URL available</span>
        )}
      </div>

      {/* Description / Summary snippet */}
      {finalDescription && (
        <div className="text-xs text-slate-300 bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 leading-relaxed">
          <span className="font-semibold text-slate-400 block mb-1">Article Excerpt:</span>
          {finalDescription}
        </div>
      )}

      {/* Footer: Date metadata */}
      {finalDate && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono pt-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Published: {finalDate}</span>
        </div>
      )}
    </div>
  );
}
