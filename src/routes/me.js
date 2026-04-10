import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { findUserById, getUserWithPlants, getUserWithTrades } from "../db/users.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/plants", async (req, res) => {
  try {
    const plants = await getUserWithPlants(req.user.id);
    res.json(plants);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/trades", async (req, res) => {
  try {
    const trades = await getUserWithTrades(req.user.id);
    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;