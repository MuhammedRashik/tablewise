import { body, param } from "express-validator";

export const validateCreateRestaurant = [
  body("name")
    .trim()
    .notEmpty().withMessage("Restaurant name is required")
    .isLength({ max: 100 }).withMessage("Name cannot exceed 100 characters"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10-digit Indian mobile number"),

  body("address.city")
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage("City name too long"),

  body("address.pincode")
    .optional()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage("Enter a valid 6-digit pincode"),

  body("cuisine")
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage("Cuisine name too long"),
];

export const validateUpdateSettings = [
  body("settings.totalTables")
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage("Total tables must be between 1 and 500"),

  body("settings.autoBumpMinutes")
    .optional()
    .isInt({ min: 2, max: 60 })
    .withMessage("Auto-bump must be between 2 and 60 minutes"),

  body("settings.avgTurnoverMinutes")
    .optional()
    .isInt({ min: 5, max: 300 })
    .withMessage("Avg turnover must be between 5 and 300 minutes"),

  body("settings.maxQueueSize")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("Max queue size must be between 1 and 200"),

  body("settings.isQueueOpen")
    .optional()
    .isBoolean()
    .withMessage("isQueueOpen must be true or false"),
];

export const validateRestaurantId = [
  param("restaurantId")
    .isMongoId()
    .withMessage("Invalid restaurant ID"),
];
