'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      // Belongs to a Test
      Question.belongsTo(models.Test, {
        foreignKey: 'testId',
        as: 'test'
      });

      // Has many Answers
      Question.hasMany(models.Answer, {
        foreignKey: 'questionId',
        as: 'answers'
      });
    }
  }

  Question.init({
    question_text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    question_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['one', 'multi']]
      }
    },
    testId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Question',
  });

  return Question;
};
