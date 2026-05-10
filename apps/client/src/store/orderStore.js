import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * orderStore — manages cart state and active order.
 * Cart lives here until order is placed; active order tracks status.
 */
export const useOrderStore = create(
  persist(
    (set, get) => ({
      // Cart — array of { menuItemId, name, price, isVeg, quantity, notes }
      cart: [],

      // Active placed order
      activeOrder: null,
      tableId:     null,

      // ── Cart actions ────────────────────────────────────────────────────
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
        if (quantity <= 0) {
          get().removeFromCart(menuItemId);
          return;
        }
        set((state) => ({
          cart: state.cart.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        }));
      },

      updateItemNote: (menuItemId, notes) =>
        set((state) => ({
          cart: state.cart.map((i) =>
            i.menuItemId === menuItemId ? { ...i, notes } : i
          ),
        })),

      clearCart: () => set({ cart: [] }),

      // ── Order actions ───────────────────────────────────────────────────
      setActiveOrder: (order, tableId) => set({ activeOrder: order, tableId }),

      updateOrderStatus: (status, items) =>
        set((state) => ({
          activeOrder: state.activeOrder
            ? { ...state.activeOrder, status, items: items || state.activeOrder.items }
            : null,
        })),

      clearOrder: () => set({ activeOrder: null, tableId: null }),

      // ── Computed values ─────────────────────────────────────────────────
      cartTotal: () =>
        get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0),

      cartCount: () =>
        get().cart.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "tw-order",
      partialize: (state) => ({
        cart:        state.cart,
        activeOrder: state.activeOrder,
        tableId:     state.tableId,
      }),
    }
  )
);