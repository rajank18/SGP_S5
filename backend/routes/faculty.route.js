import express from 'express';
import multer from 'multer';
import { getAssignedCourses, uploadProjects, getCourseProjects, uploadGroups, exportCourseData, notifyStudents } from '../controllers/faculty.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Configure multer to use memory storage (no disk storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// --- EXISTING ROUTE ---
// This route fetches the courses assigned to the logged-in faculty.
router.get('/courses', authenticateJWT, getAssignedCourses);

// --- NEW ROUTE ---
// This route handles the CSV file upload for a specific course.
// It's protected by the JWT middleware and uses multer to handle the file.
router.post(
  '/courses/:courseId/projects/upload',
  authenticateJWT,
  upload.single('file'), // 'file' MUST match the key used in your frontend FormData
  uploadProjects
);
router.get('/courses/:courseId/projects', authenticateJWT, getCourseProjects);

// New route: upload groups via CSV
router.post('/upload-groups', authenticateJWT, upload.single('file'), uploadGroups);

// Export course data
router.get('/courses/:courseId/export', authenticateJWT, exportCourseData);

// Notify students about submission deadlines (report/presentation)
router.post('/courses/:courseId/projects/:projectId/notify-students', authenticateJWT, notifyStudents);

export default router;
