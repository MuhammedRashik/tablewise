import api from "../lib/axios";

export const menuApi = {
  getPublic: (restaurantId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.isVeg !== undefined) params.append("isVeg", filters.isVeg);
    if (filters.category)            params.append("category", filters.category);
    return api.get(`/menu/${restaurantId}/public?${params.toString()}`);
  },
};