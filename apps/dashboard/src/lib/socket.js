import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
let socket = null;

export const connectSocket = (token) => {
  if (socket) { socket.disconnect(); socket = null; }

  socket = io(SOCKET_URL, {
    auth:                { token: `Bearer ${token}` },
    transports:          ["websocket", "polling"],
    reconnection:        true,
    reconnectionAttempts: 5,
    reconnectionDelay:   1000,
  });

  socket.connect();

  if (import.meta.env.DEV) {
    socket.on("connect",       () => console.log("[Socket] connected:", socket.id));
    socket.on("disconnect",    (r) => console.log("[Socket] disconnected:", r));
    socket.on("connect_error", (e) => console.error("[Socket] error:", e.message));
  }

  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => { socket?.disconnect(); socket = null; };