
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize from './config/db.js'; // Adjust path if necessary

// Load environment variables FIRST
dotenv.config();

// Import routes
import authRoutes from './routes/auth.route.js'; // Make sure you have this file
import adminRoutes from './routes/admin.route.js';
import facultyRoutes from './routes/faculty.route.js';

// Import models
import Course from './models/Course.js';
import CourseFaculty from './models/CourseFaculty.js';
import User from './models/User.js';



// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares ---
// Using the CORS origin from your file
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('ProGrade API is running and healthy!');
});

// --- Server Startup Function ---
const startServer = async () => {
  try {
    console.log('Attempting to connect to the database...');
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    // It's good practice to avoid using sync in production
    // await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('--- FAILED TO START SERVER ---');
    console.error(error);
    process.exit(1);
  }
};

startServer();
