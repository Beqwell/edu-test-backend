const { Result, User, Test } = require('../models');

// Get all results for the current user (student or teacher)
const getAllResults = async (req, res) => {
    try {
        const { userId, role } = req.user;

        let results;
        if (role === 'student') {
            results = await Result.findAll({
                where: { studentId: userId },
                include: [{ model: Test, as: 'test' }]
            });
        } else if (role === 'teacher') {
            results = await Result.findAll({
                include: [
                    { model: Test, as: 'test', where: { teacherId: userId } },
                    { model: User, as: 'student' }
                ]
            });
        } else {
            return res.status(403).json({ message: 'Unknown role' });
        }

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single result by ID (with access check)
const getOneResult = async (req, res) => {
    const id = req.params.id;

    try {
        const result = await Result.findByPk(id, {
            include: [
                { model: Test, as: 'test' },
                { model: User, as: 'student' }
            ]
        });

        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        const { userId, role } = req.user;
        if (
            (role === 'student' && result.studentId !== userId) ||
            (role === 'teacher' && result.test.teacherId !== userId)
        ) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllResults, getOneResult };
