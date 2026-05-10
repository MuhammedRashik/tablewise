import Bull from "bull";

export const autoBumpQueue = new Bull("auto-bump-queue", {
  redis: process.env.REDIS_URL || "redis://127.0.0.1:6379",

  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
