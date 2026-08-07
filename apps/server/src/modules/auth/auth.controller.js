import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

import {
  verifyFirebaseTokenService,
  registerStaffService,
  loginStaffService,
  getMeService,
} from "./auth.service.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

// ── POST /api/auth/firebase/verify ────────────────────────────────────────
// Customer sends Firebase ID token → gets our JWT back

export const verifyFirebaseToken = asyncHandler(async (req, res) => {
  const { firebaseToken, name } = req.body;


  if (!firebaseToken) {
    throw  ApiError(400, "Firebase token is required");
  }

  const { user, accessToken, refreshToken } =
    await verifyFirebaseTokenService(firebaseToken, name);

    
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

// ── POST /api/auth/staff/register ─────────────────────────────────────────

export const registerStaff = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const { user, accessToken, refreshToken } =
    await registerStaffService({
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
        "Staff account created"
      )
    );
});

// ── POST /api/auth/staff/login ────────────────────────────────────────────

export const loginStaff = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } =
    await loginStaffService({
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

// ── POST /api/auth/logout ─────────────────────────────────────────────────

export const logout = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .json(
       ApiResponse(
        200,
        {},
        "Logged out successfully"
      )
    );
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────

export const getMe = asyncHandler(async (req, res) => {
  const user = await getMeService(req.user._id);

  return res
    .status(200)
    .json(
       ApiResponse(
        200,
        { user },
        "User fetched successfully"
      )
    );
});