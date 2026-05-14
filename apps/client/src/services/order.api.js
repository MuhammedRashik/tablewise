import api from "../lib/axios";

export const orderApi = {
  place: (restaurantId, tableId, items, notes = "") =>
    api.post(`/orders/${restaurantId}`, { tableId, items, notes }),

  getByTable: (restaurantId, tableId) =>
    api.get(`/orders/${restaurantId}/table/${tableId}`),

  getOne: (restaurantId, orderId) =>
    api.get(`/orders/${restaurantId}/${orderId}`),

  requestBill: (restaurantId, orderId, paymentMethod) =>
    api.post(`/orders/${restaurantId}/${orderId}/bill`, { paymentMethod }),

  cancel:      (restaurantId, orderId) =>             
    api.patch(`/orders/${restaurantId}/${orderId}/cancel`),

  getHistory: (page = 1, limit = 10) =>
    api.get(`/orders/my-history?page=${page}&limit=${limit}`),
};