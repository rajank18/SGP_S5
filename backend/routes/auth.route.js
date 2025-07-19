import express from 'express';
import { login, register } from '../controllers/auth.controller.js'; // Import register

const router = express.Router();

// Existing login route
router.post('/login', login);

// New registration route
router.post('/register', register); // Add this line

export default router;