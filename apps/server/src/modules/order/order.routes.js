import express from "express";

import {
  placeOrder,
  getOrdersByTable,
  getActiveOrders,
  getOrder,
  updateOrderStatus,
  updateItemStatus,
  requestBill,
  markPaid,
  cancelOrder,
  getMyOrderHistory,
} from "./order.controller.js";

import {
  validatePlaceOrder,
  validateUpdateOrderStatus,
  validateUpdateItemStatus,
  validateRequestBill,
  validateOrderId,
} from "./order.validator.js";

import { validate } from "../../middlewares/validate.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorise } from "../../middlewares/role.middleware.js";

const router = express.Router();

router.use(protect);

// ── Customer routes ───────────────────────────────────────────────────────

// Place order
router.post(
  "/:restaurantId",
  authorise("customer"),
  validatePlaceOrder,
  validate,
  placeOrder
);

// Request bill
router.post(
  "/:restaurantId/:orderId/bill",
  authorise("customer"),
  validateRequestBill,
  validate,
  requestBill
);

// Cancel order
router.patch(
  "/:restaurantId/:orderId/cancel",
  authorise("customer", "staff", "owner"),
  validateOrderId,
  validate,
  cancelOrder
);

// Customer order history
router.get(
  "/my-history",
  authorise("customer"),
  getMyOrderHistory
);

// ── Staff + Kitchen routes ─────────────────────────────────────────────────

// Get orders by table
router.get(
  "/:restaurantId/table/:tableId",
  authorise("owner", "staff", "customer"),
  getOrdersByTable
);

// Get active orders
router.get(
  "/:restaurantId/active",
  authorise("owner", "staff"),
  getActiveOrders
);

// Get single order
router.get(
  "/:restaurantId/:orderId",
  authorise("owner", "staff", "customer"),
  validateOrderId,
  validate,
  getOrder
);

// Update order status
router.patch(
  "/:restaurantId/:orderId/status",
  authorise("owner", "staff"),
  validateUpdateOrderStatus,
  validate,
  updateOrderStatus
);

// Update item status
router.patch(
  "/:restaurantId/:orderId/items/:itemId/status",
  authorise("owner", "staff"),
  validateUpdateItemStatus,
  validate,
  updateItemStatus
);

// Mark paid
router.patch(
  "/:restaurantId/:orderId/pay",
  authorise("owner", "staff"),
  validateOrderId,
  validate,
  markPaid
);

export default router;
