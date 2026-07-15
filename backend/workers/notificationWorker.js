const express = require("express");

const connectToDatabase = require("../db");
const { startNotificationWorker } = require("../services/notificationQueue");

const app = express();
(async () => {
  try {
    console.log("Starting notification worker...");
    await connectToDatabase();
    await startNotificationWorker();
    console.log("Notification worker is running");
  } catch (err) {
    console.error("Notification worker failed to start:", err.message);
    process.exit(1);
  }
})();


app.get("/", (req, res) => {
    res.send("Notification worker running");
});

const PORT = process.env.PORT || 3500;

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});
