import api from "../lib/axios";

export const queueApi = {
  join: (restaurantId, partySize, notes = "") =>
    api.post(`/queue/${restaurantId}/join`, { partySize, notes }),

  selectTable: (restaurantId, tableId, partySize, notes = "") =>
    api.post(`/queue/${restaurantId}/select-table`, {
      tableId, partySize, notes
    }),

  getPosition: (queueEntryId) =>
    api.get(`/queue/entry/${queueEntryId}`),

  leave: (queueEntryId) =>
    api.delete(`/queue/entry/${queueEntryId}/leave`),

  getAvailableTables: (restaurantId, partySize) =>
    api.get(`/restaurants/${restaurantId}/tables?status=available&partySize=${partySize}`),
};