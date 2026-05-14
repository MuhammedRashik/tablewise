import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * kitchenStore
 *
 * auth      — staff token + restaurantId (persisted)
 * orders    — live KOT orders (NOT persisted — always fresh from socket)
 * connected — socket connection state
 */
export const useKitchenStore = create(
  persist(
    (set, get) => ({
      // ── Auth (persisted) ─────────────────────────────────────────────
      token:        null,
      restaurantId: null,
      staffName:    null,

      setAuth: (token, restaurantId, staffName) =>
        set({ token, restaurantId, staffName }),

      logout: () => set({ token: null, restaurantId: null, staffName: null }),

      isLoggedIn: () => !!get().token,

      // ── Socket state (not persisted) ──────────────────────────────────
      connected: false,
      setConnected: (val) => set({ connected: val }),

      // ── Orders (not persisted — live from socket) ─────────────────────
      orders: [],

      // Initial load from API
      setOrders: (orders) => set({ orders }),

      // New KOT arrives via socket
      addOrder: (order) =>
        set((s) => ({
          // Prevent duplicates
          orders: s.orders.find((o) => o._id === order._id)
            ? s.orders
            : [{ ...order, isNew: true }, ...s.orders],
        })),

      // Clear the "new" flash after animation
      clearNewFlag: (orderId) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o._id === orderId ? { ...o, isNew: false } : o
          ),
        })),

      // Update order status (confirmed, preparing, served etc.)
     updateOrderStatus: (orderId, status) =>
  set((s) => ({
    orders: s.orders
      .map((o) => o._id === orderId ? { ...o, status } : o)
      // Remove from kitchen board when done
      .filter((o) => !["served", "paid", "cancelled"].includes(o.status)),
  })),

      // Update individual item status
      updateItemStatus: (orderId, itemId, status) =>
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o._id !== orderId) return o;
            const items = o.items.map((i) =>
              i._id === itemId ? { ...i, status } : i
            );
            // Auto-advance order if all items served
            const allServed = items.every((i) => i.status === "served");
            return {
              ...o,
              items,
              status: allServed && o.status === "preparing" ? "served" : o.status,
            };
          }),
        })),

      // Remove order from board
      removeOrder: (orderId) =>
        set((s) => ({
          orders: s.orders.filter((o) => o._id !== orderId),
        })),

      // Computed
      getOrdersByStatus: (status) =>
        get().orders.filter((o) => o.status === status),

      getUrgentOrders: () =>
        get().orders.filter((o) => {
          const mins = Math.floor((Date.now() - new Date(o.createdAt)) / 60000);
          return mins > 20;
        }),
    }),
    {
      name: "tw-kitchen-auth",
      // Only persist auth fields — not orders
      partialize: (s) => ({
        token:        s.token,
        restaurantId: s.restaurantId,
        staffName:    s.staffName,
      }),
    }
  )
);