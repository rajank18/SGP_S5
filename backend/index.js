
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize, { pool } from './config/db.js'; // Adjust path if necessary

// Load environment variables FIRST
dotenv.config();

// We'll dynamically import routes and models inside startServer to
// surface any import-time errors (e.g. invalid route patterns) with clear logs.
let authRoutes, adminRoutes, facultyRoutes, studentRoutes, rubricRoutes, mailRoutes, evaluationRoutes
let modelsImported = false

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
// The global CORS middleware above handles preflight; avoid adding an options route here
// because certain path patterns can trigger path-to-regexp parsing errors in older deps.
// If explicit OPTIONS handling is required, use a safer path or add per-route handling.
app.use(express.json())

// --- API Routes ---
// Mount routers with guards to surface any invalid route path errors during startup
const tryMount = (mountPath, router) => {
  try {
    console.log(`Mounting ${mountPath}`)
    app.use(mountPath, router)
  } catch (err) {
    console.error(`Failed mounting ${mountPath}:`, err && err.message)
    // Re-throw to allow the process to exit with a clear error in deploy logs
    throw err
  }
}

// Route mounting will happen after dynamic imports in startServer()

// Health check route
app.get('/', (req, res) => {
  res.send('ProGrade API is running and healthy!');
});

// --- Server Startup Function ---
const startServer = async () => {
  try {
    console.log('Starting server...');

    // Dynamically import models and routes so we can report import-time failures
    try {
      console.log('Importing models...')
      await import('./models/index.js')
      modelsImported = true
    } catch (err) {
      console.error('Failed importing models:', err && err.message)
      throw err
    }

    try {
      console.log('Importing routes...')
      authRoutes = (await import('./routes/auth.route.js')).default
      console.log(' - auth.route imported')
      adminRoutes = (await import('./routes/admin.route.js')).default
      console.log(' - admin.route imported')
      facultyRoutes = (await import('./routes/faculty.route.js')).default
      console.log(' - faculty.route imported')
      studentRoutes = (await import('./routes/student.route.js')).default
      console.log(' - student.route imported')
      rubricRoutes = (await import('./routes/rubric.route.js')).default
      console.log(' - rubric.route imported')
      mailRoutes = (await import('./routes/mail.route.js')).default
      console.log(' - mail.route imported')
      evaluationRoutes = (await import('./routes/evaluation.route.js')).default
      console.log(' - evaluation.route imported')
    } catch (err) {
      console.error('Failed importing a route module:', err && err.message)
      throw err
    }

    // Mount routers now that they've been imported successfully
    tryMount('/api/auth', authRoutes);
    tryMount('/api/admin', adminRoutes);
    tryMount('/api/faculty', facultyRoutes);
    tryMount('/api/student', studentRoutes);
    tryMount('/api/rubrics', rubricRoutes);
    tryMount('/api/mail', mailRoutes);
    tryMount('/api/evaluations', evaluationRoutes);

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
