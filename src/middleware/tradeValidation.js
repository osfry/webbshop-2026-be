import { body, validationResult } from "express-validator";

export const validateTrade = [
  body("requester").isMongoId().withMessage("Requester must be a valid user id"),
  body("receiver").isMongoId().withMessage("Receiver must be a valid user id"),
  body("product").isMongoId().withMessage("Product must be a valid product id"),
  body("status")
    .optional()
    .isIn(["pending", "accepted", "rejected"])
    .withMessage("Status must be pending, accepted, or rejected"),
];

export const validateTradeStatus = [
  body("status").isIn(["pending", "accepted", "rejected"]).withMessage("Status must be pending, accepted, or rejected"),
];
export const validateTradeResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
