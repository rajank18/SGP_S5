import express from 'express';
import multer from 'multer';
import path from 'path';
import { sendBulkEmails, testEmailConfig } from '../controllers/mail.controller.js';

const router = express.Router();

// Configure multer to use memory storage (no disk storage)
const storage = multer.memoryStorage();

// File filter to accept only CSV files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Routes
router.post('/send-bulk', upload.single('csvFile'), sendBulkEmails);
router.get('/test-config', testEmailConfig);

export default router;
