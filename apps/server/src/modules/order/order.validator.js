import { body, param } from "express-validator";

export const validatePlaceOrder = [
  body("tableId")
    .notEmpty().withMessage("Table ID is required")
    .isMongoId().withMessage("Invalid table ID"),

  body("items")
    .isArray({ min: 1 }).withMessage("Order must have at least one item"),

  body("items.*.menuItemId")
    .notEmpty().withMessage("menuItemId is required for each item")
    .isMongoId().withMessage("Invalid menuItemId"),

  body("items.*.quantity")
    .notEmpty().withMessage("Quantity is required for each item")
    .isInt({ min: 1, max: 20 })
    .withMessage("Quantity must be between 1 and 20"),

  body("items.*.notes")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Item note cannot exceed 100 characters"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Order notes cannot exceed 200 characters"),
];

export const validateUpdateOrderStatus = [
  param("orderId")
    .isMongoId().withMessage("Invalid order ID"),

  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["confirmed", "preparing", "served", "billed", "paid", "cancelled"])
    .withMessage("Invalid order status"),
];

export const validateUpdateItemStatus = [
  param("orderId")
    .isMongoId().withMessage("Invalid order ID"),

  param("itemId")
    .isMongoId().withMessage("Invalid item ID"),

  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["pending", "preparing", "served"])
    .withMessage("Item status must be pending, preparing, or served"),
];

export const validateRequestBill = [
  param("orderId")
    .isMongoId().withMessage("Invalid order ID"),

  body("paymentMethod")
    .notEmpty().withMessage("Payment method is required")
    .isIn(["upi", "cash", "card"])
    .withMessage("Payment method must be upi, cash, or card"),
];

export const validateOrderId = [
  param("orderId").isMongoId().withMessage("Invalid order ID"),
];
