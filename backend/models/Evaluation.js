import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Evaluation = sequelize.define('Evaluation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  rubricId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'rubrics',
      key: 'id'
    }
  },
  facultyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  criteriaMarks: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Array of {criterionId, marks, feedback}'
  },
  totalMarks: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  generalFeedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'createdAt'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updatedAt'
  }
}, {
  tableName: 'evaluations',
  timestamps: true,
  underscored: false
});

export default Evaluation;
