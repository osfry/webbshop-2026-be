import User from "../models/User.js";

export async function createUser(userData) {
  const user = new User(userData);
  await user.save();
  return user;
}

export async function findUserByEmail(email) {
  return await User.findOne({ email });
}

export async function getUserWithPlants(id) {
  return await User.findById(id).populate("plants");
}
export async function getUserWithTrades(id) {
  return await User.findById(id).populate("trades");
}

