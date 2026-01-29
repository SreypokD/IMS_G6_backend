// Express-validator middleware for validating order request creation
const { body } = require('express-validator');

const validateOrderRequest = [
  body('product_id').isInt().withMessage('Product ID must be an integer'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('supplier_id').isInt().withMessage('Supplier ID must be an integer'),
  body('requested_by').isString().trim().notEmpty().withMessage('requested_by is required'),
];

module.exports = {
  validateOrderRequest,
};
