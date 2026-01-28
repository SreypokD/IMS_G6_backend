const express = require('express');
const router = express.Router();
const reportingController = require('../controllers/reportingController');

const authenticateToken = require('../middleware/auth');

router.get('/inventory-summary', authenticateToken, reportingController.inventorySummary);
router.get('/order-stats', authenticateToken, reportingController.orderStats);

module.exports = router;