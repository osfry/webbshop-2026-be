import { Router } from "express";
import { validateRegister, validateAuthResult } from "../middleware/authValidation.js";
import { createUser, findUserByEmail } from "../db/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

router.post(
  "/register",
  validateRegister,
  validateAuthResult,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const user = await createUser({ name, email, password });
      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  }
);

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

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error " });
  }
});

export default router;
