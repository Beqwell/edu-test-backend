const request = require('supertest');
const app = require('../app');
const db = require('../models');
const sequelize = db.sequelize;
const User = db.User;
const bcrypt = require('bcrypt');

describe('Login Route', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true, logging: false });

    // Create a user to test login
    await User.create({
      username: 'logintest',
      password: await bcrypt.hash('123456', 10),
      role: 'student'
    });
  });

  test('POST /api/auth/login - success', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'logintest',
      password: '123456'
    });

    // Should return 200 and token
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /api/auth/login - wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'logintest',
      password: 'wrongpass'
    });

    // Should return 400 for wrong credentials
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  test('POST /api/auth/login - unknown user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'nouser',
      password: '123456'
    });

    // Should return 400 for unknown user
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
