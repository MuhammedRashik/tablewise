import api from "../lib/axios";

export const authApi = {
  login:  (email, password) => api.post("/auth/staff/login", { email, password }),
  getMe:  ()                => api.get("/auth/me"),
};