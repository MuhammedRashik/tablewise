import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

import {
  sendOtpService,
  verifyOtpService,
  registerStaffService,
  loginStaffService,
  getMeService,
} from "./auth.service.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// ── POST /auth/send-otp ───────────────────────────────────────────────
export const sendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const redisClient = req.app.get("redisClient");
console.log(redisClient,'this is redis client');

  const result = await sendOtpService(redisClient, phone);

  return res
    .status(200)
    .json(ApiResponse(200, result, "OTP sent successfully"));
});

// ── POST /auth/verify-otp ─────────────────────────────────────────────
export const verifyOtpAndLogin = asyncHandler(async (req, res) => {
  const { phone, otp, name } = req.body;
  const redisClient = req.app.get("redisClient");
console.log(redisClient,'redisClient');

  const { user, accessToken, refreshToken } = await verifyOtpService(
    redisClient,
    { phone, otp, name }
  );

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    .json(
      ApiResponse(
        200,
        { user, accessToken },
        "Logged in successfully"
      )
    );
});

// ── POST /auth/staff/register ─────────────────────────────────────────
export const registerStaff = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const { user, accessToken, refreshToken } = await registerStaffService({
    name,
    email,
    password,
    role,
  });

  return res
    .status(201)
    .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    .json(
      ApiResponse(
        201,
        { user, accessToken },
        "Staff account created successfully"
      )
    );
});

// ── POST /auth/staff/login ────────────────────────────────────────────
export const loginStaff = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginStaffService({
    email,
    password,
  });

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    .json(
      ApiResponse(
        200,
        { user, accessToken },
        "Logged in successfully"
      )
    );
});

// ── POST /auth/logout ─────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .json(ApiResponse(200, {}, "Logged out successfully"));
});

// ── GET /auth/me ──────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  const user = await getMeService(req.user._id);

  return res
    .status(200)
    .json(
      ApiResponse(200, { user }, "User fetched successfully")
    );
});
