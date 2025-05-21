require('dotenv').config(); // Load environment variables from .env file

module.exports = {
  development: {
    username: process.env.DB_USERNAME, // DB user for development
    password: process.env.DB_PASSWORD, // DB password for development
    database: process.env.DB_NAME,     // DB name for development
    host: process.env.DB_HOST,         // DB host for development
    port: process.env.DB_PORT,         // DB port for development
    dialect: "postgres"                // DB dialect
  },
  test: {
    username: process.env.DB_USERNAME, // DB user for testing
    password: process.env.DB_PASSWORD, // DB password for testing
    database: process.env.DB_NAME,     // DB name for testing
    host: process.env.DB_HOST,         // DB host for testing
    port: process.env.DB_PORT,         // DB port for testing
    dialect: "postgres"                // DB dialect
  },
  production: {
    username: process.env.DB_USERNAME, // DB user for production
    password: process.env.DB_PASSWORD, // DB password for production
    database: process.env.DB_NAME,     // DB name for production
    host: process.env.DB_HOST,         // DB host for production
    port: process.env.DB_PORT,         // DB port for production
    dialect: "postgres"                // DB dialect
  }
};
