import { body, param } from "express-validator";
import { MENU_CATEGORY } from "./menu.model.js";

export const validateCreateItem = [
  body("name")
    .trim()
    .notEmpty().withMessage("Item name is required")
    .isLength({ max: 100 }).withMessage("Name cannot exceed 100 characters"),

  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("category")
    .notEmpty().withMessage("Category is required")
    .isIn(Object.values(MENU_CATEGORY))
    .withMessage(`Category must be one of: ${Object.values(MENU_CATEGORY).join(", ")}`),

  body("isVeg")
    .notEmpty().withMessage("isVeg is required")
    .isBoolean().withMessage("isVeg must be true or false"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage("Description cannot exceed 300 characters"),

  body("spiceLevel")
    .optional()
    .isIn(["mild", "medium", "hot", "extra_hot"])
    .withMessage("Invalid spice level"),

  body("tags")
    .optional()
    .isArray().withMessage("Tags must be an array"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 }).withMessage("Sort order must be a non-negative integer"),
];

export const validateUpdateItem = [
  param("itemId")
    .isMongoId().withMessage("Invalid item ID"),

  body("name")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Name cannot exceed 100 characters"),

  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("category")
    .optional()
    .isIn(Object.values(MENU_CATEGORY))
    .withMessage("Invalid category"),

  body("isVeg")
    .optional()
    .isBoolean().withMessage("isVeg must be true or false"),

  body("isAvailable")
    .optional()
    .isBoolean().withMessage("isAvailable must be true or false"),

  body("spiceLevel")
    .optional()
    .isIn(["mild", "medium", "hot", "extra_hot"])
    .withMessage("Invalid spice level"),
];

export const validateBulkCreate = [
  body("items")
    .isArray({ min: 1 }).withMessage("items must be a non-empty array"),

  body("items.*.name")
    .trim()
    .notEmpty().withMessage("Each item must have a name"),

  body("items.*.price")
    .isFloat({ min: 0 }).withMessage("Each item must have a valid price"),

  body("items.*.category")
    .isIn(Object.values(MENU_CATEGORY))
    .withMessage("Invalid category in items"),

  body("items.*.isVeg")
    .isBoolean().withMessage("isVeg must be true or false for each item"),
];

export const validateToggleAvailability = [
  param("itemId")
    .isMongoId().withMessage("Invalid item ID"),

  body("isAvailable")
    .notEmpty().withMessage("isAvailable is required")
    .isBoolean().withMessage("isAvailable must be true or false"),
];

export const validateItemId = [
  param("itemId").isMongoId().withMessage("Invalid item ID"),
];

export const validateRestaurantId = [
  param("restaurantId").isMongoId().withMessage("Invalid restaurant ID"),
];
