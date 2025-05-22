const request = require('supertest');
const app = require('../app');
const db = require('../models');
const sequelize = db.sequelize;
const User = db.User;
const bcrypt = require('bcrypt');

let teacherToken;
let studentToken;
let courseId;
let testId;

describe('Tests API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true, logging: false });

    // Create users
    await User.bulkCreate([
      {
        username: 'teacher2',
        password: await bcrypt.hash('pass123', 10),
        role: 'teacher'
      },
      {
        username: 'student2',
        password: await bcrypt.hash('pass123', 10),
        role: 'student'
      }
    ]);

    // Teacher login
    const tRes = await request(app).post('/api/auth/login').send({
      username: 'teacher2',
      password: 'pass123'
    });
    teacherToken = tRes.body.token;

    // Student login
    const sRes = await request(app).post('/api/auth/login').send({
      username: 'student2',
      password: 'pass123'
    });
    studentToken = sRes.body.token;

    // Create course
    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: 'Biology' });

    courseId = courseRes.body.id;
    const joinCode = courseRes.body.join_code;

    // Student joins course
    await request(app)
      .post('/api/courses/join')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ join_code: joinCode });
  });

  // Create and publish test
  test('POST /api/tests - create and publish test in course', async () => {
    const res = await request(app)
      .post('/api/tests')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Bio Final',
        courseId: courseId
      });

    testId = res.body.id;

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');

    // Publish the test
    const publishRes = await request(app)
      .post(`/api/tests/${testId}/publish`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(publishRes.statusCode).toBe(200);
    expect(publishRes.body.message).toBe('Test published');
  });

  // Check visible tests for student
  test('GET /api/tests - student sees published test', async () => {
    const res = await request(app)
      .get('/api/tests')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.find(t => t.title === 'Bio Final')).toBeDefined();
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
