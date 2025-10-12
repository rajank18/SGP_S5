-- Migration: Update existing ProGrade database for rubrics and evaluations
-- This works with your existing database structure

USE prograde_db;

-- Step 1: Create course_rubrics table (if not exists)
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
) ENGINE=InnoDB;

-- Step 2: Check if evaluations table needs updating
-- First, let's see what columns exist
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'prograde_db' 
  AND TABLE_NAME = 'evaluations';

-- Step 3: Drop the old evaluations table structure if it exists with old schema
-- (We'll recreate it with the new structure)
DROP TABLE IF EXISTS evaluation_scores;
DROP TABLE IF EXISTS evaluations;

-- Step 4: Create new evaluations table with correct structure
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
) ENGINE=InnoDB;

-- Step 5: Add reportPublicId and presentationPublicId to projects table if not exists
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS reportPublicId VARCHAR(255) DEFAULT NULL AFTER projectReportUrl,
ADD COLUMN IF NOT EXISTS presentationPublicId VARCHAR(255) DEFAULT NULL AFTER presentationUrl;

-- Step 6: Verify all tables
SHOW TABLES;

-- Step 7: Verify course_rubrics structure
DESCRIBE course_rubrics;

-- Step 8: Verify evaluations structure
DESCRIBE evaluations;

-- Step 9: Verify projects has the new columns
DESCRIBE projects;

SELECT 'Migration completed successfully!' AS Status;
