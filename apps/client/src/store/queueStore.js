import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useQueueStore = create(
  persist(
    (set) => ({
      entry:                null,
      restaurantId:         null,
      position:             null,
      ewt:                  0,
      status:               null,
      assignedTableNumber:  null, // ← add this

      setEntry: (entry, tableNumber = null) =>
        set({
          entry,
          restaurantId:        entry.restaurantId,
          position:            entry.position,
          ewt:                 entry.estimatedWaitMinutes,
          status:              entry.status,
          assignedTableNumber: tableNumber || null, // ← store it here
        }),

      updatePosition: (position, ewt) => set({ position, ewt }),

      updateStatus: (status, assignedTableId = null) =>
        set((state) => ({
          status,
          entry: state.entry
            ? { ...state.entry, status, assignedTableId }
            : null,
        })),

      // Add this to update table number when socket fires table-ready
      setTableNumber: (tableNumber) => set({ assignedTableNumber: tableNumber }),

      clearEntry: () =>
        set({
          entry:               null,
          restaurantId:        null,
          position:            null,
          ewt:                 0,
          status:              null,
          assignedTableNumber: null, // ← clear it too
        }),
    }),
    {
      name: "tw-queue",
      partialize: (state) => ({
        entry:               state.entry,
        restaurantId:        state.restaurantId,
        position:            state.position,
        ewt:                 state.ewt,
        status:              state.status,
        assignedTableNumber: state.assignedTableNumber, // ← persist it
      }),
    }
  )
);