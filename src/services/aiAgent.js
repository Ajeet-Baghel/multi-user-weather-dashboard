async function createLangChainInsight(cityWeather) {
  const { ChatOpenAI } = await import("@langchain/openai");
  const { ChatPromptTemplate } = await import("@langchain/core/prompts");

  const model = new ChatOpenAI({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.2,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a concise weather planning agent. Return practical, safety-aware advice in 3 short bullets.",
    ],
    [
      "human",
      "Create a personalized dashboard insight from this weather JSON: {weather}",
    ],
  ]);

  const chain = prompt.pipe(model);
  const response = await chain.invoke({ weather: JSON.stringify(cityWeather) });
  return response.content;
}

function createFallbackInsight(cityWeather) {
  if (cityWeather.length === 0) {
    return "Add a few cities and I will compare conditions, flag rain risk, and suggest which favorite needs attention first.";
  }

  const rainy = cityWeather.filter((item) =>
    item.weather?.forecast?.some((day) => Number(day.precipitation) >= 50)
  );
  const hottest = cityWeather
    .filter((item) => typeof item.weather?.temperature === "number")
    .sort((a, b) => b.weather.temperature - a.weather.temperature)[0];
  const favorites = cityWeather.filter((item) => item.city.favorite);

  const lines = [
    favorites.length
      ? `${favorites.length} favorite ${favorites.length === 1 ? "city is" : "cities are"} pinned for quick checks.`
      : "No favorites yet; pin important cities so they stay at the top.",
  ];

  if (hottest) {
    lines.push(`${hottest.city.name} is currently the warmest at ${Math.round(hottest.weather.temperature)}C.`);
  }

  if (rainy.length) {
    lines.push(`Pack rain gear for ${rainy.map((item) => item.city.name).join(", ")} in the next three days.`);
  } else {
    lines.push("No high rain probability is showing across your saved cities.");
  }

  return lines.join(" ");
}

async function createWeatherInsight(cityWeather) {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await createLangChainInsight(cityWeather);
    } catch (error) {
      console.error("LangChain insight failed, using fallback", error);
    }
  }

  return createFallbackInsight(cityWeather);
}

module.exports = { createWeatherInsight };
