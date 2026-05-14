import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useOrderStore = create(
  persist(
    (set, get) => ({
      cart:              [],
      activeOrder:       null,
      allSessionOrders:  [], // ← NEW: tracks all orders this session
      tableId:           null,

      // ── Cart actions ──────────────────────────────────────────────────
      addToCart: (item) => {
        const existing = get().cart.find((i) => i.menuItemId === item.menuItemId);
        if (existing) {
          set((state) => ({
            cart: state.cart.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          }));
        } else {
          set((state) => ({
            cart: [...state.cart, { ...item, quantity: 1, notes: "" }],
          }));
        }
      },

      removeFromCart: (menuItemId) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.menuItemId !== menuItemId),
        })),

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) { get().removeFromCart(menuItemId); return; }
        set((state) => ({
          cart: state.cart.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ cart: [] }),

      // ── Order actions ─────────────────────────────────────────────────
      setActiveOrder: (order, tableId) =>
        set((state) => ({
          activeOrder:      order,
          tableId,
          // Add to session orders — avoid duplicates
          allSessionOrders: state.allSessionOrders.find((o) => o._id === order._id)
            ? state.allSessionOrders
            : [...state.allSessionOrders, order],
        })),

      // Update a specific order's status and items in both places
      updateOrderStatus: (status, items, orderId) =>
        set((state) => {
          const targetId = orderId || state.activeOrder?._id;
          const updateOrder = (o) =>
            o._id === targetId
              ? { ...o, status, items: items || o.items }
              : o;
          return {
            activeOrder: state.activeOrder?._id === targetId
              ? updateOrder(state.activeOrder)
              : state.activeOrder,
            allSessionOrders: state.allSessionOrders.map(updateOrder),
          };
        }),

      clearOrder: () =>
        set({ activeOrder: null, tableId: null, allSessionOrders: [] }),

      // ── Computed ──────────────────────────────────────────────────────
      cartTotal: () =>
        get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0),

      cartCount: () =>
        get().cart.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "tw-order",
      partialize: (state) => ({
        cart:             state.cart,
        activeOrder:      state.activeOrder,
        allSessionOrders: state.allSessionOrders,
        tableId:          state.tableId,
      }),
    }
  )
);