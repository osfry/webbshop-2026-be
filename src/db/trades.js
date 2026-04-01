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

export async function updateTradeStatus(id, status) {
  try {
    const trade = await getTradeById(id);
    if (!trade) {
      throw new Error("Trade not found");
    }
    trade.status = status;
    await trade.save();
    return trade;
  } catch (error) {
    console.error("Error updating trade status:", error);
    throw error;
  }
}

export async function deleteTrade(id) {
  try {
    return await Trade.findByIdAndDelete(id);
  } catch (error) {
    console.error("Error deleting trade:", error);
    throw error;
  }
}
