import api from "../lib/axios";

export const queueApi = {
  join: (restaurantId, partySize, notes = "") =>
    api.post(`/queue/${restaurantId}/join`, { partySize, notes }),

  getPosition: (queueEntryId) =>
    api.get(`/queue/entry/${queueEntryId}`),

  leave: (queueEntryId) =>
    api.delete(`/queue/entry/${queueEntryId}/leave`),
};