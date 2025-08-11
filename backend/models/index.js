import sequelize from '../config/db.js';

// Import all your models
import User from './User.js';
import Department from './Department.js';
import Course from './Course.js';
import CourseFaculty from './CourseFaculty.js';
import Project from './Project.js';
import ProjectParticipant from './ProjectParticipant.js';

// --- Define Relationships ---

// Department and User Relationship
Department.hasMany(User, {
  foreignKey: 'departmentId',
  as: 'users',
});
User.belongsTo(Department, {
  foreignKey: 'departmentId',
  as: 'department',
});

// Course and CourseFaculty Relationship
Course.hasMany(CourseFaculty, {
  foreignKey: 'courseId',
  as: 'facultyAssignments',
});
CourseFaculty.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course',
});

// User (Faculty) and CourseFaculty Relationship
User.hasMany(CourseFaculty, {
  foreignKey: 'facultyId',
  as: 'courseAssignments',
});
CourseFaculty.belongsTo(User, {
  foreignKey: 'facultyId',
  as: 'faculty',
});

// Project and ProjectParticipant Relationship
Project.hasMany(ProjectParticipant, {
  foreignKey: 'projectId',
  as: 'participants', // This 'as' alias MUST match the one in your controller
});
ProjectParticipant.belongsTo(Project, {
  foreignKey: 'projectId',
});

// ProjectParticipant and User (Student) Relationship
ProjectParticipant.belongsTo(User, {
  foreignKey: 'studentId',
  as: 'student', // This 'as' alias MUST match the one in your controller
});
User.hasMany(ProjectParticipant, {
  foreignKey: 'studentId',
});

// --- Add other relationships here as needed ---
// Example:
// Course.hasMany(Project, { foreignKey: 'courseId' });
// Project.belongsTo(Course, { foreignKey: 'courseId' });


// Export all models and the sequelize instance
export {
  sequelize,
  User,
  Department,
  Course,
  CourseFaculty,
  Project,
  ProjectParticipant,
};