import { io } from "socket.io-client";
import { useAuthStore } from "../store/authStore";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

let socketInstance = null;

/**
 * Get or create the Socket.IO singleton.
 * Call connect() once after login — the same instance is reused everywhere.
 */
export const getSocket = () => {
  if (!socketInstance) {
    const token = useAuthStore.getState().token;

    socketInstance = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: false, // we connect manually after auth
    });

    // Global socket event logging in dev
    if (import.meta.env.DEV) {
      socketInstance.on("connect", () =>
        console.log("[Socket] Connected:", socketInstance.id)
      );
      socketInstance.on("disconnect", (reason) =>
        console.log("[Socket] Disconnected:", reason)
      );
      socketInstance.on("connect_error", (err) =>
        console.error("[Socket] Error:", err.message)
      );
    }
  }

  return socketInstance;
};

/**
 * Connect socket with a fresh token.
 * Call this right after the customer verifies OTP and gets their token.
 */
export const connectSocket = (token) => {
  // Destroy existing instance if token changed
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  socketInstance = io(SOCKET_URL, {
    auth: { token: `Bearer ${token}` },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socketInstance.connect();
  return socketInstance;
};

/**
 * Disconnect and destroy socket — call on logout.
 */
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export default getSocket;