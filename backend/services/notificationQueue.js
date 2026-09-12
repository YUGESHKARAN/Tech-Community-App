const dotenv = require("dotenv");
dotenv.config();

const { Queue, Worker } = require("bullmq");
const axios = require("axios");
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
const aiRequestChains = new Map();

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

const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const aiDebugEnabled = process.env.AI_SYNC_DEBUG !== "false";

const logAISync = (message, details = {}) => {
  if (aiDebugEnabled) console.log(`[AI sync] ${message}`, details);
};

const deliverAISync = async (payload, eventId) => {
  const endpoint = payload.operation === "delete" ? "delete" : "ingest";
  const headers = {
    Authorization: `Bearer ${payload.token}`,
    "Idempotency-Key": eventId,
  };
  const maxAttempts = 4;

  logAISync("request started", {
    eventId,
    operation: payload.operation,
    postId: payload.postId,
    url: `${process.env.TECH_ASSISTANT_URL}/${endpoint}`,
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      if (payload.operation === "delete") {
        const response = await axios.delete(
          `${process.env.TECH_ASSISTANT_URL}/delete/${payload.postId}`,
          { headers, timeout: 10000 }
        );
        logAISync("request succeeded", { eventId, operation: payload.operation, postId: payload.postId, status: response.status });
        return response.data;
      }

      if (payload.operation === "ingest") {
        const response = await axios.post(
          `${process.env.TECH_ASSISTANT_URL}/ingest`,
          payload.post,
          { headers, timeout: 10000 }
        );
        logAISync("request succeeded", { eventId, operation: payload.operation, postId: payload.postId, status: response.status });
        return response.data;
      }

      throw new Error(`Unsupported AI operation: ${payload.operation}`);
    } catch (err) {
      const status = err.response?.status;
      if (payload.operation === "delete" && status === 404) {
        logAISync("delete already absent in AI service", { eventId, postId: payload.postId });
        return { alreadyAbsent: true };
      }
      const retryable = !status || status === 408 || status === 429 || status >= 500;
      logAISync("request failed", {
        eventId,
        operation: payload.operation,
        postId: payload.postId,
        attempt,
        status,
        code: err.code,
        message: err.message,
        retryable,
      });
      if (!retryable || attempt === maxAttempts) throw err;
      await wait(500 * (2 ** (attempt - 1)));
    }
  }
};

const enqueueAISync = async (payload) => {
  if (!payload?.postId || !payload?.operation || !payload?.token) {
    logAISync("request skipped because required data is missing", {
      operation: payload?.operation,
      postId: payload?.postId,
      hasToken: Boolean(payload?.token),
    });
    return null;
  }

  const eventId = payload.eventId || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const chainKey = `${payload.tenantId || "unknown"}:${payload.postId}`;
  logAISync("request queued", { eventId, chainKey, operation: payload.operation, postId: payload.postId });
  const previous = aiRequestChains.get(chainKey) || Promise.resolve();
  const current = previous
    .catch(() => null)
    .then(() => deliverAISync(payload, eventId));

  aiRequestChains.set(chainKey, current);
  current.finally(() => {
    if (aiRequestChains.get(chainKey) === current) aiRequestChains.delete(chainKey);
  }).catch(() => null);

  return current;
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
  if (worker) await worker.close();
  worker = null;
  workerStarted = false;
};

module.exports = {
  notificationQueue,
  enqueuePostNotification,
  enqueueAISync,
  addSseClient,
  removeSseClient,
  publishNotificationEvent,
  startNotificationWorker,
  stopNotificationWorker,
};
