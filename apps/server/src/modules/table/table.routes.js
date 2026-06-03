import express from "express";

// mergeParams → access :restaurantId from parent route
const router = express.Router({ mergeParams: true });

import {
  bulkCreateTables,
  createTable,
  getTables,
  updateTableStatus,
  deleteTable,
} from "./table.controller.js";

import {
  validateBulkCreate,
  validateUpdateStatus,
  validateSingleCreate,
  validateTableId,
} from "./table.validator.js";

import { validate } from "../../middlewares/validate.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorise } from "../../middlewares/role.middleware.js";

// ── All routes require auth ───────────────────────────
router.use(protect);

// ── BULK CREATE ───────────────────────────────────────
router.post(
  "/bulk",
  authorise("owner"),
  validateBulkCreate,
  validate,
  bulkCreateTables
);

// ── SINGLE CREATE ─────────────────────────────────────
router.post(
  "/",
  authorise("owner"),
  validateSingleCreate,
  validate,
  createTable
);

// ── GET TABLES ────────────────────────────────────────
router.get(
  "/",
  authorise("owner", "staff", "customer"),
  getTables
);

// ── UPDATE STATUS ─────────────────────────────────────
router.patch(
  "/:tableId/status",
  authorise("owner", "staff"),
  validateUpdateStatus,
  validate,
  updateTableStatus
);

// ── DELETE TABLE ──────────────────────────────────────
router.delete(
  "/:tableId",
  authorise("owner"),
  validateTableId,
  validate,
  deleteTable
);

export default router;
