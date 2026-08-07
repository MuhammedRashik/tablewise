import express from "express";

const router = express.Router();

import {
  verifyFirebaseToken,
  registerStaff,
  loginStaff,
  logout,
  getMe,
} from "./auth.controller.js";

import {
  validateStaffRegister,
  validateStaffLogin,
} from "./auth.validator.js";

import { validate } from "../../middlewares/validate.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorise } from "../../middlewares/role.middleware.js";

// ── Customer — Firebase phone auth ────────────────────────────────────────
// Customer verifies OTP on frontend via Firebase SDK
// Then sends the Firebase ID token here to get our JWT
router.post(
  "/firebase/verify",
  verifyFirebaseToken
);

// ── Staff / Owner — email + password ─────────────────────────────────────
router.post(
  "/staff/register",
  validateStaffRegister,
  validate,
  registerStaff
);

router.post(
  "/staff/login",
  validateStaffLogin,
  validate,
  loginStaff
);

// ── Protected ─────────────────────────────────────────────────────────────
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;