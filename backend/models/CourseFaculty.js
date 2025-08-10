import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const CourseFaculty = sequelize.define('CourseFaculty', {
  courseId: { type: DataTypes.INTEGER, primaryKey: true },
  facultyId: { type: DataTypes.INTEGER, primaryKey: true },
}, { tableName: 'course_faculty', timestamps: true });

export default CourseFaculty;