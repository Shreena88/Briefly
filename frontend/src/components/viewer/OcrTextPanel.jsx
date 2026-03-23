import React from "react";

export default function OcrTextPanel({ text }) {
  const handleCopy = () => navigator.clipboard.writeText(text);

  return (
    <div className="relative flex flex-col h-full bg-white font-body">
      <button
        onClick={handleCopy}
        title="Copy raw text"
        className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-surface-container-low/50 hover:bg-primary/10 hover:text-primary transition-all text-slate-400 border border-slate-100"
      >
        <span className="material-symbols-outlined text-lg">content_copy</span>
      </button>
      
      <div className="flex-1 overflow-auto scrollbar-thin p-8">
        <pre className="text-sm leading-relaxed font-mono text-on-surface-variant whitespace-pre-wrap break-words selection:bg-primary-fixed selection:text-on-primary-fixed">
          {text.trim() || (
            <div className="h-full flex flex-col items-center justify-center opacity-40 py-20 translate-y-20">
              <span className="material-symbols-outlined text-4xl mb-2">short_text</span>
              <p className="italic font-headline font-bold">No machine-readable text found</p>
            </div>
          )}
        </pre>
      </div>
    </div>
  );
}
