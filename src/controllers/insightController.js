const City = require("../models/City");
const { createWeatherInsight } = require("../services/aiAgent");
const { getWeatherForCity } = require("../services/weatherService");

async function getInsights(req, res, next) {
  try {
    const cities = await City.find({ user: req.user._id }).sort({ favorite: -1 });
    const cityWeather = await Promise.all(
      cities.map(async (city) => ({
        city: city.toObject(),
        weather: await getWeatherForCity(city),
      }))
    );

    const insight = await createWeatherInsight(cityWeather);
    res.json({ insight });
  } catch (error) {
    next(error);
  }
}

module.exports = { getInsights };
