'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Teacher creates tests
      User.hasMany(models.Test, {
        foreignKey: 'teacherId',
        as: 'createdTests'
      });

      // Student has results
      User.hasMany(models.Result, {
        foreignKey: 'studentId',
        as: 'results'
      });

      // Teacher creates courses
      User.hasMany(models.Course, {
        foreignKey: 'teacherId',
        as: 'createdCourses'
      });

      // Student joins courses (many-to-many)
      User.belongsToMany(models.Course, {
        through: 'CourseStudents',
        foreignKey: 'studentId',
        otherKey: 'courseId',
        as: 'joinedCourses'
      });
    }
  }

  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['student', 'teacher']]
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};
