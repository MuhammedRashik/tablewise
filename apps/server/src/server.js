import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocketIO } from "./sockets/index.js";
import "./config/env.js";
// Import Bull processor (just for side effects)
import "./jobs/queue.processor.js";
import { connectRedis } from "./config/redis.js";

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  // 1. Connect DB
  await connectDB();

    // 2. Connect Redis (ADD THIS)
  await connectRedis(app);

  // 2. Create HTTP server
  const httpServer = http.createServer(app);

  // 3. Init Socket.IO
  initSocketIO(httpServer, app);

  // 4. Start server
  httpServer.listen(PORT, () => {
    console.log(
      `[Server] Running on port ${PORT} in ${process.env.NODE_ENV} mode`
    );
    console.log(`[Server] Health: http://localhost:${PORT}/health`);
  });

  // 5. Graceful shutdown
  const shutdown = (signal) => {
    console.log(`[Server] ${signal} received — shutting down gracefully`);

    httpServer.close(() => {
      console.log("[Server] HTTP server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer().catch((err) => {
  console.error("[Server] Failed to start:", err);
  process.exit(1);
});
