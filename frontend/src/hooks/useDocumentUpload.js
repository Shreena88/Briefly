import { useDocumentStore } from "../store/documentStore";
import { uploadDocument } from "../api/documents";

export function useDocumentUpload() {
  const { setUploading, setProcessing, setDone, setError, reset, addToHistory } =
    useDocumentStore();

  const upload = async (file) => {
    reset();
    try {
      setUploading(0);
      const result = await uploadDocument(file, (pct) => {
        // Once upload hits 100% the server is still processing
        if (pct >= 100) {
          setProcessing();
        } else {
          setUploading(pct);
        }
      });
      setDone(result);
      addToHistory(result);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Archival ingestion failed. Please verify connection.";
      setError(msg);
    }
  };

  return { upload };
}
