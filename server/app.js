import express from "express"
// const session = require("express-session");
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
dotenv.config()

import authRouter from "./routes/auth.router.js"

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


mongoose.connect(process.env.MONGODB_URI).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

app.get("/ping", (req, res) => {
  res.send("pong from server");
});
app.use("/api/auth", authRouter);

app.use(/.*/, (req, res) => {
  console.log(`[${req.method}] Unhandled request to: ${req.originalUrl}`);
  if (Object.keys(req.body).length) {
    console.log("Request body:", req.body);
  }
  res.status(404).send("Not found");
});


const PORT = process.env.SERVER_PORT || 5001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
