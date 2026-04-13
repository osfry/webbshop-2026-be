import { Router } from "express";
import { validateRegister, validateAuthResult } from "../middleware/authValidation.js";
import { createUser, findUserByEmail, getUserWithPlants, getUserWithTrades } from "../db/users.js";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token.js";

const router = Router();

router.post("/register", validateRegister, validateAuthResult, async (req, res) => {
  try {
    const { name, email, password, profileImage, about } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await createUser({ name, email, password, profileImage, about });
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      about: user.about,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    res.json({ accessToken, refreshToken, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Server error " });
  }
});


// router.post("/refresh", async (req, res) => {
//   const { refreshToken } = req.body;

//   if (!refreshToken) {
//     return res.status(401).json({ message: "Refresh Token required" });
//   }

//   try {
//     // Kolla om token är giltig
//     const decodedToken = verifyRefreshToken(refreshToken);

//     // Om den är giltig, skapa en NY access token
//     const newAccessToken = generateAccessToken({ id: decodedToken.id });

//     res.json({ accessToken: newAccessToken });
//   } catch (err) {
//     return res.status(403).json({ message: "Invalid Refresh Token" });
//   }
// });

// Logout
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// Get all users plants
router.get("/:id/plants", async (req, res) => {
  try {
    const plants = await getUserWithPlants(req.params.id);

    res.json(plants);
  } catch (error) {
    console.error("Get plants error:", error);
    res.status(500).json({ message: "Failed to fetch plants" });
  }
});

// Get user trade history
router.get("/:id/trades", async (req, res) => {
  try {
    const trades = await getUserWithTrades(req.params.id);

    res.json(trades);
  } catch (error) {
    console.error("Get trades error:", error);
    res.status(500).json({ message: "Failed to fetch trades" });
  }
});
// TODO: Dubbelkolla att trades hanteras korrekt när routes är klara
export default router;
