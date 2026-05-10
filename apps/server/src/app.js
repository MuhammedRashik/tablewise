import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import restaurantRoutes from "./modules/restaurant/restaurant.routes.js";
import tableRoutes from "./modules/table/table.routes.js";
import queueRoutes from "./modules/queue/queue.routes.js";
import menuRoutes from "./modules/menu/menu.routes.js";
import orderRoutes from "./modules/order/order.routes.js";


const app = express();
console.log(process.env.CORS_ORIGIN,'origin');

// ── Core middleware ───────────────────────────────────────────────────────
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173","http://localhost:5174","http://localhost:5175"],
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// ── Health check ──────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// ── API routes ────────────────────────────────────────────────────────────
app.use("/api/auth",                             authRoutes);
app.use("/api/restaurants",                      restaurantRoutes);
app.use("/api/restaurants/:restaurantId/tables", tableRoutes);
app.use("/api/queue",                            queueRoutes);
app.use("/api/menu",                             menuRoutes);
app.use("/api/orders",                           orderRoutes);


// ── Global error handler (must be last) ───────────────────────────────────
app.use(errorHandler);

export default app;
