import { body, validationResult } from "express-validator";

export const validateTrade = [
  // Vi validerar ENDAST productId eftersom det är det enda frontend skickar
  body("productId")
    .exists().withMessage("Product ID is required")
    .isMongoId().withMessage("Invalid Product ID format"),
];

export const validateTradeStatus = [
  body("status")
    .isIn(["pending", "accepted", "rejected", "completed"])
    .withMessage("Status must be pending, accepted, rejected or completed"),

    body("meetingPlace")
      .if(body("status").equals("accepted"))
        .notEmpty()
      .withMessage("Meeting place is required to accept this trade"),

      body("meetingTime")
        .if(body("status").equals("accepted"))
        .notEmpty()
        .withMessage("Meeting time is required to accept this trade")
        .isISO8601()
        .withMessage("Meeting time must be valid date"),
];

export const validateTradeResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
