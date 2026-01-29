const express = require('express');
const router = express.Router();
const orderRequestController = require('../controllers/orderRequestController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, (req, res) => orderRequestController.getAll(req, res, { status: 'pending' }));
router.patch('/:id', authenticateToken, orderRequestController.updateStatus);

module.exports = router;
