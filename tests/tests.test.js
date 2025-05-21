const request = require('supertest');
const app = require('../app');
const db = require('../models');
const sequelize = db.sequelize;
const User = db.User;
const bcrypt = require('bcrypt');

let teacherToken;
let studentToken;
let courseId;

describe('Tests API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true, logging: false });

    // Create teacher & student
    await User.bulkCreate([
      {
        username: 'teacher2',
        password: await bcrypt.hash('123456', 10),
        role: 'teacher'
      },
      {
        username: 'student2',
        password: await bcrypt.hash('123456', 10),
        role: 'student'
      }
    ]);

    // Login teacher
    const tLogin = await request(app).post('/api/auth/login').send({
      username: 'teacher2',
      password: '123456'
    });
    teacherToken = tLogin.body.token;

    // Login student
    const sLogin = await request(app).post('/api/auth/login').send({
      username: 'student2',
      password: '123456'
    });
    studentToken = sLogin.body.token;

    // Teacher creates course
    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: 'Biology' });

    courseId = courseRes.body.id;

    // Student joins
    await request(app)
      .post('/api/courses/join')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ join_code: courseRes.body.join_code });
  });

  test('POST /api/tests - create test in course', async () => {
    const res = await request(app)
      .post('/api/tests')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Bio Final',
        is_visible: true,
        courseId: courseId
      });

    // Should return test object
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Bio Final');
  });

  test('GET /api/tests - visible tests for student', async () => {
    const res = await request(app)
      .get('/api/tests')
      .set('Authorization', `Bearer ${studentToken}`);

    // Student should see the test
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].title).toBe('Bio Final');
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
