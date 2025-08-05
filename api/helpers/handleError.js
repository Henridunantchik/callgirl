export const handleError = (res, error) => {
  console.error("Error details:", error);

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
};
