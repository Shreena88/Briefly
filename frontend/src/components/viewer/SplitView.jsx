import React, { useState } from "react";
import DocumentImage from "./DocumentImage";
import OcrTextPanel from "./OcrTextPanel";
import PageNavigator from "./PageNavigator";

export default function SplitView({ document }) {
  const [currentPage, setCurrentPage] = useState(0);
  const page = document.pages[currentPage];

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Page navigator (only for multi-page docs) */}
      {document.page_count > 1 && (
        <div className="bg-surface-container-low/50 rounded-lg p-2 border border-slate-100">
          <PageNavigator
            total={document.page_count}
            current={currentPage}
            onChange={setCurrentPage}
          />
        </div>
      )}

      {/* Split view */}
      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left: scanned image */}
        <div className="flex-1 min-w-0 rounded-xl overflow-hidden border border-slate-200/20 bg-slate-50 shadow-inner flex flex-col">
          <div className="h-10 px-4 flex items-center justify-between border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">image</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Archival Source Plate</span>
            </div>
            <div className="flex gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <DocumentImage base64={page.image_base64} />
          </div>
        </div>

        {/* Right: OCR text */}
        <div className="flex-[1.4] min-w-0 rounded-xl overflow-hidden border border-slate-200/20 bg-white shadow-sm flex flex-col transition-all">
          <div className="h-10 px-4 flex items-center justify-between border-b border-slate-100 bg-surface-container-low/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">receipt_long</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Binary Text Capture</span>
            </div>
            <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">
               {page.ocr_text.trim().split(/\s+/).filter(x => x).length} TOKENS
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <OcrTextPanel text={page.ocr_text} />
          </div>
        </div>
      </div>
    </div>
  );
}
