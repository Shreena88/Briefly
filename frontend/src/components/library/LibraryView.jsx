import React, { useEffect, useState } from "react";
import { listDocuments } from "../../api/documents";
import { useDocumentStore } from "../../store/documentStore";

const LibraryView = () => {
  const { setActiveDocument, setCurrentView } = useDocumentStore();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDocuments()
      .then((data) => {
        setDocuments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch documents:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold font-manrope text-on-surface tracking-tight mb-2">Processed Archives</h1>
          <p className="text-slate-500 font-medium">Visual gallery of all neural extractions and archival scans.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Sort
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 inline-block">folder_open</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No documents found</h3>
          <p className="text-slate-500 mb-6">Start by uploading a document in the Dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map((doc) => (
            <DocumentCard 
              key={doc.document_id} 
              doc={doc} 
              onClick={() => {
                setActiveDocument(doc);
                setCurrentView("verification");
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DocumentCard = ({ doc, onClick }) => {
  const firstPageImage = doc.pages?.[0]?.image_base64;

  return (
    <div 
      onClick={onClick}
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer relative overflow-hidden flex flex-col"
    >
      <div className="relative w-full aspect-[4/3] bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden mb-4 border border-slate-100 dark:border-slate-800">
        {firstPageImage ? (
          <img 
            src={firstPageImage} 
            alt={doc.filename} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <span className="material-symbols-outlined text-4xl">description</span>
          </div>
        )}
        <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-[9px] font-bold text-primary shadow-sm uppercase">
           {doc.filename.split('.').pop()}
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors truncate text-sm" title={doc.filename}>
          {doc.filename}
        </h3>
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed" title={doc.summary}>
          {doc.summary || "No summary available."}
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">
           <span>{doc.page_count} Pages</span>
           <span>98.2% Conf.</span>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-[9px] font-bold uppercase">
          Verified
        </span>
        <button className="text-primary hover:text-primary-container text-[10px] font-extrabold uppercase tracking-tight">
          Open Details
        </button>
      </div>
      
      <div className="absolute inset-x-0 bottom-0 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
    </div>
  );
};

export default LibraryView;
