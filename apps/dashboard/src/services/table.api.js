import api from "../lib/axios";

export const tableApi = {
  getAll:       (restaurantId)                  => api.get(`/restaurants/${restaurantId}/tables`),
  bulkCreate:   (restaurantId, tables)          => api.post(`/restaurants/${restaurantId}/tables/bulk`, { tables }),
  create:       (restaurantId, data)            => api.post(`/restaurants/${restaurantId}/tables`, data),
  updateStatus: (restaurantId, tableId, status) => api.patch(`/restaurants/${restaurantId}/tables/${tableId}/status`, { status }),
  remove:       (restaurantId, tableId)         => api.delete(`/restaurants/${restaurantId}/tables/${tableId}`),
};