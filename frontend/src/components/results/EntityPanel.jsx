import React, { useState } from "react";

const TABS = [
  { key: "amounts", label: "Currency", icon: "payments", color: "primary" },
  { key: "dates", label: "Temporal", icon: "calendar_month", color: "secondary" },
  { key: "names", label: "Stakeholders", icon: "person_search", color: "tertiary" },
  { key: "invoice_numbers", label: "Identifiers", icon: "tag", color: "quaternary" },
  { key: "key_terms", label: "Keywords", icon: "key", color: "quinary" },
];

export default function EntityPanel({ entities = {} }) {
  const [activeTab, setActiveTab] = useState("amounts");

  const counts = {
    amounts: entities.amounts?.length || 0,
    dates: entities.dates?.length || 0,
    names: entities.names?.length || 0,
    invoice_numbers: entities.invoice_numbers?.length || 0,
    key_terms: entities.key_terms?.length || 0,
  };

  return (
    <div className="rounded-xl border border-slate-200/20 bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-surface-container-low/30">
        <h3 className="font-bold font-headline text-on-surface text-lg">Neural Entity Extraction</h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Institutional Data Points</p>
      </div>

      {/* Tab bar */}
      <div className="flex px-4 pt-4 border-b border-slate-100">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 pb-3 px-2 flex flex-col items-center gap-1 transition-all relative ${
              activeTab === tab.key
                ? "text-primary"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className={`material-symbols-outlined text-xl ${activeTab === tab.key ? "fill-1" : ""}`}>
              {tab.icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap">
              {tab.label}
            </span>
            <span className={`absolute top-0 right-2 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${
              activeTab === tab.key ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {counts[tab.key]}
            </span>
            {activeTab === tab.key && (
              <div className="absolute bottom-0 inset-x-2 h-1 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Entity list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <EntityList
          items={entities[activeTab] || []}
          tabKey={activeTab}
        />
      </div>
    </div>
  );
}

function EntityList({ items, tabKey }) {
  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-slate-300 text-3xl">info</span>
        </div>
        <p className="text-sm font-headline font-bold text-slate-400">
          No {tabKey} detected in sequence.
        </p>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Neural verify complete</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div 
          key={i} 
          className="group p-3 rounded-lg border border-slate-100 bg-white hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all text-sm"
        >
          <div className="flex items-center justify-between mb-1">
             <span className="font-bold text-on-surface font-headline bg-primary/5 px-2 py-0.5 rounded text-xs text-primary truncate max-w-[200px]">
                {tabKey === "amounts" ? item.raw : tabKey === "dates" ? item.raw : item.name}
             </span>
             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Confidence Path</span>
          </div>
          {(tabKey === "dates" || tabKey === "names") && (
            <p className="text-[11px] leading-relaxed text-slate-500 font-body line-clamp-2 italic border-l-2 border-slate-100 pl-2 mt-2">
              "...{item.context}..."
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
