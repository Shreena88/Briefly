import React from "react";
import { useDocumentStore } from "./store/documentStore";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import DashboardView from "./components/dashboard/DashboardView";
import SettingsView from "./components/settings/SettingsView";
import LibraryView from "./components/library/LibraryView";
import BatchView from "./components/batch/BatchView";
import SplitView from "./components/viewer/SplitView";
import SummaryCard from "./components/results/SummaryCard";
import EntityPanel from "./components/results/EntityPanel";

export default function App() {
  const { activeDocument, uploadState, currentView } = useDocumentStore();

  const isProcessing = uploadState === "uploading" || uploadState === "processing";

  const renderContent = () => {
    // If a document is active and we are NOT in special views, show verification layout
    if (activeDocument && (currentView === "dashboard" || currentView === "verification")) {
      return <ResultsLayout doc={activeDocument} isProcessing={isProcessing} />;
    }

    switch (currentView) {
      case "settings":
        return <SettingsView />;
      case "library":
        return <LibraryView />;
      case "batch":
        return <BatchView />;
      case "verification":
        return activeDocument ? <ResultsLayout doc={activeDocument} isProcessing={isProcessing} /> : <div className="p-12 text-center text-slate-400">Please upload a document to begin verification.</div>;
      case "dashboard":
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-surface">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 ml-64">
        <Header />
        
        <main className="flex-1 min-h-0 overflow-y-auto mt-16 scrollbar-thin">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function ResultsLayout({ doc, isProcessing }) {
  const handleExportTXT = () => {
    // Failsafe direct-to-file download
    const url = `http://localhost:8005/api/documents/${doc.document_id}/export-txt`;
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${doc.filename.split('.')[0]}_archival_extraction.txt`);
    document.body.appendChild(link);
    link.click();
    
    // Immediate cleanup
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface font-headline tracking-tighter">Verification View</h2>
          <p className="text-on-surface-variant font-body mt-1">Audit neural extraction against original archival scans.</p>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right border-l border-slate-200 pl-6">
              <p className="text-sm font-bold font-headline text-on-surface truncate max-w-[200px]">{doc.filename}</p>
              <p className="text-xs text-slate-500 font-bold uppercase">{doc.page_count} Pages • {Math.round(doc.file_size_bytes / 1024)} KB</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[600px]">
        {/* Left: split view (image + OCR text) */}
        <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200/10 overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0">
            <SplitView document={doc} />
          </div>
        </div>

        {/* Right: summary + entities */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-thin">
          <SummaryCard
            summary={doc.summary}
            processingTimeMs={doc.processing_time_ms}
            pageCount={doc.page_count}
            fileSizeBytes={doc.file_size_bytes}
          />
          <EntityPanel entities={doc.entities || []} />
        </div>
      </div>
    </div>
  );
}
