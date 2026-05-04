const mongoose = require("mongoose");
dotenv = require("dotenv");
dotenv.config();
let isConnected; // Track the connection status
const mongodb_url = process.env.MONGODB_URL ;
const connectToDatabase = async () => {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  console.log("Establishing new database connection");
  await mongoose.connect(mongodb_url, {
    maxPoolSize: 10, // Optional: set a pool size
    serverSelectionTimeoutMS: 5000 // Set a timeout for server selection
  });
  isConnected = mongoose.connection.readyState; // 1 for connected
};

module.exports = connectToDatabase;
