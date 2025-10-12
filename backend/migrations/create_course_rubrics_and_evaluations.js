import sequelize from '../config/db.js';

/**
 * Migration: Create course_rubrics and evaluations tables
 * Run this with: node migrations/create_course_rubrics_and_evaluations.js
 */

async function runMigration() {
  try {
    console.log('Starting migration: Creating course_rubrics and evaluations tables...');

    // Create course_rubrics table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS course_rubrics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        courseId INT NOT NULL,
        facultyId INT NOT NULL,
        rubricId INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (facultyId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (rubricId) REFERENCES rubrics(id) ON DELETE CASCADE,
        UNIQUE KEY unique_course_faculty_rubric (courseId, facultyId, rubricId)
      )
    `);
    console.log('✓ Created course_rubrics table');

    // Create evaluations table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS evaluations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        courseId INT NOT NULL,
        projectId INT NOT NULL,
        rubricId INT NOT NULL,
        facultyId INT NOT NULL,
        criteriaMarks JSON NOT NULL COMMENT 'Array of {criterionId, marks, feedback}',
        totalMarks INT DEFAULT NULL,
        generalFeedback TEXT DEFAULT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (rubricId) REFERENCES rubrics(id) ON DELETE CASCADE,
        FOREIGN KEY (facultyId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_project_rubric_evaluation (projectId, rubricId, facultyId)
      )
    `);
    console.log('✓ Created evaluations table');

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
