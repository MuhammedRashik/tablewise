import api from "../lib/axios";

export const authApi = {
  // Customer — Firebase token exchange
  verifyFirebaseToken: (firebaseToken, name) =>
    api.post("/auth/firebase/verify", { firebaseToken, name }),

  // Staff — email + password (kept for dashboard/kitchen)
  getMe:   () => api.get("/auth/me"),
  logout:  () => api.post("/auth/logout"),
};