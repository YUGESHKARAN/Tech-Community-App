const express = require("express");
const cors = require("cors");
const path = require("path");
// const http = require("http");
const serverless = require("serverless-http");
const connectToDatabase = require("./db");
const bodyParser = require("body-parser");
const {limiter} = require("./middleware/rateLimitter")
require("dotenv").config();

const app = express();

// Connect to MongoDB
connectToDatabase();

// Middleware setup
app.use(
  cors({
    // origin: ["https://blog-frontend-teal-ten.vercel.app","http://localhost:5173","https://mongodb-rag-rho.vercel.app"],// Match your frontend domain
    origin: ["https://blog-frontend-teal-ten.vercel.app","http://localhost:5173","https://mongodb-rag-rho.vercel.app"],// Match your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(limiter);


// Routes
const loginRouter = require("./routes/login.Route");
const authorRouter = require("./routes/authorDetail.Route");
const postRouter = require("./routes/postDetail.Route");

app.use("/blog/login", loginRouter);
app.use("/blog/author", authorRouter);
app.use("/blog/posts", postRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(5000, () => res.status(504).send("Request timed out."));
  next();
});


// Start the server
// app.listen(3000, () => {
//   console.log(`Server running on port ${3000}`);
// });

module.exports = app;
module.exports.handler = serverless(app);
