import mongoose from "mongoose";
import { Table, TABLE_STATUS } from "./table.model.js";
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
  newStatus
) => {
  const table = await Table.findOne({ _id: tableId, restaurantId });

  if (!table) {
    throw  ApiError(404, "Table not found");
  }

  const validTransitions = {
    available: ["occupied", "reserved", "inactive"],
    occupied: ["cleaning", "available"],
    cleaning: ["available", "inactive"],
    reserved: ["occupied", "available", "inactive"],
    inactive: ["available"],
  };

  if (!validTransitions[table.status].includes(newStatus)) {
    throw  ApiError(400, "Invalid status transition");
  }

  if (
    newStatus === TABLE_STATUS.AVAILABLE ||
    newStatus === TABLE_STATUS.CLEANING
  ) {
    table.currentQueueEntryId = null;
    table.occupiedAt = null;
  }

  if (newStatus === TABLE_STATUS.OCCUPIED) {
    table.occupiedAt = new Date();
  }

  table.status = newStatus;
  await table.save();

  return table;
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
