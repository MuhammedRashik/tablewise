import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL;

export const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    tls: true, // important for Upstash
    rejectUnauthorized: false,
  },
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

export const connectRedis = async (app) => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected ✅");
  }

  app.set("redisClient", redisClient);
};