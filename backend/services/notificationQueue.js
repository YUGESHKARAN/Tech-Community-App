const dotenv = require("dotenv");
dotenv.config();

const { Queue, Worker } = require("bullmq");
const { createClient } = require("redis");
const nodemailer = require("nodemailer");
const connectToDatabase = require("../db");
const { Author } = require("../models/blogAuthorSchema");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const queueName = process.env.NOTIFICATION_QUEUE_NAME || "notifications";

const connection = {
  url: redisUrl,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => Math.min(times * 100, 3000),
};

const notificationQueue = new Queue(queueName, { connection });

const streamPubClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (times) => Math.min(times * 100, 3000),
  },
});
const streamSubClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (times) => Math.min(times * 100, 3000),
  },
});
const sseClients = new Map();

let worker;
let workerStarted = false;

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_PROVIDER,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const escapeHtml = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

const ensureStreamClients = async () => {
  if (streamPubClient.isOpen || streamPubClient.isReady) {
    return;
  }
  await Promise.allSettled([streamPubClient.connect(), streamSubClient.connect()]);

  if (streamSubClient.isOpen || streamSubClient.isReady) {
    await streamSubClient.subscribe("notification-stream", (message) => {
      try {
        const { email, payload } = JSON.parse(message);
        const subscribers = sseClients.get(email);
        if (!subscribers || subscribers.size === 0) return;

        const eventPayload = `data: ${JSON.stringify(payload)}\n\n`;
        for (const client of subscribers) {
          client.write(eventPayload);
        }
      } catch (err) {
        console.error("Notification stream parse error:", err.message);
      }
    });
  }
};

const addSseClient = async (email, res) => {
  await ensureStreamClients();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    res.end();
    return;
  }

  if (!sseClients.has(normalizedEmail)) {
    sseClients.set(normalizedEmail, new Set());
  }
  const subscribers = sseClients.get(normalizedEmail);
  subscribers.add(res);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  res.write(": connected\n\n");

  res.on("close", () => {
    subscribers.delete(res);
    if (subscribers.size === 0) {
      sseClients.delete(normalizedEmail);
    }
  });
};

const removeSseClient = (email, res) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const subscribers = sseClients.get(normalizedEmail);
  if (!subscribers) return;
  subscribers.delete(res);
  if (subscribers.size === 0) {
    sseClients.delete(normalizedEmail);
  }
};

const publishNotificationEvent = async (email, payload) => {
  await ensureStreamClients();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) return;
  await streamPubClient.publish("notification-stream", JSON.stringify({ email: normalizedEmail, payload }));
};

const enqueuePostNotification = async (payload) => {
  if (!payload?.authorEmail || !payload?.postId) return null;
  return notificationQueue.add("post-created", payload, {
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 86400, count: 1000 },
  });
};

const startNotificationWorker = async () => {
  if (workerStarted) return worker;

  await ensureStreamClients();

  await connectToDatabase();

  worker = new Worker(
    queueName,
    async (job) => {
      const payload = job.data || {};

      if (job.name === "post-created") {
        const author = await Author.findOne({ email: { $eq: payload.authorEmail } }).select("authorname email profile followers community");
        if (!author) {
          throw new Error(`Author not found for ${payload.authorEmail}`);
        }

        const followerSet = new Set(
          (Array.isArray(author.followers) ? author.followers : []).filter(Boolean).filter((email) => email !== author.email)
        );

        const communityAuthors = await Author.find({
          community: { $in: Array.isArray(author.community) ? author.community : [] },
          email: { $ne: author.email },
        }).select("email");

        const communityRecipients = new Set();
        for (const communityAuthor of communityAuthors) {
          if (!followerSet.has(communityAuthor.email)) {
            communityRecipients.add(communityAuthor.email);
          }
        }

        const combinedRecipients = [...new Set([...followerSet, ...communityRecipients])];

        const bulkNotifications = combinedRecipients.map((recipientEmail) => {
          const isFollower = followerSet.has(recipientEmail);
          const message = isFollower
            ? `New post from ${payload.authorName}: ${payload.title}`
            : `${payload.authorName} from your community posted: ${payload.title}`;

          return {
            updateOne: {
              filter: { email: recipientEmail },
              update: {
                $push: {
                  notification: {
                    postId: payload.postId,
                    user: payload.authorName,
                    authorEmail: payload.authorEmail,
                    message,
                    url: payload.url,
                    profile: payload.authorProfile || "",
                    timestamp: new Date(),
                  },
                },
              },
            },
          };
        });

        if (bulkNotifications.length > 0) {
          await Author.bulkWrite(bulkNotifications);
        }

        for (const recipientEmail of combinedRecipients) {
          const isFollower = followerSet.has(recipientEmail);
          const message = isFollower
            ? `New post from ${payload.authorName}: ${payload.title}`
            : `${payload.authorName} from your community posted: ${payload.title}`;

          const eventPayload = {
            _id: payload.postId,
            type: "new-post-notification",
            postId: payload.postId,
            user: payload.authorName,
            authorEmail: payload.authorEmail,
            message,
            url: payload.url,
            profile: payload.authorProfile || "",
            timestamp: new Date().toISOString(),
          };

          await publishNotificationEvent(recipientEmail, eventPayload);

          if (isFollower) {
            try {
              await transporter.sendMail({
                from: `"${payload.authorName}" <${process.env.EMAIL_USER}>`,
                to: recipientEmail,
                subject: `New post from ${escapeHtml(payload.authorName)}`,
                html: `
                  <h3>${escapeHtml(payload.authorName)} has posted a new blog!</h3>
                  <p><strong>Title:</strong> ${escapeHtml(payload.title)}</p>
                  <p><a href="${payload.url}">Click here to view the post</a></p>
                `,
              });
            } catch (err) {
              console.error(`Failed to send email to ${recipientEmail}:`, err.message);
            }
          }
        }

        return { delivered: combinedRecipients.length };
      }

      return null;
    },
    {
      connection,
      concurrency: 5,
      removeOnComplete: { age: 3600, count: 1000 },
      removeOnFail: { age: 86400, count: 1000 },
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`Notification worker failed for job ${job?.id}:`, err.message);
  });

  worker.on("completed", (job, result) => {
    console.log(`Notification worker completed ${job.id}:`, result);
  });

  workerStarted = true;
  return worker;
};

const stopNotificationWorker = async () => {
  if (!worker) return;
  await worker.close();
  workerStarted = false;
};

module.exports = {
  notificationQueue,
  enqueuePostNotification,
  addSseClient,
  removeSseClient,
  publishNotificationEvent,
  startNotificationWorker,
  stopNotificationWorker,
};
