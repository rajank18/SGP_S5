import express from 'express';
import { login, register, changePassword, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import auth from '../middleware/auth.js'; // Middleware to verify JWT token

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (require authentication)
router.post('/change-password', auth, changePassword);

export default router;