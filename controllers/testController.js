const { Test, Question, Answer, Result, Course, User } = require('../models');

// Student sees only published tests
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
      },
      include: {
        model: Course,
        as: 'course',
        attributes: ['name']
      }
    });

    res.json(tests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Teacher sees tests by course
const getTestsByCourse = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers' });
    }

    const { courseId } = req.query;

    const tests = await Test.findAll({
      where: {
        courseId,
        teacherId: req.user.userId
      }
    });

    res.json(tests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new test (draft)
const createTest = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create tests' });
    }

    const { title, courseId } = req.body;

    const course = await Course.findOne({
      where: { id: courseId, teacherId: req.user.userId }
    });

    if (!course) {
      return res.status(403).json({ message: 'You do not own this course' });
    }

    const newTest = await Test.create({
      title,
      is_visible: false,
      teacherId: req.user.userId,
      courseId
    });

    res.status(201).json(newTest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Publish test
const publishTest = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can publish tests' });
    }

    const { testId } = req.params;
    const test = await Test.findByPk(testId);

    if (!test || test.teacherId !== req.user.userId) {
      return res.status(404).json({ message: 'Test not found or unauthorized' });
    }

    test.is_visible = true;
    await test.save();

    res.json({ message: 'Test published' });
  } catch (err) {
    console.error('Error publishing test:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get test with all questions
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

// Student submits test
const submitTest = async (req, res) => {
  const testId = req.params.id;
  const studentId = req.user.userId;
  const userAnswers = req.body.answers;

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

    res.json({
      message: 'Test submitted',
      resultId: result.id,
      correctAnswers: correct,
      totalQuestions: total,
      scorePercentage: percent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add question to test
const addQuestionToTest = async (req, res) => {
  const { testId } = req.params;
  const { text, isMultiple, answers } = req.body;

  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can add questions' });
    }

    const question = await Question.create({
      testId,
      question_text: text,
      question_type: isMultiple ? 'multiple' : 'one'
    });

    for (const answer of answers) {
      await Answer.create({
        questionId: question.id,
        answer_text: answer.text,
        is_correct: answer.isCorrect
      });
    }

    res.status(201).json({ message: 'Question added' });
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getVisibleTests,
  getTestsByCourse,
  createTest,
  publishTest,
  getTestWithQuestions,
  submitTest,
  addQuestionToTest
};
