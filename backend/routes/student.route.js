import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateJWT } from '../middleware/auth.js';
import { getMyProjects, getProjectDetails, updateMyProject, uploadProjectReport, uploadPresentation, deleteProjectReport, deletePresentation, uploadWeeklyReport, deleteWeeklyReport } from '../controllers/student.controller.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});
// Weekly report upload route
router.post('/projects/:projectId/upload-weekly-report', authenticateJWT, upload.single('file'), uploadWeeklyReport);



// Configure multer to use memory storage (no disk storage)




// Get all project groups for the logged-in student
router.get('/projects', authenticateJWT, getMyProjects);
router.get('/projects/:projectId', authenticateJWT, getProjectDetails);
router.put('/projects/:projectId', authenticateJWT, updateMyProject);

// Upload routes
router.post('/projects/:projectId/upload-report', authenticateJWT, upload.single('file'), uploadProjectReport);
router.post('/projects/:projectId/upload-presentation', authenticateJWT, upload.single('file'), uploadPresentation);

router.delete('/projects/:projectId/delete-report', authenticateJWT, deleteProjectReport);
router.delete('/projects/:projectId/delete-presentation', authenticateJWT, deletePresentation);
router.delete('/projects/:projectId/delete-weekly-report/:week', authenticateJWT, deleteWeeklyReport);

router.post('/test', (req, res) => res.json({message: 'Test POST route reached'}));

export default router;


