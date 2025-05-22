const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authMiddleware');
const testController = require('../controllers/testController');

// GET /api/tests/by-course?courseId=... 
router.get('/by-course', authenticate, testController.getTestsByCourse);

// POST /api/tests/:testId/publish 
router.post('/:testId/publish', authenticate, testController.publishTest);

// GET /api/tests 
router.get('/', authenticate, testController.getVisibleTests);

// POST /api/tests 
router.post('/', authenticate, testController.createTest);

// GET /api/tests/:id 
router.get('/:id', authenticate, testController.getTestWithQuestions);

// POST /api/tests/:id/pass 
router.post('/:id/pass', authenticate, testController.submitTest);

// POST /api/tests/:testId/questions 
router.post('/:testId/questions', authenticate, testController.addQuestionToTest);

// GET /api/tests/me 
router.get('/me', authenticate, (req, res) => {
  res.json({
    message: `Hello, ${req.user.role}!`,
    user: req.user
  });
});

module.exports = router;
