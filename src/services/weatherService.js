const axios = require("axios");
const { ApiError } = require("../utils/ApiError");

const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
};

async function geocodeCity(query) {
  const response = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
    params: {
      name: query,
      count: 1,
      language: "en",
      format: "json",
    },
    timeout: 8000,
  });

  const location = response.data?.results?.[0];
  if (!location) {
    throw new ApiError(404, "No matching city found");
  }

  return {
    name: location.name,
    country: location.country || location.country_code || "",
    latitude: location.latitude,
    longitude: location.longitude,
  };
}

async function getWeatherForCity(city) {
  try {
    const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: city.latitude,
        longitude: city.longitude,
        current:
          "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
        daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
        forecast_days: 3,
        timezone: "auto",
      },
      timeout: 8000,
    });

    const current = response.data.current;
    const daily = response.data.daily;

    return {
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      condition: WEATHER_CODES[current.weather_code] || "Weather unavailable",
      updatedAt: current.time,
      forecast: daily.time.map((day, index) => ({
        day,
        max: daily.temperature_2m_max[index],
        min: daily.temperature_2m_min[index],
        precipitation: daily.precipitation_probability_max[index],
      })),
    };
  } catch (error) {
    return {
      condition: "Weather unavailable",
      error: "Could not refresh weather right now",
    };
  }
}

module.exports = { geocodeCity, getWeatherForCity };
