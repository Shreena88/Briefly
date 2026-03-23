import React from "react";

export default function PageNavigator({ total, current, onChange }) {
  return (
    <div className="flex items-center justify-center gap-6 py-1">
      <button
        disabled={current === 0}
        onClick={() => onChange(current - 1)}
        className="p-1 rounded-full hover:bg-primary/10 text-slate-400 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent transition-all"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      <div className="flex items-center gap-2">
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page</span>
         <div className="flex items-center bg-white border border-slate-100 px-3 py-1 rounded shadow-sm">
            <span className="text-sm font-bold text-primary font-headline">{current + 1}</span>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-600 font-headline">{total}</span>
         </div>
      </div>

      <button
        disabled={current === total - 1}
        onClick={() => onChange(current + 1)}
        className="p-1 rounded-full hover:bg-primary/10 text-slate-400 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent transition-all"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}
