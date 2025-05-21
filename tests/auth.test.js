const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');

describe('Register Route', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true, logging: false });
  });

  test('POST /api/auth/register - success', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'newuser',
      password: '123456',
      role: 'student'
    });

    // Should return 201 and userId
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('userId');
  });

  test('POST /api/auth/register - duplicate user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'newuser',
      password: '123456',
      role: 'student'
    });

    // Should return 400 if user already exists
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/exists/i);
  });

  test('POST /api/auth/register - invalid role', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'badrole',
      password: '123456',
      role: 'admin'
    });

    // Should reject unknown role
    expect(res.statusCode).toBe(400);
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
