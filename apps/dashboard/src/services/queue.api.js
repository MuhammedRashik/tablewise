import api from "../lib/axios";

export const queueApi = {
  getAll:   (restaurantId)          => api.get(`/queue/${restaurantId}`),
  confirm:  (restaurantId, queueId) => api.patch(`/queue/${restaurantId}/entry/${queueId}/confirm`),
  call:     (restaurantId, queueId) => api.patch(`/queue/${restaurantId}/entry/${queueId}/call`),
  seat:     (restaurantId, queueId) => api.patch(`/queue/${restaurantId}/entry/${queueId}/seat`),
  bump:     (restaurantId, queueId) => api.patch(`/queue/${restaurantId}/entry/${queueId}/bump`),
  noShow:   (restaurantId, queueId) => api.patch(`/queue/${restaurantId}/entry/${queueId}/no-show`),
};