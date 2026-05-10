import api from "../lib/axios";

export const orderApi = {
  getActive:        (restaurantId)             => api.get(`/orders/${restaurantId}/active`),
  getByTable:       (restaurantId, tableId)    => api.get(`/orders/${restaurantId}/table/${tableId}`),
  updateStatus:     (restaurantId, id, status) => api.patch(`/orders/${restaurantId}/${id}/status`, { status }),
  updateItemStatus: (restaurantId, id, itemId, status) =>
    api.patch(`/orders/${restaurantId}/${id}/items/${itemId}/status`, { status }),
  markPaid:         (restaurantId, id)         => api.patch(`/orders/${restaurantId}/${id}/pay`),
  cancel:           (restaurantId, id)         => api.patch(`/orders/${restaurantId}/${id}/cancel`),
};