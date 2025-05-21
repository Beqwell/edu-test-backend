const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authMiddleware');
const testController = require('../controllers/testController');

// GET /api/tests — visible tests for students
router.get('/', authenticate, testController.getVisibleTests);

// POST /api/tests — create test (teachers only)
router.post('/', authenticate, testController.createTest);

// GET /api/tests/:id — get test with questions
router.get('/:id', authenticate, testController.getTestWithQuestions);

// POST /api/tests/:id/pass — submit test answers
router.post('/:id/pass', authenticate, testController.submitTest);

// Debug: check authentication info
router.get('/me', authenticate, (req, res) => {
  res.json({
    message: `Hello, ${req.user.role}!`,
    user: req.user
  });
});

module.exports = router;
