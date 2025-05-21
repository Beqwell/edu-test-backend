'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Result extends Model {
    static associate(models) {
      // Result belongs to a student (User)
      Result.belongsTo(models.User, {
        foreignKey: 'studentId',
        as: 'student'
      });

      // Result belongs to a test
      Result.belongsTo(models.Test, {
        foreignKey: 'testId',
        as: 'test'
      });
    }
  }

  Result.init({
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    testId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    score_percent: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    correct_count: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total_count: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Result',
  });

  return Result;
};
