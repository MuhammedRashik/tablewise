import { Server } from "socket.io";
import { socketAuthMiddleware } from "./middleware/socket.auth.js";
import { registerQueueHandlers } from "./queue.socket.js";
import { registerOrderHandlers } from "./order.socket.js";

/**
 * Initialise Socket.IO on the HTTP server
 */
export const initSocketIO = (httpServer, app) => {
  const io = new Server(httpServer, {
    cors: {
      origin:
        process.env.CORS_ORIGIN?.split(",") || [
          "http://localhost:5173",
          "http://localhost:5174",
        ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
  });

  // ── Global auth middleware ──────────────────────────────────────────────
  io.use(socketAuthMiddleware);

  // ── Connection handler ──────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const user = socket.user;

    console.log(
      `[Socket.IO] Connected: ${user.role} "${user.name}" (socketId: ${socket.id})`
    );

    // Register feature handlers
    registerQueueHandlers(io, socket);
    registerOrderHandlers(io, socket);

    // ── Socket-level error handler ────────────────────────────────────────
    socket.on("error", (err) => {
      console.error(
        `[Socket.IO] Error on socket ${socket.id}:`,
        err.message
      );
    });
  });

  // ── Make io available in controllers ────────────────────────────────────
  app.set("io", io);

  // ── Engine-level errors ────────────────────────────────────────────────
  io.engine.on("connection_error", (err) => {
    console.error("[Socket.IO Engine Error]", err.code, err.message);
  });

  console.log("[Socket.IO] Initialised successfully");

  return io;
};
