import { log } from "console";
import { createClient } from "redis";

export const redisClient = createClient({
  url: "redis://localhost:6379",
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
