const { ApiError } = require("../utils/ApiError");

function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? "Unexpected server error" : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    message,
    details: error.details,
  });
}

module.exports = { notFound, errorHandler };
