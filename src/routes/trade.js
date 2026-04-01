import { Router } from "express";
import { validateTrade, validateTradeResult, validateTradeStatus } from "../middleware/tradeValidation.js";
import { getTrades, getTradeById, createTrade, deleteTrade, updateTradeStatus } from "../db/trades.js";
const router = Router();

//GET ALL TRADES
router.get("/", async (req, res) => {
  const trades = await getTrades();
  if (!trades) {
    return res.status(404).json({ error: "No trades found" });
  }
  res.json(trades);
});

//GET TRADE BY ID
router.get("/:id", async (req, res) => {
  const trade = await getTradeById(req.params.id);
  if (!trade) {
    return res.status(404).json({ error: "Trade not found" });
  }
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

//CHANGE TRADE STATUS
router.put("/:id", validateTradeStatus, validateTradeResult, async (req, res) => {
  try {
    const { status } = req.body;
    const trade = await getTradeById(req.params.id);
    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }
    if (status === "accepted") {
      //TODO: what should happen if accepted?
    } else if (status === "rejected") {
      //If user rejects, delete trade?
      await trade.deleteOne();
      return res.json({ message: "Trade rejected and deleted successfully" });
    }
    trade.status = status;
    await trade.save();
    res.json(trade);
  } catch (error) {
    console.error("Trade update error:", error);
    res.status(500).json({ error: "Trade update failed" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const trade = await getTradeById(req.params.id);
    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }
    await trade.deleteOne();
    res.json({ message: "Trade deleted successfully" });
  } catch (error) {
    console.error("Trade deletion error:", error);
    res.status(500).json({ error: "Trade deletion failed" });
  }
});

export default router;
