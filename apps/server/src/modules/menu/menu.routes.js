import express from "express";

import {
  createMenuItem,
  bulkCreateMenuItems,
  getMenuPublic,
  getMenuFull,
  getMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
} from "./menu.controller.js";

import {
  validateCreateItem,
  validateUpdateItem,
  validateBulkCreate,
  validateToggleAvailability,
  validateItemId,
  validateRestaurantId,
} from "./menu.validator.js";

import { validate } from "../../middlewares/validate.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorise } from "../../middlewares/role.middleware.js";

const router = express.Router({ mergeParams: true });

// ── Public — no auth ──────────────────────────────────────────────────────
router.get(
  "/:restaurantId/public",
  validateRestaurantId,
  validate,
  getMenuPublic
);

// ── Protected below this line ─────────────────────────────────────────────
router.use(protect);

// Create single item — owner only
router.post(
  "/:restaurantId",
  authorise("owner"),
  validateRestaurantId,
  validateCreateItem,
  validate,
  createMenuItem
);

// Bulk create — owner only
router.post(
  "/:restaurantId/bulk",
  authorise("owner"),
  validateRestaurantId,
  validateBulkCreate,
  validate,
  bulkCreateMenuItems
);

// Get full menu — staff + owner
router.get(
  "/:restaurantId",
  authorise("owner", "staff"),
  validateRestaurantId,
  validate,
  getMenuFull
);

// Get single item — staff + owner
router.get(
  "/:restaurantId/item/:itemId",
  authorise("owner", "staff"),
  validateRestaurantId,
  validateItemId,
  validate,
  getMenuItem
);

// Update item — owner only
router.patch(
  "/:restaurantId/item/:itemId",
  authorise("owner"),
  validateUpdateItem,
  validate,
  updateMenuItem
);

// Toggle availability — staff or owner
router.patch(
  "/:restaurantId/item/:itemId/availability",
  authorise("owner", "staff"),
  validateToggleAvailability,
  validate,
  toggleAvailability
);

// Delete item — owner only
router.delete(
  "/:restaurantId/item/:itemId",
  authorise("owner"),
  validateRestaurantId,
  validateItemId,
  validate,
  deleteMenuItem
);

export default router;
