import { autoBumpQueue } from "../modules/queue/queue.jobs.js";
import { bumpCustomerService } from "../modules/queue/queue.service.js";
import {
  emitQueueUpdate,
  emitCustomerBumped,
} from "../sockets/queue.socket.js";

// IMPORTANT: avoid circular require for app
import app from "../app.js";

autoBumpQueue.process(async (job) => {
  const { queueEntryId, restaurantId } = job.data;

  console.log(`[AutoBump] Processing job ${job.id} for entry ${queueEntryId}`);

  try {
    const entry = await bumpCustomerService(queueEntryId, restaurantId);

    // Get io from Express app
    const io = app.get("io");

    if (io) {
      await emitQueueUpdate(io, restaurantId);
      emitCustomerBumped(io, entry.customerId.toString());
    }

    console.log(`[AutoBump] Entry ${queueEntryId} bumped + socket events emitted`);

  } catch (err) {
    // Entry already seated/left — silently skip
    console.log(`[AutoBump] Skipped ${queueEntryId}: ${err.message}`);
  }
});

autoBumpQueue.on("failed", (job, err) => {
  console.error(`[AutoBump] Job ${job.id} failed permanently:`, err.message);
});

autoBumpQueue.on("completed", (job) => {
  console.log(`[AutoBump] Job ${job.id} completed`);
});

console.log("[Bull] Auto-bump queue processor registered");
