const Bull = require("bull");

// Parse the Redis URL to handle both local redis:// and Upstash rediss://
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const isTLS = REDIS_URL.startsWith("rediss://");

const redisOptions = isTLS
  ? {
      tls: {
        rejectUnauthorized: false, // required for Upstash
      },
    }
  : {};

const autoBumpQueue = new Bull("auto-bump-queue", {
  redis: REDIS_URL,
  settings: {
    stalledInterval:     30000,
    lockDuration:        30000,
    maxStalledCount:     1,
  },
  defaultJobOptions: {
    attempts:       3,
    backoff:        { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail:   false,
  },
  // Pass TLS options when using Upstash
  ...(isTLS && {
    createClient: () => {
      const Redis = require("ioredis");
      return new Redis(REDIS_URL, {
        tls: { rejectUnauthorized: false },
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
    },
  }),
});

module.exports = { autoBumpQueue };