import mongoose from "mongoose";
import { QUEUE_STATUS, Queue } from "./queue.model.js";
import { Restaurant } from "../restaurant/restaurant.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { autoBumpQueue } from "./queue.jobs.js";
import {
  findAvailableTableService,
  assignTableToQueueService,
  releaseTableService
} from "../table/table.service.js";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const calculateEWT = (positionsAhead, availableTables, avgTurnoverMinutes) => {
  const tables = Math.max(availableTables, 1);
  return Math.ceil((positionsAhead * avgTurnoverMinutes) / tables);
};

export const recalculatePositions = async (restaurantId) => {
  const activeEntries = await Queue.find({
    restaurantId,
    status: {
      $in: [
        QUEUE_STATUS.WAITING,
        QUEUE_STATUS.CONFIRMED,
        QUEUE_STATUS.CALLED,
      ],
    },
  }).sort({ joinedAt: 1 });

  const bulkOps = activeEntries.map((entry, index) => ({
    updateOne: {
      filter: { _id: entry._id },
      update: { $set: { position: index + 1 } },
    },
  }));

  if (bulkOps.length) {
    await Queue.bulkWrite(bulkOps);
  }

  return activeEntries.length;
};

const scheduleAutoBump = async (queueEntryId, restaurantId, autoBumpMinutes) => {
  const delayMs = autoBumpMinutes * 60 * 1000;

  const job = await autoBumpQueue.add(
    {
      queueEntryId: queueEntryId.toString(),
      restaurantId: restaurantId.toString(),
    },
    { delay: delayMs, jobId: `bump-${queueEntryId}` }
  );

  return job.id.toString();
};

