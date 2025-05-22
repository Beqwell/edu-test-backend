const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticate = require('../middlewares/authMiddleware');

// Get courses for the authenticated user (student or teacher)
router.get('/', authenticate, courseController.getCourses);

// Create a new course (teacher only)
router.post('/', authenticate, courseController.createCourse);

// Join a course using a join code (student only)
router.post('/join', authenticate, courseController.joinCourse);

// Delete a course and all related data (teacher only)
router.delete('/:id', authenticate, courseController.deleteCourse);

module.exports = router;
