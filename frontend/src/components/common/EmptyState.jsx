import React from "react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-slate-300">
      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
        <span className="material-symbols-outlined text-5xl">folder_off</span>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-extrabold font-headline text-on-surface">No instance selected</h3>
        <p className="text-sm font-body text-slate-400 mt-2 max-w-xs mx-auto">
          Please select a document from the Ingestion Hub or use the Sidebar to browse the institutional library.
        </p>
      </div>
    </div>
  );
}
