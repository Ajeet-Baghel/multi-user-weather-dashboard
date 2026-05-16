const { ApiError } = require("../utils/ApiError");

function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(error, _req, res, _next) {
  const isDuplicateKeyError = error && error.code === 11000;
  const statusCode = error.statusCode || (isDuplicateKeyError ? 409 : 500);

  const message = isDuplicateKeyError
    ? `Duplicate value detected${error.keyValue ? `: ${JSON.stringify(error.keyValue)}` : ""}`
    : statusCode === 500
    ? "Unexpected server error"
    : error.message;

  if (isDuplicateKeyError) {
    console.error("Duplicate key error:", error.keyValue || error.keyPattern || error);
  } else if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    message,
    details: error.details || error.keyValue || error.keyPattern,
  });
}

module.exports = { notFound, errorHandler };
