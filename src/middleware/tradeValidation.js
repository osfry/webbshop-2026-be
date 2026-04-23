import { body, validationResult } from "express-validator";

export const validateTrade = [
  // Vi validerar ENDAST productId eftersom det är det enda frontend skickar
  body("productId")
    .exists().withMessage("Product ID is required")
    .isMongoId().withMessage("Invalid Product ID format"),
];

export const validateTradeStatus = [
  body("status")
    .isIn(["accepted", "rejected", "completed"])
    .withMessage("Invalid status"),
    
  // Tillåter datum om det skickas med
  body("meetingTime")
    .optional()
    .isISO8601()
    .withMessage("Meeting time must be a valid date"),
    
  // Tillåter ett objekt med koordinater om det skickas med
  body("meetingPlace")
    .optional()
    .isObject()
    .withMessage("Meeting place must be an object with coordinates"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateTradeResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
