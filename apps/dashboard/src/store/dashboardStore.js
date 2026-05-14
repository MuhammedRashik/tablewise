import { create } from "zustand";

export const useDashboardStore = create((set) => ({
  // Live queue state — populated by Socket.IO
  queueEntries: [],
  queueSummary: { waiting: 0, confirmed: 0, called: 0, total: 0 },

  // Live order state — populated by Socket.IO
  activeOrders: [],
  newOrderAlert: null,    // { orderId, orderNumber, tableId, total }
  billAlert:     null,    // { orderId, orderNumber, tableId, total, paymentMethod }

  // Floor view
  tables: [],

  // UI state
  selectedTab:   "queue", // queue | floor | orders | menu | analytics | settings
  sidebarOpen: typeof window !== "undefined" ? window.innerWidth >= 1024 : true,

  // ── Queue mutations ───────────────────────────────────────────────────
  setQueueData: (entries, summary) => set({ queueEntries: entries, queueSummary: summary }),
  updateQueueEntry: (updatedEntry) =>
    set((s) => ({
      queueEntries: s.queueEntries.map((e) =>
        e._id === updatedEntry._id ? updatedEntry : e
      ),
    })),
  removeQueueEntry: (entryId) =>
    set((s) => ({ queueEntries: s.queueEntries.filter((e) => e._id !== entryId) })),

  // ── Order mutations ───────────────────────────────────────────────────
  setActiveOrders:  (orders)  => set({ activeOrders: orders }),
  addOrder:         (order)   => set((s) => ({ activeOrders: [order, ...s.activeOrders] })),
  updateOrder:      (updated) =>
    set((s) => ({
      activeOrders: s.activeOrders
        .map((o) => o._id === updated.orderId ? { ...o, status: updated.status } : o)
        .filter((o) => !["paid", "cancelled"].includes(o.status)),
    })),
  setNewOrderAlert: (alert)   => set({ newOrderAlert: alert }),
  clearNewOrderAlert: ()      => set({ newOrderAlert: null }),
  setBillAlert:     (alert)   => set({ billAlert: alert }),
  clearBillAlert:   ()        => set({ billAlert: null }),

  // ── Table mutations ───────────────────────────────────────────────────
  setTables:       (tables)  => set({ tables }),
  updateTableStatus: (tableId, status) =>
    set((s) => ({
      tables: s.tables.map((t) => t._id === tableId ? { ...t, status } : t),
    })),

  // ── UI ────────────────────────────────────────────────────────────────
  setSelectedTab: (tab)  => set({ selectedTab: tab }),
  toggleSidebar:  ()     => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));