import express from 'express';
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
  getAllStudents
} from '../controllers/admin.controller.js';
import { authenticateAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

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
router.post('/upload-students', authenticateAdmin, uploadStudents);

// Student management
router.get('/students', authenticateAdmin, getAllStudents);

export default router;