
const mongoose = require("mongoose");
const dotenv   = require("dotenv");
dotenv.config();

const connectToDatabase = async (retries = 3) => {
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL environment variable is not set");
  }

  if (mongoose.connection.readyState === 1) return;

  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve, reject) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error',     reject);
    });
    return;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`DB connect attempt ${attempt}/${retries}`);
      await mongoose.connect(process.env.MONGODB_URL, {
        maxPoolSize:              10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS:          45000,
      });
      console.log("MongoDB connected");
      return;
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err.message);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * 2 ** (attempt - 1)));
    }
  }
};

mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));
mongoose.connection.on("reconnected",  () => console.log("MongoDB reconnected"));
mongoose.connection.on("error", (err)  => console.error("MongoDB error:", err.message));

module.exports = connectToDatabase;