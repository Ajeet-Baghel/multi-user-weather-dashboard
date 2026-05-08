const express = require("express");
const {
  listCities,
  addCity,
  updateCity,
  deleteCity,
} = require("../controllers/cityController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);
router.get("/", listCities);
router.post("/", addCity);
router.patch("/:id", updateCity);
router.delete("/:id", deleteCity);

module.exports = router;
