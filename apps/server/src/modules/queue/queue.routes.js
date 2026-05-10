import express from "express";
const router = express.Router();

import {
  joinQueue,
  getQueuePosition,
  getRestaurantQueue,
  confirmEntry,
  callCustomer,
  seatCustomer,
  leaveQueue,
  bumpCustomer,
  markNoShow,
} from "./queue.controller.js";

import {
  validateJoinQueue,
  validateQueueId,
  validateRestaurantId,
} from "./queue.validator.js";

import { validate } from "../../middlewares/validate.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorise } from "../../middlewares/role.middleware.js";

// ── All routes require authentication ─────────────────────────────────────
router.use(protect);

// ── Customer routes ───────────────────────────────────────────────────────

// Join queue
router.post(
  "/:restaurantId/join",
  authorise("customer"),
  validateRestaurantId,
  validateJoinQueue,
  validate,
  joinQueue
);

// Get my position
router.get(
  "/entry/:queueId",
  authorise("customer"),
  validateQueueId,
  validate,
  getQueuePosition
);

// Leave queue
router.delete(
  "/entry/:queueId/leave",
  authorise("customer"),
  validateQueueId,
  validate,
  leaveQueue
);

// ── Staff / Owner routes ──────────────────────────────────────────────────

// Full queue board
router.get(
  "/:restaurantId",
  authorise("owner", "staff"),
  validateRestaurantId,
  validate,
  getRestaurantQueue
);

// Confirm presence
router.patch(
  "/:restaurantId/entry/:queueId/confirm",
  authorise("owner", "staff"),
  validateRestaurantId,
  validateQueueId,
  validate,
  confirmEntry
);

// Call customer
router.patch(
  "/:restaurantId/entry/:queueId/call",
  authorise("owner", "staff"),
  validateRestaurantId,
  validateQueueId,
  validate,
  callCustomer
);

// Seat customer
router.patch(
  "/:restaurantId/entry/:queueId/seat",
  authorise("owner", "staff"),
  validateRestaurantId,
  validateQueueId,
  validate,
  seatCustomer
);

// Bump customer
router.patch(
  "/:restaurantId/entry/:queueId/bump",
  authorise("owner", "staff"),
  validateRestaurantId,
  validateQueueId,
  validate,
  bumpCustomer
);

// Mark no-show
router.patch(
  "/:restaurantId/entry/:queueId/no-show",
  authorise("owner", "staff"),
  validateRestaurantId,
  validateQueueId,
  validate,
  markNoShow
);

export default router;
