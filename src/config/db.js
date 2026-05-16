const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is required");
  }

  let parsedUri;
  try {
    parsedUri = new URL(uri);
  } catch (_error) {
    throw new Error(
      "MONGO_URI is not a valid MongoDB connection string. Check special characters in the username/password and URL-encode them if needed."
    );
  }

  const dbName = parsedUri.pathname?.replace(/^\//, "");
  if (!dbName) {
    throw new Error(
      "MONGO_URI must include the database name after the host. Example: mongodb+srv://user:password@cluster.mongodb.net/weatherDashboardApp?retryWrites=true&w=majority&appName=Cluster0"
    );
  }

  const hasDatabaseInQuery =
    parsedUri.searchParams.has("weatherDashboardApp") ||
    parsedUri.searchParams.has("weather-dashboard-app");

  if (hasDatabaseInQuery) {
    throw new Error(
      "MONGO_URI is malformed. Put the database name after mongodb.net/, for example mongodb+srv://user:password@cluster.mongodb.net/weatherDashboardApp?retryWrites=true&w=majority&appName=Cluster0"
    );
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}

module.exports = connectDB;
