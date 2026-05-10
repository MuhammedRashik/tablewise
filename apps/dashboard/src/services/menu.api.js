import api from "../lib/axios";

export const menuApi = {
  getAll:             (restaurantId)          => api.get(`/menu/${restaurantId}`),
  create:             (restaurantId, data)    => api.post(`/menu/${restaurantId}`, data),
  bulkCreate:         (restaurantId, items)   => api.post(`/menu/${restaurantId}/bulk`, { items }),
  update:             (restaurantId, id, data)=> api.patch(`/menu/${restaurantId}/item/${id}`, data),
  toggleAvailability: (restaurantId, id, val) => api.patch(`/menu/${restaurantId}/item/${id}/availability`, { isAvailable: val }),
  remove:             (restaurantId, id)      => api.delete(`/menu/${restaurantId}/item/${id}`),
};