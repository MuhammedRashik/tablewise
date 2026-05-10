import { create } from "zustand";
import { persist } from "zustand/middleware";
import { disconnectSocket } from "../lib/socket";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:         null,
      token:        null,
      restaurantId: null,

      setAuth: (user, token) =>
        set({ user, token, restaurantId: user.restaurantId }),

      logout: () => {
        disconnectSocket();
        set({ user: null, token: null, restaurantId: null });
      },

      isLoggedIn:    () => !!get().token,
      isOwner:       () => get().user?.role === "owner",
      isStaff:       () => ["staff", "owner"].includes(get().user?.role),
      getRestaurant: () => get().restaurantId,
    }),
    {
      name: "tw-dash-auth",
      partialize: (s) => ({ user: s.user, token: s.token, restaurantId: s.restaurantId }),
    }
  )
);