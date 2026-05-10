import api from "../lib/axios";

export const restaurantApi = {
  // Public — no auth needed, called on QR scan
  getPublic: (restaurantId) =>
    api.get(`/restaurants/public/${restaurantId}`),
};