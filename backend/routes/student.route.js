import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { getMyProjects } from '../controllers/student.controller.js';

const router = express.Router();

// Get all project groups for the logged-in student
router.get('/projects', authenticateJWT, getMyProjects);

export default router;


