import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const CourseFaculty = sequelize.define('CourseFaculty', {
  courseId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  facultyId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
}, { 
  tableName: 'course_faculty', 
  timestamps: true
});

export default CourseFaculty;