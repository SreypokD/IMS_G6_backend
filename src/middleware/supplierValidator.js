// Express-validator middleware for validating supplier creation
const { body } = require('express-validator');

const validateSupplier = [
  body('name').isString().trim().notEmpty().withMessage('Supplier name is required'),
  body('contact').isString().trim().notEmpty().withMessage('Contact is required'),
  body('email').isEmail().withMessage('Valid email is required'),
];

module.exports = {
  validateSupplier,
};
