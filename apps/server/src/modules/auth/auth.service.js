import jwt from "jsonwebtoken";
import { User, USER_ROLES } from "./auth.model.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  generateOtp,
  storeOtp,
  verifyOtp,
  sendOtp,
} from "../../utils/otpHelper.js";

// 🔹 Token helpers
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
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { _id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );
};

// 🔹 CUSTOMER: Send OTP
export const sendOtpService = async (redisClient, phone) => {
  const otp = generateOtp();
  await storeOtp(redisClient, phone, otp);
  await sendOtp(phone, otp);

  return { message: "OTP sent successfully" };
};

// 🔹 CUSTOMER: Verify OTP
export const verifyOtpService = async (redisClient, { phone, name, otp }) => {
  // verify OTP first
  const result = await verifyOtp(redisClient, phone, otp);
  console.log(result,'resklt');
  

  if (!result.valid) {
    throw ApiError(400, result.reason);
  }

  let user = await User.findOne({ phone });

  if (!user) {
    if (!name) {
      throw ApiError(400, "Name is required for first-time registration");
    }

    user = await User.create({
      name,
      phone,
      role: USER_ROLES.CUSTOMER,
    });
  }

  if (!user.isActive) {
    throw ApiError(403, "Your account has been deactivated");
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user._id);

  return { user, accessToken, refreshToken };
};

// 🔹 STAFF: Register
export const registerStaffService = async ({
  name,
  email,
  password,
  role,
}) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw ApiError(409, "An account with this email already exists");
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

// 🔹 STAFF: Login
export const loginStaffService = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw ApiError(403, "Your account has been deactivated");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw ApiError(401, "Invalid email or password");
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user._id);

  return { user, accessToken, refreshToken };
};

// 🔹 Get current user
export const getMeService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError(404, "User not found");
  }

  return user;
};
