import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4001";
let socket = null;

/**
 * Always creates a fresh socket with the given token.
 * Called on login AND on every page refresh.
 */
export const connectSocket = (token) => {
  // Fully destroy any existing instance first
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token: `Bearer ${token}` },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    // KEY FIX: do not auto-connect — we connect manually below
    // so the auth token is guaranteed to be set first
    autoConnect: false,
  });

  // Now connect after auth is configured
  socket.connect();

  if (import.meta.env.DEV) {
    socket.on("connect",       () => console.log("[Kitchen] Connected:", socket.id));
    socket.on("disconnect",    (r) => console.log("[Kitchen] Disconnected:", r));
    socket.on("connect_error", (e) => console.error("[Kitchen] Error:", e.message));
  }

  return socket;
};

export const getSocket   = () => socket;
export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};