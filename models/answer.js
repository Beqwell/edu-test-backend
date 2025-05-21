'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {
    static associate(models) {
      // Each answer belongs to a question
      Answer.belongsTo(models.Question, {
        foreignKey: 'questionId',
        as: 'question'
      });
    }
  }

  Answer.init({
    answer_text: {
      type: DataTypes.STRING,
      allowNull: false // Answer text is required
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      defaultValue: false // Default: answer is not correct
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false // Reference to related question
    }
  }, {
    sequelize,
    modelName: 'Answer',
  });

  return Answer;
};
