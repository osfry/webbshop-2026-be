import Trade from "../models/Trade.js";
import { createNotification } from "./notifications.js";

export async function getTrades() {
  // return await Trade.find().populate("requester receiver product");
  return await Trade.find().populate([
    { path: "requester", select: "-password -email" },
    { path: "receiver", select: "-password -email" },
    { path: "product" },
  ]);
}

export async function getTradeById(id) {
  return await Trade.findById(id).populate([
    { path: "requester", select: "-password -email" },
    { path: "receiver", select: "-password -email" },
    { path: "product" },
  ]);
}

export async function createTrade(tradeData) {
  try {
    const newTrade = new Trade(tradeData);
    await newTrade.save();
    return newTrade;
  } catch (error) {
    console.error("Error creating trade:", error);
    throw error;
  }
}

// Uppdaterad med extraData = {}
export async function updateTradeStatus(tradeId, userId, status, extraData = {}) {
  const trade = await Trade.findById(tradeId).populate("product");

  if (!trade) {
    throw new Error("Trade not found");
  }

  // if (trade.receiver.toString() !== userId) {
  //   throw new Error("Not authorized to update this trade");
  // }

  if (trade.status !== "pending" && status !== "completed") {
    throw new Error("Trade is already processed");
  }

  trade.status = status;

  // Sparar datum och plats om bytet godkänns
  if (status === "accepted") {
    if (extraData.meetingTime) {
      trade.meetingTime = extraData.meetingTime;
    }
    if (extraData.meetingPlace) {
      trade.meetingPlace = extraData.meetingPlace;
    }
  }

  await trade.save();

  // Skapar notifikation formaterad exakt enligt ditt nya schema
  await createNotification({
    user: trade.requester,
    message: `Your trade request for ${trade.product.name} was ${status}`,
    trade: trade._id,
  });

  return trade;
}

export async function deleteTrade(id) {
  try {
    return await Trade.findByIdAndDelete(id);
  } catch (error) {
    console.error("Error deleting trade:", error);
    throw error;
  }
}

export async function getUserTradeHistory(userId) {
  try {
    return await Trade.find({
      status: "completed",
      $or: [{ requester: userId }, { receiver: userId }],
    }).populate([
      { path: "requester", select: "-password -email" },
      { path: "receiver", select: "-password -email" },
      { path: "product" },
    ]);
  } catch (error) {
    console.error("Error fetching trade history:", error);
    throw error;
  }
}
