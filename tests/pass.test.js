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
        username: 'teacherX',
        password: await bcrypt.hash('pass123', 10),
        role: 'teacher'
      },
      {
        username: 'studentX',
        password: await bcrypt.hash('pass123', 10),
        role: 'student'
      }
    ]);

    // Login teacher
    const tRes = await request(app).post('/api/auth/login').send({
      username: 'teacherX',
      password: 'pass123'
    });
    teacherToken = tRes.body.token;

    // Login student
    const sRes = await request(app).post('/api/auth/login').send({
      username: 'studentX',
      password: 'pass123'
    });
    studentToken = sRes.body.token;

    // Create course
    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: 'Physics' });

    const joinCode = courseRes.body.join_code;

    // Student joins course
    await request(app)
      .post('/api/courses/join')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ join_code: joinCode });

    // Create test
    const testRes = await request(app)
      .post('/api/tests')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Physics Basics',
        courseId: courseRes.body.id
      });

    testId = testRes.body.id;

    // Add question with correct answer
    await request(app)
      .post(`/api/tests/${testId}/questions`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        text: 'What is the speed of light?',
        isMultiple: false,
        answers: [
          { text: '3 x 10^8 m/s', isCorrect: true },
          { text: '1.5 x 10^7 m/s', isCorrect: false }
        ]
      });

    // Publish the test
    await request(app)
      .post(`/api/tests/${testId}/publish`)
      .set('Authorization', `Bearer ${teacherToken}`);
  });

  // Check test structure
  test('GET /api/tests/:id returns test with questions', async () => {
    const res = await request(app)
      .get(`/api/tests/${testId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.questions.length).toBeGreaterThan(0);
  });

  // Submit correct answer
  test('POST /api/tests/:id/pass returns 100% score', async () => {
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

    expect(res.statusCode).toBe(200);
    expect(res.body.scorePercentage).toBe(100);
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
