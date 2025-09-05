import { ApiError } from "../utils/ApiError.js";

// Dual-mode helper:
// 1) handleError(res, error) -> send response immediately
// 2) handleError(statusCode, message, errors?) -> return ApiError instance for next()
export const handleError = (...args) => {
  if (typeof args[0] === "number") {
    const [statusCode, message, errors] = args;
    return new ApiError(
      statusCode || 500,
      message || "Internal server error",
      errors || []
    );
  }

  const [res, error] = args;
  try {
    console.error("Error details:", error);
    const statusCode = error?.statusCode || 500;
    const message = error?.message || "Internal server error";
    const errors = error?.errors || [];

    res.status(statusCode).json({
      success: false,
      message,
      errors,
      error: process.env.NODE_ENV === "development" ? error?.stack : undefined,
    });
  } catch (e) {
    // Fallback to generic 500 if anything goes wrong
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
