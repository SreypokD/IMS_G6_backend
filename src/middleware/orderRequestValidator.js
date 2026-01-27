// Express-validator middleware for validating order request creation
const { body } = require('express-validator');

const validateOrderRequest = [
  body('productId').isInt().withMessage('Product ID must be an integer'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('supplierId').isInt().withMessage('Supplier ID must be an integer'),
  body('requestedBy').isString().trim().notEmpty().withMessage('RequestedBy is required'),
];

module.exports = {
  validateOrderRequest,
};
