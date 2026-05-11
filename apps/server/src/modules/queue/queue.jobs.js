import Bull from "bull";
import Redis from "ioredis";

// Parse Redis URL
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const isTLS = REDIS_URL.startsWith("rediss://");

const redisOptions = isTLS
  ? {
      tls: {
        rejectUnauthorized: false, // required for Upstash
      },
    }
  : {};

// Create Bull queue
export const autoBumpQueue = new Bull("auto-bump-queue", {
  redis: REDIS_URL,

  settings: {
    stalledInterval: 30000,
    lockDuration: 30000,
    maxStalledCount: 1,
  },

  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },

  // TLS support for Upstash
  ...(isTLS && {
    createClient: () => {
      return new Redis(REDIS_URL, {
        ...redisOptions,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
    },
  }),
});