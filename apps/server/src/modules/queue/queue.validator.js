import { body, param } from "express-validator";

// ── JOIN QUEUE ───────────────────────────────────────
export const validateJoinQueue = [
  body("partySize")
    .notEmpty()
    .withMessage("Party size is required")
    .isInt({ min: 1, max: 20 })
    .withMessage("Party size must be between 1 and 20"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Notes cannot exceed 200 characters"),
];

// ── QUEUE ID ─────────────────────────────────────────
export const validateQueueId = [
  param("queueId")
    .isMongoId()
    .withMessage("Invalid queue entry ID"),
];

// ── RESTAURANT ID ────────────────────────────────────
export const validateRestaurantId = [
  param("restaurantId")
    .isMongoId()
    .withMessage("Invalid restaurant ID"),
];
