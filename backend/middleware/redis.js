const redis = require("redis");
const dotenv = require("dotenv");
dotenv.config();

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});



redisClient.on("error", (err) => {
  console.log("Redis error:", err);
});

redisClient.on("ready", () => {
  console.log("Redis connected");
});

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
