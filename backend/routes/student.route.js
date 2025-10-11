import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateJWT } from '../middleware/auth.js';
import { getMyProjects, getProjectDetails, updateMyProject, uploadProjectReport, uploadPresentation, deleteProjectReport, deletePresentation } from '../controllers/student.controller.js';

const router = express.Router();

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Get all project groups for the logged-in student
router.get('/projects', authenticateJWT, getMyProjects);
router.get('/projects/:projectId', authenticateJWT, getProjectDetails);
router.put('/projects/:projectId', authenticateJWT, updateMyProject);

// Upload routes
router.post('/projects/:projectId/upload-report', authenticateJWT, upload.single('file'), uploadProjectReport);
router.post('/projects/:projectId/upload-presentation', authenticateJWT, upload.single('file'), uploadPresentation);

router.delete('/projects/:projectId/delete-report', authenticateJWT, deleteProjectReport);
router.delete('/projects/:projectId/delete-presentation', authenticateJWT, deletePresentation);

router.post('/test', (req, res) => res.json({message: 'Test POST route reached'}));

export default router;


