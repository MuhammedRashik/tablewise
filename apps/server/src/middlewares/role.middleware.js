import { ApiError } from "../utils/ApiError.js";

// Usage: authorise("owner", "staff")
export const authorise = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError(401, "You must be logged in."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError(
          403,
          `Access denied. Required roles: ${allowedRoles.join(", ")}.`
        )
      );
    }

    next();
  };
};
