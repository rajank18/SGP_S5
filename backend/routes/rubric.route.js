import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { authenticateAdmin } from '../middleware/adminAuth.js';
import { listRubrics, getRubricById, createRubric, deleteRubric } from '../controllers/rubric.controller.js';

const router = express.Router();

router.get('/', authenticateJWT, listRubrics);
router.get('/:id', authenticateJWT, getRubricById);
router.post('/', authenticateAdmin, createRubric);
router.delete('/:id', authenticateAdmin, deleteRubric);

export default router;


