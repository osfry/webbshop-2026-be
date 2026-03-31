import Trade from "../models/Trade.js";

export async function getTrades() {
  return await Trade.find();
}

export async function getTradeById(id) {
  return await Trade.findById(id);
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
