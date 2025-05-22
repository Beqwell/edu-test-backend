const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// Parse JSON request bodies
app.use(express.json());

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Test management routes
app.use('/api/tests', require('./routes/testRoutes'));

// Question management for a specific test
app.use('/api/tests/:id/questions', require('./routes/questions'));

// Test results routes
app.use('/api/results', require('./routes/results'));

// Course management routes
app.use('/api/courses', require('./routes/courses'));

module.exports = app;
