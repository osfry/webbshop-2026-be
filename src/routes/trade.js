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
    return value._id ?? value.id ?? "";
  }
  return value;
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

    if (product.owner?._id ?? product.owner === requesterId) {
      return res.status(400).json({ message: "You cannot create a trade for your own product" });
    }

    const trade = await createTrade({
      requester: requesterId,
      receiver: product.owner,
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
router.put("/:id", requireAuth, validateTradeStatus, validateTradeResult, async (req, res) => {
  try {
    const existingTrade = await getTradeById(req.params.id);
    if (!existingTrade) {
      return res.status(404).json({ message: "Trade not found" });
    }
    const { status } = req.body;

    const receiverId = getId(existingTrade.receiver);
    const requesterId = getId(existingTrade.requester);
    const isParticipant = requesterId === req.user.id || receiverId === req.user.id;
    const isReceiver = receiverId === req.user.id;

    if(status ===  "completed" && !isParticipant) {
      return res.status(403).json({ message: "Only trade participants can mark trade as completed" });
    }

    if(status !== "completed" && !isReceiver) {
      return res.status(403).json({ message: "Only the receiver can update trade status" });
    }

    if (status === "accepted") {
      existingTrade.meetingPlace = req.body.meetingPlace;
      existingTrade.meetingTime = req.body.meetingTime;

      await createNotification({
        user: existingTrade.requester,
        message: `Ditt bytesförslag har accepterats! Mötes: ${req.body.meetingPlace} ${new Date(req.body.meetingTime).toLocaleString("sv-SE")}`,
        trade: existingTrade._id,
      });
    }

    if (status === "completed") {
      const notifyUserId = req.user.id === requesterId
        ? existingTrade.receiver
        : existingTrade.requester;

      await createNotification({
        user: notifyUserId,
        message: "Bytet har markerats som genomfört!",
        trade: existingTrade._id,
      });
    }

    if (status === "rejected") {
      await existingTrade.deleteOne();
      return res.json({ message: "Trade rejected and deleted successfully" });
    }

    existingTrade.status = status;
    await existingTrade.save();
    res.json(existingTrade);
  } catch (error) {
    console.error("Trade update error:", error);
    res.status(500).json({ message: "Trade update failed" });
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
