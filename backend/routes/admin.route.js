import express from 'express';
import {
  createCourse, getCourses, assignFaculty, removeFaculty, getAllFaculty
} from '../controllers/admin.controller.js';

const router = express.Router();

router.post('/courses', createCourse);
router.get('/courses', getCourses);
router.post('/courses/:courseId/faculty', assignFaculty);
router.delete('/courses/:courseId/faculty/:facultyId', removeFaculty);
router.get('/faculty', getAllFaculty);

export default router;