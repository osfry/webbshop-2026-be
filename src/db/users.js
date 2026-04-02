import User from "../models/User.js";
import Product from "../models/Product.js"
import Trade from "../models/Trade.js"

export async function createUser(userData) {
  const user = new User(userData);
  await user.save();
  return user;
}

export async function findUserByEmail(email) {
  return await User.findOne({ email });
}

export async function getUserWithPlants(id) {
  return await Product.find({ owner: id })
}
export async function getUserWithTrades(id) {
  return await Trade.find({ $or: [{ requester: id}, {receiver: id }]});
}

