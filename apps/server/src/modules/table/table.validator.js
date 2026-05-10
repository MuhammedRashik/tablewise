import { body, param } from "express-validator";

// ── BULK CREATE ───────────────────────────────────────
export const validateBulkCreate = [
  body("tables")
    .isArray({ min: 1 })
    .withMessage("tables must be a non-empty array"),

  body("tables.*.tableNumber")
    .trim()
    .notEmpty()
    .withMessage("Each table must have a tableNumber"),

  body("tables.*.capacity")
    .isInt({ min: 1, max: 20 })
    .withMessage("Capacity must be between 1 and 20"),

  body("tables.*.location")
    .optional()
    .trim()
    .isLength({ max: 80 })
    .withMessage("Location hint too long"),
];

// ── UPDATE STATUS ─────────────────────────────────────
export const validateUpdateStatus = [
  param("tableId")
    .isMongoId()
    .withMessage("Invalid table ID"),

  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["available", "occupied", "cleaning", "reserved", "inactive"])
    .withMessage("Invalid status value"),
];

// ── SINGLE CREATE ─────────────────────────────────────
export const validateSingleCreate = [
  body("tableNumber")
    .trim()
    .notEmpty()
    .withMessage("Table number is required"),

  body("capacity")
    .isInt({ min: 1, max: 20 })
    .withMessage("Capacity must be between 1 and 20"),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 80 })
    .withMessage("Location hint too long"),
];

// ── TABLE ID ──────────────────────────────────────────
export const validateTableId = [
  param("tableId")
    .isMongoId()
    .withMessage("Invalid table ID"),
];
