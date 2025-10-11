import express from 'express';
import multer from 'multer';
import path from 'path';
import { sendBulkEmails, testEmailConfig } from '../controllers/mail.controller.js';

const router = express.Router();

// Configure multer for CSV file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'students-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to accept only CSV files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Routes
router.post('/send-bulk', upload.single('csvFile'), sendBulkEmails);
router.get('/test-config', testEmailConfig);

export default router;
