const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ApiError } = require("../utils/ApiError");

async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "Authentication token is required");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) {
      throw new ApiError(401, "User no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(new ApiError(401, "Invalid or expired token"));
      return;
    }

    next(error);
  }
}

module.exports = { requireAuth };
