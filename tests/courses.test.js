const request = require('supertest');
const app = require('../app');
const db = require('../models');
const sequelize = db.sequelize;
const User = db.User;
const bcrypt = require('bcrypt');

let teacherToken;
let studentToken;
let joinCode;

describe('Courses API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true, logging: false });

    // Create teacher
    await User.create({
      username: 'teacher1',
      password: await bcrypt.hash('teachpass', 10),
      role: 'teacher'
    });

    // Create student
    await User.create({
      username: 'student1',
      password: await bcrypt.hash('studpass', 10),
      role: 'student'
    });

    // Login teacher
    const teacherLogin = await request(app).post('/api/auth/login').send({
      username: 'teacher1',
      password: 'teachpass'
    });
    teacherToken = teacherLogin.body.token;

    // Login student
    const studentLogin = await request(app).post('/api/auth/login').send({
      username: 'student1',
      password: 'studpass'
    });
    studentToken = studentLogin.body.token;
  });

  test('POST /api/courses - create course (teacher)', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: 'Physics' });

    // Expect course created with join code
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('join_code');
    joinCode = res.body.join_code;
  });

  test('POST /api/courses/join - student joins course', async () => {
    const res = await request(app)
      .post('/api/courses/join')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ join_code: joinCode });

    // Should succeed
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/joined/i);
  });

  test('GET /api/courses - get courses (teacher)', async () => {
    const res = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/courses - get courses (student)', async () => {
    const res = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
