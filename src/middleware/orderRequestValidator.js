// Express-validator middleware for validating order request creation
const { body } = require("express-validator");

const validateOrderRequest = [
  body("product")
    .isString()
    .isLength({ min: 24, max: 24 })
    .withMessage("Product ID must be a 24-character string"),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  body("supplier")
    .isString()
    .isLength({ min: 24, max: 24 })
    .withMessage("Supplier must be a 24-character string"),
  body("requested_by")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("requested_by is required"),
];

module.exports = {
  validateOrderRequest,
};
