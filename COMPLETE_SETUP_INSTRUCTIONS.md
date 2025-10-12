# ✅ Complete Setup Instructions - Rubrics & Evaluation System

## 🎉 Everything is Ready!

All backend and frontend code is complete. Just follow these steps:

---

## Step 1: Run Database Migration ⚡

Open **MySQL Workbench** and run this SQL:

```sql
USE prograde_db;

-- Create course_rubrics table
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

-- Drop old evaluations structure
DROP TABLE IF EXISTS evaluation_scores;
DROP TABLE IF EXISTS evaluations;

-- Create new evaluations table
CREATE TABLE evaluations (
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

-- Add Cloudinary columns to projects
ALTER TABLE projects 
ADD COLUMN reportPublicId VARCHAR(255) DEFAULT NULL AFTER projectReportUrl;

ALTER TABLE projects 
ADD COLUMN presentationPublicId VARCHAR(255) DEFAULT NULL AFTER presentationUrl;

-- Verify
SHOW TABLES LIKE '%rubric%';
DESCRIBE evaluations;
```

---

## Step 2: Restart Backend Server 🔄

```bash
cd backend
npm start
```

---

## Step 3: Test the Features! 🧪

### ✅ Admin Features:

1. **Delete Rubric:**
   - Go to Admin → Rubrics
   - Click the trash icon on any rubric
   - Confirm deletion

2. **Assign Rubrics to Course:**
   - Go to Admin → Course Assignments
   - Select Course and Faculty
   - **Check the rubrics you want to assign** (new checkboxes below)
   - Click "Assign"
   - Should see: "Course assigned with X rubric(s)"

### ✅ Faculty Features:

1. **Evaluate Project:**
   - Login as faculty
   - Go to a course → Select a group
   - Click **"Evaluate Project"** button (blue button at top)
   - Select a rubric
   - Enter marks for each criterion
   - Enter feedback
   - Click "Save Evaluation"

### ✅ Student Features:

1. **View Evaluations:**
   - Login as student
   - Go to your project details
   - Click **"View Evaluations"** button (green button at top)
   - See all evaluations with marks and feedback

---

## 🎯 What You'll See:

### Admin - Course Assignments Page:
```
┌─────────────────────────────────────┐
│ Course: [Select]  Faculty: [Select] │
│                                     │
│ Assign Rubrics (Optional):          │
│ ☑ SGP Official Rubric               │
│ ☐ Custom Rubric 1                   │
│ ☐ Custom Rubric 2                   │
│                                     │
│ [Assign Button]                     │
└─────────────────────────────────────┘
```

### Faculty - Group Details Page:
```
┌─────────────────────────────────────┐
│ ProGrade - Group 1                  │
│ [Evaluate Project] [Back to course] │
└─────────────────────────────────────┘
```

### Student - Project Details Page:
```
┌─────────────────────────────────────┐
│ ProGrade - Group 1                  │
│ [View Evaluations] [Back]           │
└─────────────────────────────────────┘
```

---

## 📝 Files Modified/Created:

### Backend:
✅ `backend/models/CourseRubric.js` - NEW
✅ `backend/models/Evaluation.js` - NEW
✅ `backend/controllers/evaluation.controller.js` - NEW
✅ `backend/routes/evaluation.route.js` - NEW
✅ `backend/controllers/admin.controller.js` - Updated
✅ `backend/controllers/rubric.controller.js` - Updated
✅ `backend/routes/rubric.route.js` - Updated
✅ `backend/index.js` - Updated
✅ `backend/models/index.js` - Updated

### Frontend:
✅ `frontend/src/pages/admin/Rubrics.jsx` - Updated (delete button)
✅ `frontend/src/pages/admin/CourseAssignments.jsx` - Updated (rubric selection)
✅ `frontend/src/pages/faculty/ProjectEvaluation.jsx` - NEW
✅ `frontend/src/pages/faculty/GroupDetails.jsx` - Updated (evaluate button)
✅ `frontend/src/pages/student/ProjectEvaluations.jsx` - NEW
✅ `frontend/src/pages/student/StudentProjectDetails.jsx` - Updated (view button)
✅ `frontend/src/routes/FacultyRoutes.jsx` - Updated (new route)
✅ `frontend/src/routes/StudentRoutes.jsx` - Updated (new route)

---

## 🚀 Quick Test Workflow:

### Test 1: Admin assigns rubric
1. Login as admin
2. Go to Course Assignments
3. Select course and faculty
4. Check "SGP Official Rubric"
5. Click Assign
6. ✅ Should see: "Course assigned with 1 rubric(s)"

### Test 2: Faculty evaluates project
1. Login as faculty (Dr. Akash Patel)
2. Go to a course
3. Click on a group
4. Click "Evaluate Project" button
5. Select rubric
6. Enter marks and feedback
7. Click Save
8. ✅ Should see: "Evaluation saved successfully"

### Test 3: Student views evaluation
1. Login as student (Rajan Kanzariya)
2. Go to project details
3. Click "View Evaluations" button
4. ✅ Should see evaluation with marks and feedback

---

## ❓ Troubleshooting:

### "No rubrics assigned to this course"
- Admin needs to assign rubrics when assigning faculty to course
- Go to Course Assignments → Re-assign with rubrics checked

### "No evaluations yet"
- Faculty hasn't evaluated the project yet
- Faculty needs to click "Evaluate Project" and save

### Buttons not visible
- ✅ Already added! Check:
  - Faculty: GroupDetails page → "Evaluate Project" button
  - Student: StudentProjectDetails page → "View Evaluations" button

### Migration errors
- Make sure you're using `prograde_db` database
- Check that all referenced tables exist (courses, users, rubrics, projects)

---

## 🎊 You're All Set!

Everything is implemented and ready to use:
- ✅ Backend API complete
- ✅ Frontend UI complete
- ✅ Routes configured
- ✅ Buttons added
- ✅ Database migration ready

Just run the SQL migration and test! 🚀
