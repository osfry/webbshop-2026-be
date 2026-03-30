import { body, validationResult } from "express-validator";

export const validateProduct = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("image").trim().notEmpty().withMessage("Image is required"),
  body("lightRequirements")
    .isInt({ min: 1, max: 3 })
    .withMessage("Light requirements must be an integer between 1 and 3"),
  body("coordinates").trim().notEmpty().withMessage("Coordinates is required"),
  //TODO: Add more validation rules as needed
];

export const validateProductResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};