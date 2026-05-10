import axios from "axios";
import { useAuthStore } from "../store/authStore";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4001/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true, // send cookies (refreshToken)
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — inject JWT ─────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    // Read token directly from store (works outside React components)
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle errors globally ────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response.data, // unwrap { success, data, message }
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    const status = error.response?.status;

    // Auto-logout on 401
    if (status === 401) {
      useAuthStore.getState().logout();
    }

    // Return a clean error object — no raw Axios error leaking into components
    return Promise.reject({ message, status, errors: error.response?.data?.errors });
  }
);

export default axiosInstance;