import sequelize from '../config/db.js';

// Import all your models
import User from './User.js';
import Department from './Department.js';
import Course from './Course.js';
import CourseFaculty from './CourseFaculty.js';
import Project from './Project.js';
import ProjectParticipant from './ProjectParticipant.js';
import Rubric from './Rubric.js';
import Criterion from './Criterion.js';
import CourseRubric from './CourseRubric.js';
import Evaluation from './Evaluation.js';

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

// Project and User (Faculty as internal guide) Relationship
Project.belongsTo(User, {
  foreignKey: 'internalGuideId',
  as: 'internalGuide',
});
User.hasMany(Project, {
  foreignKey: 'internalGuideId',
  as: 'guidedProjects',
});

// Project and Course Relationship
Course.hasMany(Project, {
  foreignKey: 'courseId',
  as: 'projects',
});
Project.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course',
});

// Rubric and Criterion Relationship
Rubric.hasMany(Criterion, {
  foreignKey: 'rubricId',
  as: 'criteria',
});
Criterion.belongsTo(Rubric, {
  foreignKey: 'rubricId',
  as: 'rubric',
});

// User (Faculty) and Rubric Relationship (creator)
User.hasMany(Rubric, {
  foreignKey: 'creatorId',
  as: 'createdRubrics',
});
Rubric.belongsTo(User, {
  foreignKey: 'creatorId',
  as: 'creator',
});

// CourseRubric Relationships
Course.hasMany(CourseRubric, {
  foreignKey: 'courseId',
  as: 'assignedRubrics',
});
CourseRubric.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course',
});

User.hasMany(CourseRubric, {
  foreignKey: 'facultyId',
  as: 'rubricAssignments',
});
CourseRubric.belongsTo(User, {
  foreignKey: 'facultyId',
  as: 'faculty',
});

Rubric.hasMany(CourseRubric, {
  foreignKey: 'rubricId',
  as: 'courseAssignments',
});
CourseRubric.belongsTo(Rubric, {
  foreignKey: 'rubricId',
  as: 'rubric',
});

// Evaluation Relationships
Project.hasMany(Evaluation, {
  foreignKey: 'projectId',
  as: 'evaluations',
});
Evaluation.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project',
});

Course.hasMany(Evaluation, {
  foreignKey: 'courseId',
  as: 'evaluations',
});
Evaluation.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course',
});

Rubric.hasMany(Evaluation, {
  foreignKey: 'rubricId',
  as: 'evaluations',
});
Evaluation.belongsTo(Rubric, {
  foreignKey: 'rubricId',
  as: 'rubric',
});

User.hasMany(Evaluation, {
  foreignKey: 'facultyId',
  as: 'givenEvaluations',
});
Evaluation.belongsTo(User, {
  foreignKey: 'facultyId',
  as: 'evaluator',
});

// Export all models and the sequelize instance
export {
  sequelize,
  User,
  Department,
  Course,
  CourseFaculty,
  Project,
  ProjectParticipant,
  Rubric,
  Criterion,
  CourseRubric,
  Evaluation,
};