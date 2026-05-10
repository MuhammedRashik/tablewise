import axios from "axios";
import { useAuthStore } from "../store/authStore";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4001/api";

const api = axios.create({
  baseURL:      BASE_URL,
  timeout:      15000,
  withCredentials: true,
  headers:      { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, Promise.reject);

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || "Something went wrong";
    const status  = err.response?.status;
    if (status === 401) useAuthStore.getState().logout();
    return Promise.reject({ message, status, errors: err.response?.data?.errors });
  }
);

export default api;