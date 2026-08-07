import jwt from "jsonwebtoken";
import app from "../../config/firebase.js";
import { getAuth } from "firebase-admin/auth";
import { User } from "./auth.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { USER_ROLES } from "../../../../../packages/types/user.types.js";

// ── Token generators ──────────────────────────────────────────────────────
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      role: user.role,
      phone: user.phone,
      email: user.email,
      restaurantId: user.restaurantId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { _id: userId },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

// ── FIREBASE: Verify token → login or register customer ───────────────────
export const verifyFirebaseTokenService = async (firebaseToken, name) => {
  // 1. Verify the Firebase ID token
 let decoded;
  try {
    
    
     decoded = await getAuth(app).verifyIdToken(firebaseToken);
  } catch (err) {
    console.error("[Firebase] Token verify failed:", err.message);
    throw  ApiError(
      401,
      "Invalid or expired Firebase token. Please try again."
    );
  }
console.log(decoded,'decoded');
  // 2. Extract phone number
  const fullPhone = decoded.phone_number;

  if (!fullPhone) {
    throw  ApiError(400, "No phone number in Firebase token");
  }

  // Strip +91 → store as 10 digit number
  let phone = fullPhone;

  if (phone.startsWith("+91")) {
    phone = phone.slice(3);
  } else if (phone.startsWith("+")) {
    phone = phone.slice(1);
  }

  // 3. Find or create customer
  let user = await User.findOne({ phone });

  if (!user) {
    if (!name || !name.trim()) {
      throw  ApiError(
        400,
        "Name is required for first time registration"
      );
    }

    user = await User.create({
      name: name.trim(),
      phone,
      role: USER_ROLES.CUSTOMER,
    });

    console.log(`[Auth] New customer created: ${name} (${phone})`);
  } else {
    console.log(`[Auth] Existing customer login: ${user.name} (${phone})`);
  }

  if (!user.isActive) {
    throw  ApiError(403, "Your account has been deactivated");
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // 4. Issue our JWT
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user._id);

  return { user, accessToken, refreshToken };
};

// ── STAFF/OWNER: Register ─────────────────────────────────────────────────
export const registerStaffService = async ({
  name,
  email,
  password,
  role,
}) => {
  const existing = await User.findOne({ email });

  if (existing) {
    throw  ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || USER_ROLES.STAFF,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user._id);

  return { user, accessToken, refreshToken };
};

// ── STAFF/OWNER: Login ────────────────────────────────────────────────────
export const loginStaffService = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw  ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw  ApiError(403, "Your account has been deactivated");
  }

  const isValid = await user.isPasswordCorrect(password);

  if (!isValid) {
    throw  ApiError(401, "Invalid email or password");
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user._id);

  return { user, accessToken, refreshToken };
};

// ── Get current user ──────────────────────────────────────────────────────
export const getMeService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw  ApiError(404, "User not found");
  }

  return user;
};