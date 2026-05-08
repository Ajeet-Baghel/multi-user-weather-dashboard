const City = require("../models/City");
const { ApiError } = require("../utils/ApiError");
const { geocodeCity, getWeatherForCity } = require("../services/weatherService");

async function listCities(req, res, next) {
  try {
    const cities = await City.find({ user: req.user._id }).sort({
      favorite: -1,
      updatedAt: -1,
    });

    const withWeather = await Promise.all(
      cities.map(async (city) => ({
        ...city.toObject(),
        weather: await getWeatherForCity(city),
      }))
    );

    res.json({ cities: withWeather });
  } catch (error) {
    next(error);
  }
}

async function addCity(req, res, next) {
  try {
    const { query, note } = req.body;

    if (!query || query.trim().length < 2) {
      throw new ApiError(400, "Enter at least two characters for a city");
    }

    const location = await geocodeCity(query.trim());
    const city = await City.create({
      user: req.user._id,
      name: location.name,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
      note: note || "",
    });

    res.status(201).json({
      city: {
        ...city.toObject(),
        weather: await getWeatherForCity(city),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      next(new ApiError(409, "This city is already on your dashboard"));
      return;
    }

    next(error);
  }
}

async function updateCity(req, res, next) {
  try {
    const updates = {};
    if (typeof req.body.favorite === "boolean") updates.favorite = req.body.favorite;
    if (typeof req.body.note === "string") updates.note = req.body.note.slice(0, 240);

    const city = await City.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true }
    );

    if (!city) {
      throw new ApiError(404, "City not found");
    }

    res.json({ city });
  } catch (error) {
    next(error);
  }
}

async function deleteCity(req, res, next) {
  try {
    const city = await City.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!city) {
      throw new ApiError(404, "City not found");
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listCities, addCity, updateCity, deleteCity };
