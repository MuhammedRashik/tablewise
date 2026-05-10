import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
let socket = null;

export const connectSocket = (token) => {
  if (socket) { socket.disconnect(); socket = null; }

  socket = io(SOCKET_URL, {
    auth:                { token: `Bearer ${token}` },
    transports:          ["websocket", "polling"],
    reconnection:        true,
    reconnectionAttempts: Infinity, // kitchen must never lose connection
    reconnectionDelay:   1000,
    reconnectionDelayMax: 10000,
  });

  socket.connect();
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};