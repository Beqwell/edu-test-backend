const request = require('supertest');
const app = require('../app');
const db = require('../models');
const sequelize = db.sequelize;
const User = db.User;
const bcrypt = require('bcrypt');

let teacherToken;
let studentToken;
let testId;

describe('Test Passing Flow', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true, logging: false });

    // Create teacher and student
    await User.bulkCreate([
      {
        username: 'teacher3',
        password: await bcrypt.hash('pass123', 10),
        role: 'teacher'
      },
      {
        username: 'student3',
        password: await bcrypt.hash('pass123', 10),
        role: 'student'
      }
    ]);

    // Login teacher
    const tRes = await request(app).post('/api/auth/login').send({
      username: 'teacher3',
      password: 'pass123'
    });
    teacherToken = tRes.body.token;

    // Login student
    const sRes = await request(app).post('/api/auth/login').send({
      username: 'student3',
      password: 'pass123'
    });
    studentToken = sRes.body.token;

    // Teacher creates course
    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: 'Chemistry' });

    const joinCode = courseRes.body.join_code;

    // Student joins
    await request(app)
      .post('/api/courses/join')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ join_code: joinCode });

    // Create test
    const testRes = await request(app)
      .post('/api/tests')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Chem Quiz',
        courseId: courseRes.body.id,
        is_visible: true
      });

    testId = testRes.body.id;

    // Add question with one correct answer
    await request(app)
      .post(`/api/tests/${testId}/questions`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        question_text: 'What is H2O?',
        question_type: 'one',
        answers: [
          { answer_text: 'Water', is_correct: true },
          { answer_text: 'Oxygen', is_correct: false }
        ]
      });
  });

  test('GET /api/tests/:id - fetch full test structure', async () => {
    const res = await request(app)
      .get(`/api/tests/${testId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    // Should return question and answers
    expect(res.statusCode).toBe(200);
    expect(res.body.questions.length).toBeGreaterThan(0);
  });

  test('POST /api/tests/:id/pass - submit correct answer', async () => {
    // Get test to extract question + correct answer id
    const testData = await request(app)
      .get(`/api/tests/${testId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    const question = testData.body.questions[0];
    const correctAnswerId = question.answers.find(a => a.is_correct).id;

    const res = await request(app)
      .post(`/api/tests/${testId}/pass`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: {
          [question.id]: [correctAnswerId]
        }
      });

    // Should return score = 100%
    expect(res.statusCode).toBe(200);
    expect(res.body.score).toBe(100);
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
