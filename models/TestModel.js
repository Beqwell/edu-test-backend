'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Test extends Model {
    static associate(models) {
      // Тест належить до викладача
      Test.belongsTo(models.User, {
        foreignKey: 'teacherId',
        as: 'teacher'
      });

      // Тест належить до курсу
      Test.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course'
      });

      // Тест має багато запитань
      Test.hasMany(models.Question, {
        foreignKey: 'testId',
        as: 'questions'
      });

      // Тест має багато результатів
      Test.hasMany(models.Result, {
        foreignKey: 'testId',
        as: 'results'
      });
    }
  }

  Test.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Test',
  });

  return Test;
};