const cancelAutoBump = async (jobId) => {
  if (!jobId) return;

  try {
    const job = await autoBumpQueue.getJob(jobId);
    if (job) await job.remove();
  } catch {
    // ignore
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export const joinQueueService = async (restaurantId, customer, partySize, notes) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw  ApiError(404, "Restaurant not found");

  if (!restaurant.settings.isQueueOpen) {
    throw  ApiError(423, "Queue is closed");
  }

  const alreadyInQueue = await Queue.findOne({
    restaurantId,
    customerId: customer._id,
    status: {
      $in: [
        QUEUE_STATUS.WAITING,
        QUEUE_STATUS.CONFIRMED,
        QUEUE_STATUS.CALLED,
      ],
    },
  });

  if (alreadyInQueue) {
    throw  ApiError(409, "Already in queue");
  }

  const currentQueueSize = await Queue.countDocuments({
    restaurantId,
    status: {
      $in: [
        QUEUE_STATUS.WAITING,
        QUEUE_STATUS.CONFIRMED,
        QUEUE_STATUS.CALLED,
      ],
    },
  });

  if (currentQueueSize >= restaurant.settings.maxQueueSize) {
    throw  ApiError(503, "Queue full");
  }

  const availableTable = await findAvailableTableService(restaurantId, partySize);

  const entry = await Queue.create({
    restaurantId,
    customerId: customer._id,
    customerName: customer.name,
    customerPhone: customer.phone,
    partySize,
    notes: notes || null,
    status: availableTable ? QUEUE_STATUS.CALLED : QUEUE_STATUS.WAITING,
    joinedAt: new Date(),
  });


if (availableTable) {
  await assignTableToQueueService(availableTable._id, entry._id);

  entry.assignedTableId = availableTable._id;  // ← must be _id, NOT tableNumber
  entry.calledAt        = new Date();
  entry.position        = 1;
  entry.estimatedWaitMinutes = 0;

  const jobId = await scheduleAutoBump(
    entry._id,
    restaurantId,
    restaurant.settings.autoBumpMinutes
  );
  entry.autoBumpJobId = jobId;

  await entry.save();

  return {
    entry,
    immediateTable: availableTable,
    message: "Table available! Please proceed to your table.",
  };
}

  const totalActive = await recalculatePositions(restaurantId);
  const updatedEntry = await Queue.findById(entry._id);

  const { Table } = await import("../table/table.model.js");

  const availableCount = await Table.countDocuments({
    restaurantId,
    status: "available",
    capacity: { $gte: partySize },
    isActive: true,
  });

  const positionsAhead = (updatedEntry.position || totalActive) - 1;

  const ewt = calculateEWT(
    positionsAhead,
    availableCount,
    restaurant.settings.avgTurnoverMinutes
  );

  updatedEntry.estimatedWaitMinutes = ewt;
  await updatedEntry.save();

  return {
    entry: updatedEntry,
    immediateTable: null,
    message: `You are #${updatedEntry.position}`,
  };
};

export const getQueuePositionService = async (queueId, customerId) => {
  const entry = await Queue.findOne({
    _id: queueId,
    customerId,
  }).populate("assignedTableId", "tableNumber capacity");

  if (!entry) throw  ApiError(404, "Not found");

  if (entry.status === QUEUE_STATUS.SEATED) {
    return { entry, message: "Already seated" };
  }

  const restaurant = await Restaurant.findById(entry.restaurantId).select("settings");

  const { Table } = await import("../table/table.model.js");

  const availableCount = await Table.countDocuments({
    restaurantId: entry.restaurantId,
    status: "available",
    capacity: { $gte: entry.partySize },
    isActive: true,
  });

  const positionsAhead = Math.max((entry.position || 1) - 1, 0);

  const ewt = calculateEWT(
    positionsAhead,
    availableCount,
    restaurant.settings.avgTurnoverMinutes
  );

  entry.estimatedWaitMinutes = ewt;
  await entry.save();

  return {
    entry,
    positionsAhead,
    estimatedWaitMinutes: ewt,
  };
};

export const getRestaurantQueueService = async (restaurantId) => {
  const entries = await Queue.find({
    restaurantId,
    status: {
      $in: [
        QUEUE_STATUS.WAITING,
        QUEUE_STATUS.CONFIRMED,
        QUEUE_STATUS.CALLED,
      ],
    },
  })
    .sort({ position: 1 })
    .populate("assignedTableId", "tableNumber capacity");

  return { entries };
};

export const confirmEntryService = async (queueId, restaurantId) => {
  const entry = await Queue.findOne({ _id: queueId, restaurantId });
  if (!entry) throw  ApiError(404, "Not found");

  entry.status = QUEUE_STATUS.CONFIRMED;
  entry.confirmedAt = new Date();
  await entry.save();

  return entry;
};

export const callCustomerService = async (queueId, restaurantId) => {
  const entry = await Queue.findOne({
    _id: queueId,
    restaurantId,
    status: { $in: [QUEUE_STATUS.WAITING, QUEUE_STATUS.CONFIRMED] },
  });

  if (!entry) {
    throw new ApiError(404, "Queue entry not found or already called/seated");
  }

  const availableTable = await findAvailableTableService(
    restaurantId,
    entry.partySize
  );

  if (!availableTable) {
    throw new ApiError(503, "No available table fits this party size right now");
  }

  const restaurant = await Restaurant.findById(restaurantId).select("settings");

  await assignTableToQueueService(availableTable._id, entry._id);

  entry.status          = QUEUE_STATUS.CALLED;
  entry.assignedTableId = availableTable._id;  // ← _id not tableNumber
  entry.calledAt        = new Date();

  const jobId = await scheduleAutoBump(
    entry._id,
    restaurantId,
    restaurant.settings.autoBumpMinutes
  );
  entry.autoBumpJobId = jobId;

  await entry.save();

  return { entry, table: availableTable };
};

export const seatCustomerService = async (queueId, restaurantId) => {
  const entry = await Queue.findOne({ _id: queueId, restaurantId });

  await cancelAutoBump(entry.autoBumpJobId);

  entry.status = QUEUE_STATUS.SEATED;
  entry.seatedAt = new Date();
  entry.autoBumpJobId = null;

  await entry.save();

  await recalculatePositions(restaurantId);

  return entry;
};

export const leaveQueueService = async (queueId, customerId) => {
  const entry = await Queue.findOne({
    _id: queueId,
    customerId,
    status: {
      $in: [
        QUEUE_STATUS.WAITING,
        QUEUE_STATUS.CONFIRMED,
        QUEUE_STATUS.CALLED,
      ],
    },
  });

  if (!entry) {
    throw  ApiError(404, "Active queue entry not found");
  }

  if (entry.assignedTableId) {
    await releaseTableService(entry.assignedTableId);
  }

  await cancelAutoBump(entry.autoBumpJobId);

  entry.status        = QUEUE_STATUS.LEFT;
  entry.leftAt        = new Date();
  entry.autoBumpJobId = null;

  await entry.save();

  await recalculatePositions(entry.restaurantId);

  return {
    message: "You have left the queue successfully.",
    restaurantId: entry.restaurantId,
  };
};

export const bumpCustomerService = async (queueId, restaurantId) => {
  const entry = await Queue.findOne({ _id: queueId, restaurantId });

  if (entry.assignedTableId) {
    await releaseTableService(entry.assignedTableId);
  }

  await cancelAutoBump(entry.autoBumpJobId);

  entry.status = QUEUE_STATUS.BUMPED;
  entry.leftAt = new Date();

  await entry.save();

  await recalculatePositions(restaurantId);

  return entry;
};

export const markNoShowService = async (queueId, restaurantId) => {
  const entry = await Queue.findOne({ _id: queueId, restaurantId });

  if (entry.assignedTableId) {
    await releaseTableService(entry.assignedTableId);
  }

  await cancelAutoBump(entry.autoBumpJobId);

  entry.status = QUEUE_STATUS.NO_SHOW;
  entry.leftAt = new Date();

  await entry.save();

  await recalculatePositions(restaurantId);

  return entry;
};
