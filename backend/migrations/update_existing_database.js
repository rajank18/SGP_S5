import sequelize from '../config/db.js';

/**
 * Migration: Update existing ProGrade database for rubrics and evaluations
 * This works with your existing database structure
 * Run this with: node migrations/update_existing_database.js
 */

async function runMigration() {
  try {
    console.log('Starting migration: Updating existing database...');

    // Step 1: Create course_rubrics table
    console.log('Creating course_rubrics table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS course_rubrics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        courseId INT NOT NULL,
        facultyId INT NOT NULL,
        rubricId INT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (facultyId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (rubricId) REFERENCES rubrics(id) ON DELETE CASCADE,
        UNIQUE KEY unique_course_faculty_rubric (courseId, facultyId, rubricId)
      ) ENGINE=InnoDB
    `);
    console.log('✓ course_rubrics table created/verified');

    // Step 2: Check if old evaluations table exists and drop it
    console.log('Checking for old evaluation tables...');
    try {
      await sequelize.query('DROP TABLE IF EXISTS evaluation_scores');
      console.log('✓ Dropped old evaluation_scores table');
    } catch (e) {
      console.log('  (evaluation_scores table did not exist)');
    }

    try {
      await sequelize.query('DROP TABLE IF EXISTS evaluations');
      console.log('✓ Dropped old evaluations table');
    } catch (e) {
      console.log('  (evaluations table did not exist)');
    }

    // Step 3: Create new evaluations table with correct structure
    console.log('Creating new evaluations table...');
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
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (rubricId) REFERENCES rubrics(id) ON DELETE CASCADE,
        FOREIGN KEY (facultyId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_project_rubric_evaluation (projectId, rubricId, facultyId)
      ) ENGINE=InnoDB
    `);
    console.log('✓ evaluations table created');

    // Step 4: Add reportPublicId and presentationPublicId to projects if not exists
    console.log('Updating projects table...');
    try {
      await sequelize.query(`
        ALTER TABLE projects 
        ADD COLUMN reportPublicId VARCHAR(255) DEFAULT NULL AFTER projectReportUrl
      `);
      console.log('✓ Added reportPublicId column to projects');
    } catch (e) {
      if (e.message.includes('Duplicate column')) {
        console.log('  (reportPublicId column already exists)');
      } else {
        throw e;
      }
    }

    try {
      await sequelize.query(`
        ALTER TABLE projects 
        ADD COLUMN presentationPublicId VARCHAR(255) DEFAULT NULL AFTER presentationUrl
      `);
      console.log('✓ Added presentationPublicId column to projects');
    } catch (e) {
      if (e.message.includes('Duplicate column')) {
        console.log('  (presentationPublicId column already exists)');
      } else {
        throw e;
      }
    }

    // Step 5: Verify tables
    console.log('\n--- Verification ---');
    const [tables] = await sequelize.query("SHOW TABLES LIKE '%rubric%' OR SHOW TABLES LIKE 'evaluations'");
    console.log('Tables created:', tables);

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Restart your backend server');
    console.log('2. Test the API endpoints');
    console.log('3. Check RUBRICS_EVALUATION_IMPLEMENTATION.md for usage guide');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\nError details:', error.message);
    process.exit(1);
  }
}

runMigration();
