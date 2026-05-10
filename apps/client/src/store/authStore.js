import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * authStore — persisted to localStorage.
 * Survives page reload — customer stays logged in.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:  null,
      token: null,

      // Called after OTP verify succeeds
      setAuth: (user, token) => set({ user, token }),

      // Update user fields (e.g. after profile change)
      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      // Clear everything — called on logout or 401
      logout: () => set({ user: null, token: null }),

      // Convenience getters
      isLoggedIn: () => !!get().token,
      getToken:   () => get().token,
    }),
    {
      name: "tw-auth",       // localStorage key
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);