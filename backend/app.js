// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// // const http = require("http");
// const serverless = require("serverless-http");
// const connectToDatabase = require("./db");
// const bodyParser = require("body-parser");
// const {limiter, loginLimiter} = require("./middleware/rateLimitter")
// require("dotenv").config();

// const app = express();

// // Connect to MongoDB
// connectToDatabase();

// // Middleware setup
// app.use(
//   cors({
//     origin: ["https://blog-frontend-teal-ten.vercel.app","http://localhost:5173"],// Match your frontend domain
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );


// // app.options("*", cors());

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// // app.use(limiter);


// // Routes
// const loginRouter = require("./routes/login.Route");
// const authorRouter = require("./routes/authorDetail.Route");
// const postRouter = require("./routes/postDetail.Route");
// const tutorPlaylist = require("./routes/tutorPlayList.Route");

// // Admin route
// const appAnalysisRouter = require("./routes/appAnalysis.Route");
// const adminRouter = require("./routes/admin.Route")

// app.use("/blog/login", loginRouter);
// app.use("/blog/author", authorRouter);
// app.use("/blog/posts", postRouter);
// app.use("/blog/playlist",tutorPlaylist);

// app.use("/blog/analytics", appAnalysisRouter);
// app.use("/blog/admin", adminRouter);

// // Trust proxy (for rate limiter IP detection)
// app.set("trust proxy", 1);

// // Request timeout middleware
// app.use((req, res, next) => {
//   req.setTimeout(5000, () => res.status(504).send("Request timed out."));
//   next();
// });


// // Start the server
// // app.listen(3000, () => {
// //   console.log(`Server running on port ${3000}`);
// // });


// module.exports = app;
// module.exports.handler = serverless(app);

// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// // const http = require("http");
// const serverless = require("serverless-http");
// const connectToDatabase = require("./db");
// const bodyParser = require("body-parser");
// const {limiter, loginLimiter} = require("./middleware/rateLimitter")
// require("dotenv").config();

// const app = express();

// // Connect to MongoDB
// connectToDatabase();

// // Middleware setup
// app.use(
//   cors({
//     origin: ["https://blog-frontend-teal-ten.vercel.app","http://localhost:5173"],// Match your frontend domain
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );


// // app.options("*", cors());

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// // app.use(limiter);


// // Routes
// const loginRouter = require("./routes/login.Route");
// const authorRouter = require("./routes/authorDetail.Route");
// const postRouter = require("./routes/postDetail.Route");
// const tutorPlaylist = require("./routes/tutorPlayList.Route");

// // Admin route
// const appAnalysisRouter = require("./routes/appAnalysis.Route");
// const adminRouter = require("./routes/admin.Route")

// app.use("/blog/login", loginRouter);
// app.use("/blog/author", authorRouter);
// app.use("/blog/posts", postRouter);
// app.use("/blog/playlist",tutorPlaylist);

// app.use("/blog/analytics", appAnalysisRouter);
// app.use("/blog/admin", adminRouter);

// // Trust proxy (for rate limiter IP detection)
// app.set("trust proxy", 1);

// // Request timeout middleware
// app.use((req, res, next) => {
//   req.setTimeout(5000, () => res.status(504).send("Request timed out."));
//   next();
// });


// // Start the server
// // app.listen(3000, () => {
// //   console.log(`Server running on port ${3000}`);
// // });


// module.exports = app;
// module.exports.handler = serverless(app);


const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const connectToDatabase = require("./db");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// Middleware setup
app.use(
  cors({
    origin: ["https://blog-frontend-teal-ten.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors()); // ✅ handle preflight

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Trust proxy (must be before routes)
app.set("trust proxy", 1);

//  DB connection middleware — connects per request, reuses if warm
// app.use(async (req, res, next) => {
//   try {
//     await connectToDatabase();
//     next();
//   } catch (err) {
//     console.error("DB connection failed:", err.message);
//     return res.status(500).json({ error: "Database connection failed" });
//   }
// });

// fix: connect once using singleton — safe for both serverless and long-running servers
// connectToDatabase() checks mongoose.connection.readyState internally
// so repeated calls on warm containers are instant no-ops
connectToDatabase().catch(err => {
  console.error("Initial DB connection failed:", err.message);
});

// Routes
const loginRouter = require("./routes/login.Route");
const authorRouter = require("./routes/authorDetail.Route");
const postRouter = require("./routes/postDetail.Route");
const tutorPlaylist = require("./routes/tutorPlayList.Route");
const appAnalysisRouter = require("./routes/appAnalysis.Route");
const adminRouter = require("./routes/admin.Route");

app.use("/blog/login", loginRouter);
app.use("/blog/author", authorRouter);
app.use("/blog/posts", postRouter);
app.use("/blog/playlist", tutorPlaylist);
app.use("/blog/analytics", appAnalysisRouter);
app.use("/blog/admin", adminRouter);


// Start the server
// app.listen(3000, () => {
//   console.log(`Server running on port ${3000}`);
// });


module.exports = app;
module.exports.handler = serverless(app);

