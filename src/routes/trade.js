import { Router } from "express";
import { validateTrade, validateTradeResult, validateTradeStatus } from "../middleware/tradeValidation.js";
import { getTrades, getTradeById, createTrade, deleteTrade, getUserTradeHistory } from "../db/trades.js";
import { getProductById } from "../db/products.js";
import { validateProductResult } from "../middleware/productValidation.js";
import { requireAuth } from "../middleware/auth.js";
import { createNotification } from "../db/notifications.js";

const router = Router();

function getId(value) {
  if (!value) return null;
  if (typeof value === "object") {
    const id = value._id ?? value.id;
    return id ? id.toString() : "";
  }
  return value.toString();
}

function isTradeParticipant(trade, userId) {
  const requesterId = getId(trade.requester);
  const receiverId = getId(trade.receiver);
  const currentUserId = userId;
  return requesterId === currentUserId || receiverId === currentUserId;
}

//GET ALL TRADES
router.get("/", requireAuth, async (req, res) => {
  const trades = await getTrades();
  if (!trades) {
    return res.status(404).json({ message: "No trades found" });
  }
  res.json(trades);
});

//HISTORY OF TRADES FOR USER
router.get("/history/:userId", requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "You are not allowed to view this trade history" });
    }

    const trades = await getUserTradeHistory(userId);
    if (!trades || trades.length === 0) {
      return res.status(404).json({ message: "No completed trades found for this user" });
    }
    res.json(trades);
  } catch (error) {
    console.error("Error fetching trade history:", error);
    res.status(500).json({ message: "Failed to fetch trade history" });
  }
});

//GET TRADE BY ID
router.get("/:id", requireAuth, async (req, res) => {
  const trade = await getTradeById(req.params.id);

  if (!trade) {
    return res.status(404).json({ message: "Trade not found" });
  }

  if (!isTradeParticipant(trade, req.user.id)) {
    return res.status(403).json({ message: "You are not allowed to view this trade" });
  }

  res.json(trade);
});

//CREATE TRADE
router.post("/", requireAuth, validateTrade, validateProductResult, validateTradeResult, async (req, res) => {
  try {
    const { productId } = req.body;

    const requesterId = req.user.id;

    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const ownerId = getId(product.owner);
    if (ownerId === requesterId) {
      return res.status(400).json({ message: "You cannot create a trade for your own product" });
    }
    const trade = await createTrade({
      requester: requesterId,
      receiver: ownerId,
      product: productId,
      status: "pending",
    });

    // Skapa notis till receiver
    await createNotification({
      user: product.owner,
      message: "Du har fått en ny trade förfrågan på din krukmonster till planta",
      trade: trade._id,
    });

    res.status(201).json(trade);
  } catch (error) {
    console.error("Trade creation error:", error);
    res.status(500).json({ message: "Trade creation failed" });
  }
});

//CHANGE TRADE STATUS
// Se till att auth och validateTradeResult står med innan (req, res)!
router.put("/:id", requireAuth, validateTradeStatus, validateTradeResult, async (req, res) => {
  try {
    // Plockar ut alla tre fälten från frontend
    const { status, meetingTime, meetingPlace } = req.body;
    
    // Skickar med tiden och platsen som "extraData"
    const trade = await updateTradeStatus(
        req.params.id, 
        req.user.id, // <-- Här kraschade det förut för att auth saknades!
        status, 
        { meetingTime, meetingPlace }
    );
    
    res.json(trade);
  } catch (err) {
    console.error("Update trade error:", err);
    res.status(400).json({ message: err.message });
  }
});

//DELETE TRADE
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const existingTrade = await getTradeById(req.params.id);
    if (!existingTrade) {
      return res.status(404).json({ error: "Trade not found" });
    }

    const requesterId = getId(existingTrade.requester);
    if (requesterId !== req.user.id) {
      return res.status(403).json({ message: "Only the requester can delete this trade" });
    }

    const trade = await deleteTrade(req.params.id);
    if (!trade) {
      return res.status(404).json({ error: "Trade not found" });
    }
    res.json({ message: "Trade deleted successfully" });
  } catch (error) {
    console.error("Trade deletion error:", error);
    res.status(500).json({ message: "Trade deletion failed" });
  }
});

export default router;
