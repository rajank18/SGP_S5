import express from 'express';
import multer from 'multer';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  assignFaculty,
  removeFaculty,
  getAllFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getCourseAssignments,
  uploadStudents,
  getAllStudents,
  sendStudentEmails,
  exportMasterData
} from '../controllers/admin.controller.js';
import { authenticateAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Configure multer to use memory storage (no disk storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Test route to verify admin access
router.get('/test', authenticateAdmin, (req, res) => {
  res.json({ message: 'Admin route is working!', user: req.user });
});

// Faculty management routes - MUST come BEFORE course routes to avoid conflicts
router.get('/faculty', authenticateAdmin, getAllFaculty);
router.post('/faculty', authenticateAdmin, createFaculty);
router.put('/faculty/:facultyId', authenticateAdmin, updateFaculty);
router.delete('/faculty/:facultyId', authenticateAdmin, deleteFaculty);

// Course management routes
router.post('/courses', authenticateAdmin, createCourse);
router.get('/courses', authenticateAdmin, getCourses);
router.get('/courses/:courseId', authenticateAdmin, getCourseById);
router.put('/courses/:courseId', authenticateAdmin, updateCourse);
router.delete('/courses/:courseId', authenticateAdmin, deleteCourse);

// Course-Faculty assignment routes
router.post('/courses/:courseId/faculty', authenticateAdmin, assignFaculty);
router.delete('/courses/:courseId/faculty/:facultyId', authenticateAdmin, removeFaculty);

// Course assignments overview
router.get('/course-assignments', authenticateAdmin, getCourseAssignments);

// Student bulk upload
router.post('/upload-students', authenticateAdmin, upload.single('file'), uploadStudents);

// Student management
router.get('/students', authenticateAdmin, getAllStudents);

// Send emails to students
router.post('/send-emails', authenticateAdmin, sendStudentEmails);

// Export master data to Excel
router.get('/export-master-data', authenticateAdmin, exportMasterData);

export default router;