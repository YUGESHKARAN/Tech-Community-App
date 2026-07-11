const connectToDatabase = require("../db");
const { startNotificationWorker } = require("../services/notificationQueue");

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
