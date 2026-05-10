import api from "../lib/axios";

export const authApi = {
  sendOtp: (name, phone) =>
    api.post("/auth/send-otp", { name, phone }),

  verifyOtp: (phone, otp, name) =>
    api.post("/auth/verify-otp", { phone, otp, name }),

  getMe: () =>
    api.get("/auth/me"),

  logout: () =>
    api.post("/auth/logout"),
};
