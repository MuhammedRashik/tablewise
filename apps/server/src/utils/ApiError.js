export const ApiError = (statusCode, message, errors = [], stack = "") => {
  const error = new Error(message);

  error.statusCode = statusCode;
  error.success = false;
  error.errors = errors;

  if (stack) {
    error.stack = stack;
  } else {
    Error.captureStackTrace(error);
  }

  return error;
};
