import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useDocumentUpload } from "../../hooks/useDocumentUpload";
import { useDocumentStore } from "../../store/documentStore";

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/tiff": [".tiff", ".tif"],
  "image/bmp": [".bmp"],
};

export default function DropZone({ variant = "normal" }) {
  const { upload } = useDocumentUpload();
  const { uploadState, uploadProgress, uploadError } = useDocumentStore();

  const onDrop = useCallback(
    (accepted) => {
      if (accepted.length > 0) upload(accepted[0]);
    },
    [upload]
  );

  const isProcessing = uploadState === "uploading" || uploadState === "processing";

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    disabled: isProcessing,
  });

  if (variant === "large") {
    return (
      <div
        {...getRootProps()}
        className={`relative h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center py-16 px-6 group cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "bg-primary/10 border-primary shadow-inner"
            : "bg-surface-container-low/30 border-slate-200 hover:bg-primary/[0.02] hover:border-primary/30"
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
        </div>
        
        <h3 className="text-2xl font-bold font-headline mb-2 text-on-surface">
          Drop archival documents here
        </h3>
        
        <p className="text-on-surface-variant text-center max-w-md mb-8 font-body">
          Securely ingest high-resolution scans for neural entity extraction. 
          Supported formats: <span className="font-mono text-xs font-bold text-slate-500">PDF, PNG, JPG (MAX 50MB)</span>
        </p>
        
        <button className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all font-headline">
          Click to Upload
        </button>

        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10 p-6 transition-opacity">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <h4 className="text-xl font-bold text-primary animate-pulse font-headline mb-2">Neural Analysis Active</h4>
            <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              {uploadState === "uploading" ? `Uploading: ${uploadProgress}%` : "Processing OCR Layers..."}
            </p>
          </div>
        )}

        {uploadError && (
          <div className="absolute top-4 inset-x-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300 shadow-xl shadow-red-500/10">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-500/20">
               <span className="material-symbols-outlined font-bold">priority_high</span>
            </div>
            <div className="text-left flex-1 min-w-0">
               <p className="font-extrabold text-red-900 dark:text-red-400 text-sm font-headline">Ingestion Blocked</p>
               <p className="text-red-700 dark:text-red-500 text-xs font-bold mt-0.5 truncate">{uploadError}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Normal variant (fallback for other views)
  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
        isDragActive
          ? "border-primary bg-primary/5 shadow-inner"
          : "border-slate-200 hover:border-primary/30 hover:bg-slate-50"
      } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input {...getInputProps()} />
      <div className="flex items-center justify-center gap-4">
        <span className="material-symbols-outlined text-primary">upload_file</span>
        <span className="text-sm font-headline font-bold text-slate-600">
          {isDragActive ? "Drop to upload" : "Upload replacement document"}
        </span>
      </div>
      {isProcessing && (
         <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/20 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
         </div>
      )}
    </div>
  );
}
