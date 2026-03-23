import React from "react";

export default function LoadingSpinner({ label = "Neural Processing Active…", size = "md" }) {
  const sz = size === "sm" ? "w-6 h-6" : size === "lg" ? "w-16 h-16" : "w-10 h-10";
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div className={`${sz} relative`}>
        <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-2 border-primary/20 border-b-transparent rounded-full animate-pulse-slow"></div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-sm font-bold font-headline text-primary animate-pulse uppercase tracking-widest">{label}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Syncing Institutional Intelligence</p>
        </div>
      )}
    </div>
  );
}
