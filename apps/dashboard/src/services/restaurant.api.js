import api from "../lib/axios";

export const restaurantApi = {
  getMe:           ()           => api.get("/restaurants/me"),
  update:          (id, data)   => api.patch(`/restaurants/${id}`, data),
  updateSettings:  (id, data)   => api.patch(`/restaurants/${id}/settings`, { settings: data }),
  toggleQueue:     (id, isOpen) => api.patch(`/restaurants/${id}/queue/toggle`, { isOpen }),
  getQr:           (id)         => api.get(`/restaurants/${id}/qr`),
  regenerateQr:    (id)         => api.post(`/restaurants/${id}/qr/regenerate`),
};

