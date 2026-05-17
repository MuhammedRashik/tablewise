import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

import {
  bulkCreateTablesService,
  createTableService,
  getTablesService,
  updateTableStatusService,
  deleteTableService,
} from "./table.service.js";

// ── BULK CREATE ───────────────────────────────────────
export const bulkCreateTables = asyncHandler(async (req, res) => {
  const tables = await bulkCreateTablesService(
    req.params.restaurantId,
    req.user._id,
    req.body.tables
  );

  return res
    .status(201)
    .json(
      ApiResponse(
        201,
        { tables, count: tables.length },
        `${tables.length} tables created`
      )
    );
});

// ── SINGLE CREATE ─────────────────────────────────────
export const createTable = asyncHandler(async (req, res) => {
  const table = await createTableService(
    req.params.restaurantId,
    req.user._id,
    req.body
  );

  return res
    .status(201)
    .json(ApiResponse(201, { table }, "Table created"));
});

// ── GET TABLES ────────────────────────────────────────
export const getTables = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const result = await getTablesService(req.params.restaurantId, {
    status,
  });

  return res
    .status(200)
    .json(ApiResponse(200, result, "Tables fetched"));
});

// ── UPDATE STATUS ─────────────────────────────────────
export const updateTableStatus = asyncHandler(async (req, res) => {
  // Get io from Express app
  const io = req.app.get("io");

  const table = await updateTableStatusService(
    req.params.tableId,
    req.params.restaurantId,
    req.body.status,
    io  // ← pass io so auto-assign can emit socket events
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { table }, "Table status updated"));
});
// ── DELETE TABLE ──────────────────────────────────────
export const deleteTable = asyncHandler(async (req, res) => {
  const result = await deleteTableService(
    req.params.tableId,
    req.params.restaurantId,
    req.user._id
  );

  return res
    .status(200)
    .json(ApiResponse(200, result, result.message));
});
