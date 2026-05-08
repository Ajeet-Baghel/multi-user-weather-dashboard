const User = require("../models/User");
const { ApiError } = require("../utils/ApiError");
const { signToken } = require("../utils/tokens");

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, "Name, email, and password are required");
    }

    if (password.length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(409, "An account already exists for this email");
    }

    const user = await User.createWithPassword({ name, email, password });
    res.status(201).json({ user: serializeUser(user), token: signToken(user) });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, "Invalid email or password");
    }

    res.json({ user: serializeUser(user), token: signToken(user) });
  } catch (error) {
    next(error);
  }
}

async function me(req, res) {
  res.json({ user: serializeUser(req.user) });
}

module.exports = { register, login, me };
