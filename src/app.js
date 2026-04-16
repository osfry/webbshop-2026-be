import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import productsRouter from "./routes/products.js";
import authRouter from "./routes/auth.js";
import tradesRouter from "./routes/trade.js";
import meRouter from "./routes/me.js";
import cors from "cors";
import { globalLimiter } from "./middleware/rateLimit.js";

const app = express();

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

// Middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});
app.use(cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"], 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"] 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Webbshop API", stack: "MEN (MongoDB, Express, Node.js)" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.use("/trades", tradesRouter);
app.use("/products", productsRouter);
app.use("/auth", authRouter);
app.use("/me", meRouter);
//TODO: Add more routes as needed

app.set("trust proxy", 1);
app.use(globalLimiter);

export default app;
