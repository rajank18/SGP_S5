import express from 'express';
import {
  createCourse,
  getCourses,
  getCourseById, // <-- IMPORT THE NEW FUNCTION
  assignFaculty,
  removeFaculty,
  getAllFaculty
} from '../controllers/admin.controller.js';

const router = express.Router();

router.post('/courses', createCourse);
router.get('/courses', getCourses);

// --- NEW ROUTE ---
// This route handles requests for a single course, e.g., /api/admin/courses/1
router.get('/courses/:courseId', getCourseById);

router.post('/courses/:courseId/faculty', assignFaculty);
router.delete('/courses/:courseId/faculty/:facultyId', removeFaculty);
router.get('/faculty', getAllFaculty);

export default router;