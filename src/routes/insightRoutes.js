const express = require("express");
const { getInsights } = require("../controllers/insightController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, getInsights);

module.exports = router;
