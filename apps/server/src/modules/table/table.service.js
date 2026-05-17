import mongoose from "mongoose";
import { Table, TABLE_STATUS } from "./table.model.js";
import { Queue, QUEUE_STATUS } from "../queue/queue.model.js";
import { Restaurant } from "../restaurant/restaurant.model.js";



import { ApiError } from "../../utils/ApiError.js";

// ── Helper: verify restaurant belongs to user ─────────────────────────────
const assertRestaurantOwnership = async (restaurantId, userId) => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    owner: userId,
  });

  if (!restaurant) {
    throw  ApiError(404, "Restaurant not found or you are not the owner");
  }

  return restaurant;
};

// ── BULK CREATE tables ────────────────────────────────────────────────────
export const bulkCreateTablesService = async (
  restaurantId,
  ownerId,
  tablesData
) => {
  await assertRestaurantOwnership(restaurantId, ownerId);

  const numbers = tablesData.map((t) => t.tableNumber);
  const hasDupes = numbers.length !== new Set(numbers).size;

  if (hasDupes) {
    throw  ApiError(400, "Duplicate table numbers found");
  }

  const existing = await Table.find({
    restaurantId,
    tableNumber: { $in: numbers },
  }).select("tableNumber");

  if (existing.length) {
    const taken = existing.map((t) => t.tableNumber).join(", ");
    throw  ApiError(409, `Already exists: ${taken}`);
  }

  const tableDocs = tablesData.map((t) => ({
    ...t,
    restaurantId,
    status: TABLE_STATUS.AVAILABLE,
  }));

  const tables = await Table.insertMany(tableDocs, { ordered: false });

  const total = await Table.countDocuments({ restaurantId, isActive: true });

  await Restaurant.findByIdAndUpdate(restaurantId, {
    "settings.totalTables": total,
  });

  return tables;
};

// ── CREATE single table ───────────────────────────────────────────────────
export const createTableService = async (
  restaurantId,
  ownerId,
  tableData
) => {
  await assertRestaurantOwnership(restaurantId, ownerId);

  const existing = await Table.findOne({
    restaurantId,
    tableNumber: tableData.tableNumber,
  });

  if (existing) {
    throw  ApiError(409, "Table already exists");
  }

  const table = await Table.create({ ...tableData, restaurantId });

  const total = await Table.countDocuments({ restaurantId, isActive: true });

  await Restaurant.findByIdAndUpdate(restaurantId, {
    "settings.totalTables": total,
  });

  return table;
};

// ── GET tables ────────────────────────────────────────────────────────────
export const getTablesService = async (restaurantId, filters = {}) => {
  const query = { restaurantId, isActive: true };

  if (filters.status) {
    query.status = filters.status;
  }

  const tables = await Table.find(query)
    .sort({ tableNumber: 1 })
    .populate("currentQueueEntryId", "customerName partySize joinedAt");

  const summary = await Table.aggregate([
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        isActive: true,
      },
    },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const counts = {
    available: 0,
    occupied: 0,
    cleaning: 0,
    reserved: 0,
  };

  summary.forEach((s) => {
    if (counts[s._id] !== undefined) counts[s._id] = s.count;
  });

  return { tables, counts };
};

// ── UPDATE table status ───────────────────────────────────────────────────
export const updateTableStatusService = async (
  tableId,
  restaurantId,
  newStatus,
  io = null
) => {
  const table = await Table.findOne({
    _id: tableId,
    restaurantId,
  });

  if (!table) {
    throw ApiError(404, "Table not found in this restaurant");
  }

  const validTransitions = {
    available: ["occupied", "cleaning", "reserved", "inactive"],
    occupied: ["cleaning", "available"],
    cleaning: ["available", "inactive"],
    reserved: ["occupied", "available", "inactive"],
    inactive: ["available"],
  };

  if (!validTransitions[table.status]?.includes(newStatus)) {
    throw ApiError(
      400,
      `Cannot transition table from "${table.status}" to "${newStatus}"`
    );
  }

  // Reset occupancy data
  if (
    newStatus === TABLE_STATUS.AVAILABLE ||
    newStatus === TABLE_STATUS.CLEANING
  ) {
    table.currentQueueEntryId = null;
    table.occupiedAt = null;
  }

  // Set occupied time
  if (newStatus === TABLE_STATUS.OCCUPIED) {
    table.occupiedAt = new Date();
  }

  table.status = newStatus;

  await table.save();

  // Auto assign queue when table becomes available
  if (newStatus === TABLE_STATUS.AVAILABLE && io) {
    await tryAutoAssignTable(table, restaurantId, io);
  }

  return table;
};

/**
 * Auto assign next queue customer
 */
