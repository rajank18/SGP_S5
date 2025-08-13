import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { getMyProjects, getProjectDetails, updateMyProject } from '../controllers/student.controller.js';

const router = express.Router();

// Get all project groups for the logged-in student
router.get('/projects', authenticateJWT, getMyProjects);
router.get('/projects/:projectId', authenticateJWT, getProjectDetails);
router.put('/projects/:projectId', authenticateJWT, updateMyProject);

export default router;


