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

// 1. CORS: Allow requests from your React frontend
app.use(cors({
  origin: 'http://localhost:5173', // The address of your React app
}));

// 2. Body Parser: To accept JSON data in request bodies
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);

// A simple health check route
app.get('/', (req, res) => {
  res.send('ProGrade API is running and healthy!');
});

app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);


// --- Server Startup Function ---
const startServer = async () => {
  try {
    console.log('Attempting to connect to the database...');
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    // Sync models (only if needed, and prefer using migrations in production)
    // await sequelize.sync({ alter: true });
    // console.log('✅ Models synchronized.');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // This will catch any errors during startup and log them
    console.error('--- FAILED TO START SERVER ---');
    console.error(error);
    process.exit(1); // Exit the process with an error code
  }
};

// Start the server
startServer();