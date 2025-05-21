const { Test, Question, Answer, Result, Course, User } = require('../models');

// Returns all visible tests for the student's joined courses
const getVisibleTests = async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can view tests' });
        }

        const student = await User.findByPk(req.user.userId);
        const courses = await student.getJoinedCourses();
        const courseIds = courses.map(course => course.id);

        const tests = await Test.findAll({
            where: {
                is_visible: true,
                courseId: courseIds.length ? courseIds : null
            }
        });

        res.json(tests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Allows a teacher to create a new test for their course
const createTest = async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Only teachers can create tests' });
        }

        const { title, is_visible, courseId } = req.body;

        const course = await Course.findOne({
            where: { id: courseId, teacherId: req.user.userId }
        });

        if (!course) {
            return res.status(403).json({ message: 'You do not own this course' });
        }

        const newTest = await Test.create({
            title,
            is_visible: is_visible ?? true,
            teacherId: req.user.userId,
            courseId
        });

        res.status(201).json(newTest);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Returns a test with its questions and answers
const getTestWithQuestions = async (req, res) => {
    const testId = req.params.id;

    try {
        const test = await Test.findByPk(testId, {
            include: {
                model: Question,
                as: 'questions',
                include: {
                    model: Answer,
                    as: 'answers'
                }
            }
        });

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        res.json(test);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Handles student test submission and calculates score
const submitTest = async (req, res) => {
    const testId = req.params.id;
    const studentId = req.user.userId;
    const userAnswers = req.body.answers; // { questionId: [answerIds] }

    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can pass tests' });
        }

        const questions = await Question.findAll({
            where: { testId },
            include: { model: Answer, as: 'answers' }
        });

        let correct = 0;

        for (const question of questions) {
            const correctAnswerIds = question.answers
                .filter(a => a.is_correct)
                .map(a => a.id)
                .sort();

            const submitted = (userAnswers[question.id] || []).sort();

            if (JSON.stringify(correctAnswerIds) === JSON.stringify(submitted)) {
                correct++;
            }
        }

        const total = questions.length;
        const percent = Math.round((correct / total) * 100);

        const result = await Result.create({
            studentId,
            testId,
            score_percent: percent,
            correct_count: correct,
            total_count: total
        });

        res.json({ message: 'Test submitted', resultId: result.id, score: percent });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getVisibleTests,
    createTest,
    getTestWithQuestions,
    submitTest
};
