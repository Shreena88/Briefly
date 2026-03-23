import { create } from "zustand";

export const useDocumentStore = create((set) => ({
  // Active document being viewed
  activeDocument: null,
  setActiveDocument: (doc) => set({ activeDocument: doc }),

  // Upload state: idle | uploading | processing | done | error
  uploadState: "idle",
  uploadProgress: 0,
  uploadError: null,

  setUploading: (progress) =>
    set({ uploadState: "uploading", uploadProgress: progress, uploadError: null }),

  setProcessing: () =>
    set({ uploadState: "processing", uploadProgress: 100 }),

  setDone: (doc) =>
    set({ uploadState: "done", activeDocument: doc, uploadError: null }),

  setError: (msg) =>
    set({ uploadState: "error", uploadError: msg }),

  reset: () =>
    set({
      uploadState: "idle",
      uploadProgress: 0,
      uploadError: null,
      activeDocument: null,
    }),

  // Current view: dashboard | verification | library | batch | settings
  currentView: "dashboard",
  setCurrentView: (view) => set({ currentView: view }),

  // History list of processed documents
  history: [],
  addToHistory: (doc) =>
    set((state) => ({
      history: [
        { id: doc.document_id, filename: doc.filename, ts: Date.now() },
        ...state.history.slice(0, 49),
      ],
    })),
}));
