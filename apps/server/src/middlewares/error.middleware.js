import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If not our custom error → wrap it
  if (!error.statusCode) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong";

    error = ApiError(
      statusCode,
      message,
      error?.errors || [],
      err.stack
    );
  }

  // 🔹 Mongo duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = ApiError(409, `${field} already exists`);
  }

  // 🔹 Mongoose validation
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = ApiError(400, messages.join(". "));
  }

  // 🔹 Invalid ObjectId
  if (err.name === "CastError") {
    error = ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  const response = {
    success: false,
    statusCode: error.statusCode || 500,
    message: error.message || "Something went wrong",
    errors: error.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  return res.status(response.statusCode).json(response);
};
