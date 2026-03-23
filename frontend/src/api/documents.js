import client from "./client";

/**
 * Upload a single file for OCR + summarization.
 * Returns the full DocumentResponse on success.
 */
export async function uploadDocument(file, onProgress) {
  const form = new FormData();
  form.append("file", file);

  const res = await client.post("/api/documents/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  return res.data;
}

/**
 * Fetch a previously processed document by ID.
 */
export async function getDocument(documentId) {
  const res = await client.get(`/api/documents/${documentId}`);
  return res.data;
}

export const getDocumentStatus = (id) =>
  client.get(`/api/documents/${id}`).then((res) => res.data);

export const listDocuments = () =>
  client.get("/api/documents").then((res) => res.data);
