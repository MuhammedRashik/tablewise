import api from "../lib/axios";

export const authApi = {
  login:  (email, password) => api.post("/auth/staff/login",    { email, password }),
  register: (data)          => api.post("/auth/staff/register", data),
  getMe:  ()                => api.get("/auth/me"),
  logout: ()                => api.post("/auth/logout"),
};