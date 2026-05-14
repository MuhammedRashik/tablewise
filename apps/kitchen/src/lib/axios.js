import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL:         BASE_URL,
  timeout:         10000,
  withCredentials: true,
  headers:         { "Content-Type": "application/json" },
});

// ── Request interceptor — inject JWT ─────────────────────────────────────
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("tw-kitchen-auth");
    if (raw) {
      const parsed = JSON.parse(raw);

      // Zustand persist wraps everything inside a "state" key
      // Structure: { state: { token, restaurantId, staffName }, version: 0 }
      const token = parsed?.state?.token || parsed?.token || null;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.error("[Kitchen Axios] Failed to read token:", err.message);
  }
  return config;
}, Promise.reject);

// ── Response interceptor ──────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || "Error";
    const status  = err.response?.status;

    if (status === 401) {
      console.warn("[Kitchen] 401 received — token may be invalid or missing");
    }

    return Promise.reject({ message, status });
  }
);

export default api;