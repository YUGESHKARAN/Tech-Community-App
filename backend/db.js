// const mongoose = require("mongoose");
// dotenv = require("dotenv");
// dotenv.config();
// let isConnected; // Track the connection status
// const mongodb_url = process.env.MONGODB_URL ;
// const connectToDatabase = async () => {
//   if (isConnected) {
//     console.log("Using existing database connection");
//     return;
//   }

//   console.log("Establishing new database connection");
//   await mongoose.connect(mongodb_url, {
//     maxPoolSize: 10, // Optional: set a pool size
//     serverSelectionTimeoutMS: 5000 // Set a timeout for server selection
//   });
//   isConnected = mongoose.connection.readyState; // 1 for connected
// };

// module.exports = connectToDatabase;


// --------------------------------------------------------------

// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// dotenv.config();

// let isConnected = false;

// const connectToDatabase = async () => {
//   if (isConnected) {
//     console.log("Using existing database connection");
//     return;
//   }

//   console.log("Establishing new database connection");

//   await mongoose.connect(process.env.MONGODB_URL, {
//     maxPoolSize: 10,
//     serverSelectionTimeoutMS: 10000, // 10s instead of 5s for cold starts
//     socketTimeoutMS: 45000,          // keep socket alive longer
//     // bufferCommands: false,           // fail fast, don't queue commandss
//   });

//   isConnected = mongoose.connection.readyState === 1; //strict boolean check
//   console.log("MongoDB connected");
// };

// // ✅ Reset connection flag if mongoose disconnects unexpectedly
// mongoose.connection.on("disconnected", () => {
//   console.log("MongoDB disconnected, resetting flag...");
//   isConnected = false;
// });

// mongoose.connection.on("error", (err) => {
//   console.error("MongoDB error:", err.message);
//   isConnected = false;
// });

// module.exports = connectToDatabase;


// ------------------------------------------------------

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