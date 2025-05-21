const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authMiddleware');
const resultController = require('../controllers/resultController');

// Get all results (for student or teacher)
router.get('/', authenticate, resultController.getAllResults);

// Get result by ID (detailed)
router.get('/:id', authenticate, resultController.getOneResult);

module.exports = router;
