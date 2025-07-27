import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Course = sequelize.define('Course', {
  courseCode: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  semester: { type: DataTypes.INTEGER, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.TEXT },
}, { tableName: 'courses', timestamps: true });

export default Course;