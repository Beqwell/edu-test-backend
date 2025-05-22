const { Course, User, Test, Question, Answer, Result } = require('../models');
const { Op } = require('sequelize');

const generateJoinCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Create a new course (only for teachers)
const createCourse = async (req, res) => {
    try {
        if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Only teachers' });

        const { name } = req.body;
        const course = await Course.create({
            name,
            join_code: generateJoinCode(),
            teacherId: req.user.userId
        });

        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Join a course by join code (only for students)
const joinCourse = async (req, res) => {
    try {
        if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students' });

        const { join_code } = req.body;
        const course = await Course.findOne({ where: { join_code } });

        if (!course) return res.status(404).json({ message: 'Invalid code' });

        await course.addStudent(req.user.userId); // belongsToMany

        res.json({ message: 'Joined successfully', courseId: course.id });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get courses for current user (student or teacher)
const getCourses = async (req, res) => {
    try {
        if (req.user.role === 'student') {
            const user = await User.findByPk(req.user.userId);
            const courses = await user.getJoinedCourses();
            res.json(courses);
        } else if (req.user.role === 'teacher') {
            const courses = await Course.findAll({ where: { teacherId: req.user.userId } });
            res.json(courses);
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete course and all related data (only for teachers)
const deleteCourse = async (req, res) => {
    const courseId = req.params.id;

    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Only teachers can delete courses' });
        }

        const course = await Course.findByPk(courseId);
        if (!course || course.teacherId !== req.user.userId) {
            return res.status(404).json({ message: 'Course not found or unauthorized' });
        }

        const tests = await Test.findAll({ where: { courseId } });

        for (const test of tests) {
            const questions = await Question.findAll({ where: { testId: test.id } });

            for (const question of questions) {
                await Answer.destroy({ where: { questionId: question.id } });
            }

            await Question.destroy({ where: { testId: test.id } });
            await Result.destroy({ where: { testId: test.id } });
        }

        await Test.destroy({ where: { courseId } });
        await course.destroy();

        res.status(200).json({ message: 'Course and all related data deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting course' });
    }
};

module.exports = {
    createCourse,
    joinCourse,
    getCourses,
    deleteCourse
};
