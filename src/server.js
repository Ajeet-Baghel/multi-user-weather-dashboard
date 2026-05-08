require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Weather dashboard API running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
