import express from "express";

import {
  createRestaurant,
  getRestaurantPublic,
  getMyRestaurant,
  updateRestaurant,
  updateSettings,
  getQrCode,
  regenerateQr,
  toggleQueue,
  deactivateRestaurant,
} from "./restaurant.controller.js";

import {
  validateCreateRestaurant,
  validateUpdateSettings,
  validateRestaurantId,
} from "./restaurant.validator.js";

import { validate } from "../../middlewares/validate.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorise } from "../../middlewares/role.middleware.js";

const router = express.Router();

// ── PUBLIC ─────────────────────────────────────────────

// QR scan → customer
router.get(
  "/public/:restaurantId",
  validateRestaurantId,
  validate,
  getRestaurantPublic
);

// ── PROTECTED ─────────────────────────────────────────

// Create restaurant
router.post(
  "/",
  protect,
  authorise("owner", "super_admin"),
  validateCreateRestaurant,
  validate,
  createRestaurant
);

// Get my restaurant
router.get(
  "/me",
  protect,
  authorise("owner", "staff", "super_admin"),
  getMyRestaurant
);

// Get QR
router.get(
  "/:restaurantId/qr",
  protect,
  authorise("owner"),
  validateRestaurantId,
  validate,
  getQrCode
);

// Regenerate QR
router.post(
  "/:restaurantId/qr/regenerate",
  protect,
  authorise("owner"),
  validateRestaurantId,
  validate,
  regenerateQr
);

// Update restaurant
router.patch(
  "/:restaurantId",
  protect,
  authorise("owner"),
  validateRestaurantId,
  validate,
  updateRestaurant
);

// Update settings
router.patch(
  "/:restaurantId/settings",
  protect,
  authorise("owner"),
  validateRestaurantId,
  validateUpdateSettings,
  validate,
  updateSettings
);

// Toggle queue
router.patch(
  "/:restaurantId/queue/toggle",
  protect,
  authorise("owner", "staff"),
  validateRestaurantId,
  validate,
  toggleQueue
);

// Deactivate
router.delete(
  "/:restaurantId",
  protect,
  authorise("owner"),
  validateRestaurantId,
  validate,
  deactivateRestaurant
);

export default router;
