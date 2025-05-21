'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {
      // Course belongs to a teacher (User)
      Course.belongsTo(models.User, {
        foreignKey: 'teacherId',
        as: 'teacher'
      });

      // Course has many tests
      Course.hasMany(models.Test, {
        foreignKey: 'courseId',
        as: 'tests'
      });

      // Course has many students (many-to-many with User)
      Course.belongsToMany(models.User, {
        through: 'CourseStudents',
        foreignKey: 'courseId',
        otherKey: 'studentId',
        as: 'students'
      });
    }
  }

  Course.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    join_code: {
      type: DataTypes.STRING,
      unique: true
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Course',
  });

  return Course;
};
