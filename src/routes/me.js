import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { findUserById, getUserWithPlants, getUserWithTrades, updateUser } from "../db/users.js";
import upload from "../config/cloudinaryConfig.js";
import { getUserTradeHistory } from "../db/trades.js";

const router = Router();

router.use(requireAuth);

function parseUserFormData(req, res, next) {
  try {
    if (req.file) {
      req.body.profileImage = req.file.path;
    }

    next();
  } catch {
    return res.status(400).json({ message: "Invalid form data" });
  }
}

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

router.patch("/", upload.single("profileImage"), parseUserFormData, async (req, res) => {
  try {
    const { name, profileImage, about } = req.body;
    const updatedUser = await updateUser(req.user.id, { name, profileImage, about });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/trades/history", async (req, res) => {
  try {
    const trades = await getUserTradeHistory(req.user.id);
    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
