const { Question, Answer, Test } = require('../models');

/**
 * Adds a new question (with answers) to a test.
 * Only teachers are allowed to perform this action.
 */
const addQuestionToTest = async (req, res) => {
    const testId = req.params.id;
    const { question_text, question_type, answers } = req.body;

    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Only teachers can add questions' });
        }

        const test = await Test.findByPk(testId);
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        const question = await Question.create({
            question_text,
            question_type,
            testId
        });

        if (Array.isArray(answers)) {
            for (const answer of answers) {
                await Answer.create({
                    answer_text: answer.answer_text,
                    is_correct: answer.is_correct,
                    questionId: question.id
                });
            }
        }

        res.status(201).json({ message: 'Question created', questionId: question.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { addQuestionToTest };
