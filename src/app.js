import "dotenv/config";
import express from "express";
import productsRouter from "./routes/products.js";
import authRouter from "./routes/auth.js";
import cors from "cors";
const app = express();

// Middleware
app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Webbshop API", stack: "MEN (MongoDB, Express, Node.js)" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/products", productsRouter);
app.use("/auth", authRouter);
//TODO: Add more routes as needed

export { app };
