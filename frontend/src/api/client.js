import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8005",
  timeout: 300_000, // 5 min — OCR + summarization can be slow
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.detail ||
      err.message ||
      "An unexpected error occurred.";
    return Promise.reject(new Error(msg));
  }
);

export default client;
