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

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  console.log("Establishing new database connection");

  await mongoose.connect(process.env.MONGODB_URL, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000, // 10s instead of 5s for cold starts
    socketTimeoutMS: 45000,          // keep socket alive longer
    bufferCommands: false,           // fail fast, don't queue commands
  });

  isConnected = mongoose.connection.readyState === 1; //strict boolean check
  console.log("MongoDB connected");
};

// ✅ Reset connection flag if mongoose disconnects unexpectedly
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected, resetting flag...");
  isConnected = false;
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err.message);
  isConnected = false;
});

module.exports = connectToDatabase;
