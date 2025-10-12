-- Migration: Create course_rubrics and evaluations tables

-- Create course_rubrics table
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
);

-- Create evaluations table
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
);

-- Verify the tables were created
SHOW TABLES LIKE '%rubric%';
SHOW TABLES LIKE 'evaluations';
