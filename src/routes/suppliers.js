const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

const authenticateToken = require('../middleware/auth');
const { validateSupplier } = require('../middleware/supplierValidator');

router.get('/', authenticateToken, supplierController.getAll);
router.post('/', authenticateToken, validateSupplier, supplierController.create);
router.patch('/:id', authenticateToken, supplierController.update);
router.delete('/:id', authenticateToken, supplierController.remove);

module.exports = router;