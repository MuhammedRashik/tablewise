import jwt from "jsonwebtoken";
import { User } from "../../modules/auth/auth.model.js";

/**
 * Socket.IO authentication middleware
 */
export const socketAuthMiddleware = async (socket, next) => {
  try {
    const raw =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization ||
      "";

    const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;

    if (!token) {
      return next(new Error("AUTH_MISSING: No token provided"));
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new Error("AUTH_EXPIRED: Token has expired"));
      }
      return next(new Error("AUTH_INVALID: Invalid token"));
    }

    const user = await User.findById(decoded._id)
      .select("-password")
      .lean();

    if (!user) {
      return next(new Error("AUTH_NOTFOUND: User not found"));
    }

    if (!user.isActive) {
      return next(new Error("AUTH_INACTIVE: Account deactivated"));
    }

    socket.user = user;

    next();
  } catch (err) {
    console.error("[Socket.IO Auth Error]", err.message);
    next(new Error("AUTH_ERROR: Authentication failed"));
  }
};
