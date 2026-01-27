// Express-validator middleware for validating product creation
const { body } = require('express-validator');

const validateProduct = [
  body('name').isString().trim().notEmpty().withMessage('Product name is required'),
  body('categoryId').isInt().withMessage('Category ID must be an integer'),
  body('supplierId').isInt().withMessage('Supplier ID must be an integer'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

module.exports = {
  validateProduct,
};