const tryAutoAssignTable = async (table, restaurantId, io) => {
  try {
    const {
      emitQueueUpdate,
      emitTableReady,
    } = await import("../../sockets/queue.socket.js");

    const {
      scheduleAutoBump,
    } = await import("../queue/queue.service.js");

    // Find next matching queue entry
    const nextEntry = await Queue.findOne({
      restaurantId,
      status: {
        $in: [QUEUE_STATUS.WAITING, QUEUE_STATUS.CONFIRMED],
      },
      partySize: {
        $lte: table.capacity,
      },
    })
      .sort({ position: 1 })
      .populate("customerId", "name phone");

    if (!nextEntry) {
      console.log(
        `[AutoAssign] Table ${table.tableNumber} free but no matching queue entry`
      );
      return;
    }

    // Assign table
    table.status = TABLE_STATUS.OCCUPIED;
    table.currentQueueEntryId = nextEntry._id;
    table.occupiedAt = new Date();

    await table.save();

    // Get restaurant settings
    const restaurant = await Restaurant.findById(restaurantId).select(
      "settings"
    );

    // Update queue entry
    nextEntry.status = QUEUE_STATUS.CALLED;
    nextEntry.assignedTableId = table._id;
    nextEntry.calledAt = new Date();

    // Schedule auto bump
    const jobId = await scheduleAutoBumpJob(
      nextEntry._id,
      restaurantId,
      restaurant.settings.autoBumpMinutes
    );

    nextEntry.autoBumpJobId = jobId;

    await nextEntry.save();

    console.log(
      `[AutoAssign] Table ${table.tableNumber} → ${nextEntry.customerName} (party of ${nextEntry.partySize})`
    );

    // Notify customer
    emitTableReady(io, nextEntry.customerId._id.toString(), {
      tableNumber: table.tableNumber,
      tableId: table._id,
    });

    // Update queue board
    await emitQueueUpdate(io, restaurantId);

  } catch (err) {
    console.error("[AutoAssign] Failed:", err.message);
  }
};

/**
 * Schedule auto bump job
 */
const scheduleAutoBumpJob = async (
  queueEntryId,
  restaurantId,
  autoBumpMinutes
) => {
  const { autoBumpQueue } = await import("../queue/queue.jobs.js");

  const delayMs = autoBumpMinutes * 60 * 1000;

  const job = await autoBumpQueue.add(
    {
      queueEntryId: queueEntryId.toString(),
      restaurantId: restaurantId.toString(),
    },
    {
      delay: delayMs,
      jobId: `bump-${queueEntryId}`,
    }
  );

  return job.id.toString();
};

// ── FIND available table ──────────────────────────────────────────────────
export const findAvailableTableService = async (
  restaurantId,
  partySize
) => {
  const table = await Table.findOne({
    restaurantId,
    status: TABLE_STATUS.AVAILABLE,
    capacity: { $gte: partySize },
    isActive: true,
  }).sort({ capacity: 1 });

  // Make sure you're returning the full document
  // NOT just table.tableNumber or table._id
  return table; // full Mongoose document — _id is available as table._id
};

// ── ASSIGN table ──────────────────────────────────────────────────────────
export const assignTableToQueueService = async (
  tableId,
  queueEntryId
) => {
  const table = await Table.findByIdAndUpdate(
    tableId,
    {
      status: TABLE_STATUS.OCCUPIED,
      currentQueueEntryId: queueEntryId,
      occupiedAt: new Date(),
    },
    { new: true }
  );

  if (!table) throw  ApiError(404, "Table not found");

  return table;
};

// ── RELEASE table ─────────────────────────────────────────────────────────
export const releaseTableService = async (tableId) => {
  const table = await Table.findByIdAndUpdate(
    tableId,
    {
      status: TABLE_STATUS.CLEANING,
      currentQueueEntryId: null,
      occupiedAt: null,
    },
    { new: true }
  );

  if (!table) throw  ApiError(404, "Table not found");

  return table;
};

// ── DELETE table ──────────────────────────────────────────────────────────
export const deleteTableService = async (
  tableId,
  restaurantId,
  ownerId
) => {
  await assertRestaurantOwnership(restaurantId, ownerId);

  const table = await Table.findOne({ _id: tableId, restaurantId });

  if (!table) throw  ApiError(404, "Table not found");

  if (table.status === TABLE_STATUS.OCCUPIED) {
    throw  ApiError(400, "Table is occupied");
  }

  table.isActive = false;
  table.status = TABLE_STATUS.INACTIVE;

  await table.save();

  const total = await Table.countDocuments({ restaurantId, isActive: true });

  await Restaurant.findByIdAndUpdate(restaurantId, {
    "settings.totalTables": total,
  });

  return { message: `Table ${table.tableNumber} removed` };
};
