const express = require('express');
const router = express.Router({ mergeParams: true });
const authenticate = require('../middlewares/authMiddleware');
const questionController = require('../controllers/questionController');

// Add a question to a test
router.post('/', authenticate, questionController.addQuestionToTest);

module.exports = router;
