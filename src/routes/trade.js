import { Router } from "express";
import { validateTrade, validateTradeResult } from "../middleware/tradeValidation.js";
import { getTrades, getTradeById, createTrade } from "../db/trades.js";
const router = Router();

//GET ALL TRADES
router.get("/", async (req, res) => {
  const trades = await getTrades();
  res.json(trades);
});

//GET TRADE BY ID
router.get("/:id", async (req, res) => {
  const trade = await getTradeById(req.params.id);
  res.json(trade);
});

//CREATE TRADE
router.post("/", validateTrade, validateTradeResult, async (req, res) => {
  try {
    const { requester, receiver, product, status } = req.body;
    const trade = await createTrade({ requester, receiver, product, status });
    res.status(201).json(trade);
  } catch (error) {
    console.error("Trade creation error:", error);
    res.status(500).json({ error: "Trade creation failed" });
  }
});

export default router;
