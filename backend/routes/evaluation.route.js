import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { 
  getProjectRubrics, 
  saveEvaluation, 
  getEvaluation,
  getProjectEvaluations 
} from '../controllers/evaluation.controller.js';

const router = express.Router();

// Faculty routes
router.get('/faculty/courses/:courseId/projects/:projectId/rubrics', authenticateJWT, getProjectRubrics);
router.post('/faculty/evaluations', authenticateJWT, saveEvaluation);
router.get('/faculty/evaluations/:projectId/:rubricId', authenticateJWT, getEvaluation);

// Student routes
router.get('/student/projects/:projectId/evaluations', authenticateJWT, getProjectEvaluations);

export default router;
