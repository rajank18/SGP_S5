import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { listRubrics, getRubricById } from '../controllers/rubric.controller.js';

const router = express.Router();

router.get('/', authenticateJWT, listRubrics);
router.get('/:id', authenticateJWT, getRubricById);

// TEMP: debug route to verify mount (no auth)
router.get('/__debug/ping', (req, res) => {
  res.json({ ok: true, route: 'rubrics', time: new Date().toISOString() });
});

export default router;


