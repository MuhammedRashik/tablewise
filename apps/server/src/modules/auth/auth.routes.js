import express from "express";

import {
  sendOtp,
  verifyOtpAndLogin,
  registerStaff,
  loginStaff,
  logout,
  getMe,
} from "./auth.controller.js";

import {
  validateCustomerRegister,
  validateStaffRegister,
  validateStaffLogin,
  validateOtpVerify,
} from "./auth.validator.js";

import { validate } from "../../middlewares/validate.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorise } from "../../middlewares/role.middleware.js";

const router = express.Router();

// ── Customer routes ───────────────────────────────────────────────────────

// Send OTP
router.post(
  "/send-otp",
  validateCustomerRegister,
  validate,
  sendOtp
);

// Verify OTP → login/register
router.post(
  "/verify-otp",
  validateOtpVerify,
  validate,
  verifyOtpAndLogin
);

// ── Staff / Owner routes ──────────────────────────────────────────────────

// Register staff
router.post(
  "/staff/register",
  validateStaffRegister,
  validate,
  registerStaff
);

// Login staff
router.post(
  "/staff/login",
  validateStaffLogin,
  validate,
  loginStaff
);

// ── Protected routes ──────────────────────────────────────────────────────

// Logout
router.post("/logout", protect, logout);

// Get current user
router.get("/me", protect, getMe);

export default router;
