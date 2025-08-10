import express from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  assignFaculty,
  removeFaculty,
  getAllFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty
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

// Course-Faculty assignment routes
router.post('/courses/:courseId/faculty', authenticateAdmin, assignFaculty);
router.delete('/courses/:courseId/faculty/:facultyId', authenticateAdmin, removeFaculty);
export default router;