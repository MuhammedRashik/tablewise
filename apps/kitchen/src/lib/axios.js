import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL:      BASE_URL,
  timeout:      10000,
  withCredentials: true,
  headers:      { "Content-Type": "application/json" },
});

// Inject token from store on every request
api.interceptors.request.use((config) => {
  // Kitchen reads token from localStorage directly —
  // no Zustand circular import needed here
  const raw = localStorage.getItem("tw-kitchen-auth");
  if (raw) {
    const { token } = JSON.parse(raw);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, Promise.reject);

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || "Error";
    const status  = err.response?.status;
    return Promise.reject({ message, status });
  }
);

export default api;