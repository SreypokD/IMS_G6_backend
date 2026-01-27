const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

const authenticateToken = require('../middleware/auth');
const { validateCategory } = require('../middleware/categoryValidator');

router.get('/', authenticateToken, categoryController.getAll);
router.post('/', authenticateToken, validateCategory, categoryController.create);
router.put('/:id', authenticateToken, categoryController.update);
router.delete('/:id', authenticateToken, categoryController.remove);

module.exports = router;