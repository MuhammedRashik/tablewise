import api from "../lib/axios";

export const orderApi = {
  getActive: (restaurantId) =>
    api.get(`/orders/${restaurantId}/active`),

  updateStatus: (restaurantId, orderId, status) =>
    api.patch(`/orders/${restaurantId}/${orderId}/status`, { status }),

  updateItemStatus: (restaurantId, orderId, itemId, status) =>
    api.patch(`/orders/${restaurantId}/${orderId}/items/${itemId}/status`, { status }),
};