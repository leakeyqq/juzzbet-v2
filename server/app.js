import express from "express"
// const session = require("express-session");
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
dotenv.config()

import authRouter from "./routes/auth.router.js"
import marketRouter from "./routes/market.router.js"
import feesRouter from "./routes/fees.router.js"

const app = express();
app.use(express.json());
app.use(cookieParser());



app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
    //   "https://vello-client.vercel.app",
      "http://localhost:3000",
      "http://localhost:5000",
      "https://juzz.bet",
      "https://www.juzz.bet/",
      "http://localhost:3001"
    ];

    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      console.log('Not allowed by CORS')
      callback(new Error("Not allowed by CORS!!!"));
    }
  },
  credentials: true,
}));


// mongoose.connect(process.env.MONGODB_URI).then(() => console.log("MongoDB connected"))
//   .catch(err => console.error("MongoDB error:", err));


// Optimized Mongoose connection
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  retryReads: true,
};

const connectWithRetry = async (retries = 5, delay = 5000) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error(`MongoDB connection failed (attempt ${retries}):`, err);
    if (retries > 0) {
      console.log(`Retrying in ${delay}ms...`);
      setTimeout(() => connectWithRetry(retries - 1, delay), delay);
    } else {
      console.error("Max retries reached. Exiting...");
      process.exit(1);
    }
  }
};

connectWithRetry();

// Connection event handlers
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected - attempting reconnect...');
  setTimeout(() => connectWithRetry(3, 5000), 5000);
});



app.get("/ping", (req, res) => {
  res.send("pong from server");
});
app.use("/api/auth", authRouter);
app.use("/api/market", marketRouter)
app.use('/api/fees', feesRouter)

app.use(/.*/, (req, res) => {
  console.log(`[${req.method}] Unhandled request to: ${req.originalUrl}`);
  if (Object.keys(req.body).length) {
    console.log("Request body:", req.body);
  }
  res.status(404).send("Not found");
});


const PORT = process.env.SERVER_PORT || 5001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
