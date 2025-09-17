import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Criterion = sequelize.define('Criterion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  rubricId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  maxScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'criteria',
  timestamps: true,
});

export default Criterion;



