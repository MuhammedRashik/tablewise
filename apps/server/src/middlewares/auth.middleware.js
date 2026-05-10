import jwt from "jsonwebtoken";
import { User } from "../modules/auth/auth.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  // Token from header or cookie
  let token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return next(ApiError(401, "Access token is missing. Please log in."));
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(
        ApiError(401, "Access token has expired. Please log in again.")
      );
    }
    return next(ApiError(401, "Invalid access token."));
  }

  const user = await User.findById(decoded._id);

  if (!user) {
    return next(
      ApiError(401, "User belonging to this token no longer exists.")
    );
  }

  if (!user.isActive) {
    return next(ApiError(403, "Your account has been deactivated."));
  }

  // attach user
  req.user = user;

  next();
});
