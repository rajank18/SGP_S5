
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize, { pool } from './config/db.js'; // Adjust path if necessary

// Load environment variables FIRST
dotenv.config();

// Import routes
import authRoutes from './routes/auth.route.js'; // Make sure you have this file
import adminRoutes from './routes/admin.route.js';
import facultyRoutes from './routes/faculty.route.js';
import studentRoutes from './routes/student.route.js';
import rubricRoutes from './routes/rubric.route.js';
import mailRoutes from './routes/mail.route.js';
import evaluationRoutes from './routes/evaluation.route.js';

// Import models index to ensure associations are set up
import './models/index.js';

// FRONTEND_ORIGIN or FRONTEND_ORIGINS: set these in Render to your frontend URL(s)
// Example: FRONTEND_ORIGIN=https://prograde-yourapp.vercel.app
// Or multiple origins: FRONTEND_ORIGINS=https://site1.com,https://site2.com
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)


const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares ---
// Configure CORS dynamically so the server responds to browser preflight requests
const corsOptions = {
  origin: function (origin, callback) {
    // allow non-browser tools like Postman (no origin)
    if (!origin) return callback(null, true)
    if (FRONTEND_ORIGINS.indexOf(origin) !== -1) {
      return callback(null, true)
    }
    // Not allowed by CORS
    return callback(new Error('CORS policy: Origin not allowed'), false)
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
}

app.use(cors(corsOptions))
// Make sure express responds to preflight requests
app.options('*', cors(corsOptions))
app.use(express.json())

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/rubrics', rubricRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/evaluations', evaluationRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('ProGrade API is running and healthy!');
});

// --- Server Startup Function ---
const startServer = async () => {
  try {
    console.log('Starting server...');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`Received ${signal}. Shutting down...`);
      try {
        await sequelize.close();
        if (pool && typeof pool.end === 'function') await pool.end();
        server.close(() => {
          console.log('HTTP server closed.');
          process.exit(0);
        });
      } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('--- FAILED TO START SERVER ---');
    console.error(error);
    process.exit(1);
  }
};

startServer();
