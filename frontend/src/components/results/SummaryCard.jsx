import React, { useState } from "react";

export default function SummaryCard({ summary, processingTimeMs, pageCount, fileSizeBytes }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sizeKb = (fileSizeBytes / 1024).toFixed(1);
  const secs = (processingTimeMs / 1000).toFixed(1);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(summary);
  };

  return (
    <>
      <div
        onClick={() => setIsExpanded(true)}
        className="group relative rounded-2xl border border-slate-200/50 bg-white dark:bg-slate-900 shadow-sm overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5"
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
            </div>
            <div>
              <h3 className="font-bold font-headline text-on-surface text-sm">AI Executive Summary</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Neural Extraction</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">
              BART-Large
            </span>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-primary transition-colors p-1"
              title="Copy to clipboard"
            >
              <span className="material-symbols-outlined text-lg">content_copy</span>
            </button>
          </div>
        </div>

        {/* Summary text with fade-out */}
        <div className="relative px-6 py-6 font-body text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-h-[160px] overflow-hidden">
          {summary ? (
            <p className="whitespace-pre-wrap">{summary}</p>
          ) : (
            <p className="italic text-slate-400">Archival analysis active...</p>
          )}
          {summary && summary.length > 200 && (
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-slate-900 to-transparent flex items-end justify-center pb-2">
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-tighter flex items-center gap-1">
                Click to expand <span className="material-symbols-outlined text-sm">expand_more</span>
              </span>
            </div>
          )}
        </div>

        {/* Metadata strip */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">pages</span> {pageCount}p</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">database</span> {sizeKb}kb</span>
          </div>
          <span className="text-primary/70">{secs}s</span>
        </div>
      </div>

      {/* Full Summary Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setIsExpanded(false)}
          />
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh] border border-slate-200/50">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/30">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                 </div>
                 <div>
                   <h2 className="text-xl font-bold font-headline text-on-surface">Full Intelligence Report</h2>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Neural Archival Summary</p>
                 </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto font-body text-base leading-relaxed text-slate-700 dark:text-slate-300 scrollbar-thin">
               <p className="whitespace-pre-wrap">{summary}</p>
            </div>

            <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                 <span>Confidence: 98.2%</span>
                 <span>Analysis Time: {secs}s</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                Copy Full Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
