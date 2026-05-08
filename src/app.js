const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const cityRoutes = require("./routes/cityRoutes");
const insightRoutes = require("./routes/insightRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "weather-dashboard-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/insights", insightRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
