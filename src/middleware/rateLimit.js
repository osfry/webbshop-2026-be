import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 55,
  message: { message: "Too many login attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 3,
  message: { message: "Too many registrations. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const productsReadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 120,
  message: { message: "Too many requests for products. Slow down a bit." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  message: { message: "Too many requests. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
