import Course from '../models/Course.js';
import CourseFaculty from '../models/CourseFaculty.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Create a new course
export const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Error creating course', error: err.message });
  }
};

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching courses', error: err.message });
  }
};

// --- NEW FUNCTION ---
// Get a single course by its ID
export const getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params; // Get the ID from the URL parameter
        const course = await Course.findByPk(courseId); // Find by Primary Key

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching course', error: err.message });
    }
};


// Assign faculty to course
export const assignFaculty = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { facultyId } = req.body;
    await CourseFaculty.create({ courseId, facultyId });
    res.status(201).json({ message: 'Faculty assigned to course' });
  } catch (err) {
    res.status(500).json({ message: 'Error assigning faculty', error: err.message });
  }
};

// Remove faculty from course
export const removeFaculty = async (req, res) => {
  try {
    const { courseId, facultyId } = req.params;
    await CourseFaculty.destroy({ where: { courseId, facultyId } });
    res.json({ message: 'Faculty removed from course' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing faculty', error: err.message });
  }
};

// Get all faculty
export const getAllFaculty = async (req, res) => {
  try {
    const faculty = await User.findAll({ where: { role: 'faculty' } });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching faculty', error: err.message });
  }
};

// Create new faculty
export const createFaculty = async (req, res) => {
  try {
    console.log('--- CREATE FACULTY REQUEST ---', req.body);
    const { name, email, password, departmentId } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Name, email, and password are required." 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new faculty user
    const newFaculty = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'faculty',
      departmentId: departmentId || null
    });

    console.log('--- FACULTY CREATED SUCCESSFULLY ---', newFaculty.id);

    res.status(201).json({
      message: "Faculty created successfully!",
      faculty: { 
        id: newFaculty.id, 
        name: newFaculty.name, 
        email: newFaculty.email,
        role: newFaculty.role,
        departmentId: newFaculty.departmentId
      }
    });

  } catch (error) {
    console.error('--- CREATE FACULTY ERROR ---', error);
    res.status(500).json({ 
      message: 'An internal server error occurred during faculty creation.',
      error: error.message 
    });
  }
};

// Update faculty
export const updateFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { name, email, password, departmentId } = req.body;
    
    // Find the faculty user
    const faculty = await User.findOne({ 
      where: { id: facultyId, role: 'faculty' } 
    });
    
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found." });
    }

    // Check if email is being changed and if it already exists
    if (email !== faculty.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists." });
      }
    }

    // Prepare update data
    const updateData = { name, email, departmentId };
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Update the faculty user
    await faculty.update(updateData);

    res.json({
      message: "Faculty updated successfully!",
      faculty: { 
        id: faculty.id, 
        name: faculty.name, 
        email: faculty.email,
        role: faculty.role,
        departmentId: faculty.departmentId
      }
    });

  } catch (error) {
    console.error('--- UPDATE FACULTY ERROR ---', error);
    res.status(500).json({ message: 'An internal server error occurred during faculty update.' });
  }
};

// Delete faculty
export const deleteFaculty = async (req, res) => {
  try {
    console.log('--- DELETE FACULTY REQUEST ---', req.params);
    const { facultyId } = req.params;
    
    // Validate facultyId
    if (!facultyId || isNaN(facultyId)) {
      return res.status(400).json({ message: "Invalid faculty ID." });
    }
    
    // Find the faculty user
    const faculty = await User.findOne({ 
      where: { id: facultyId, role: 'faculty' } 
    });
    
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found." });
    }

    console.log('--- FACULTY FOUND ---', faculty.id, faculty.name);

    // Check if faculty is assigned to any courses
    const courseAssignments = await CourseFaculty.findAll({ 
      where: { facultyId } 
    });
    
    if (courseAssignments.length > 0) {
      return res.status(400).json({ 
        message: "Cannot delete faculty. They are currently assigned to courses. Please remove course assignments first." 
      });
    }

    // Delete the faculty user
    await faculty.destroy();
    console.log('--- FACULTY DELETED SUCCESSFULLY ---', facultyId);

    res.json({ message: "Faculty deleted successfully!" });

  } catch (error) {
    console.error('--- DELETE FACULTY ERROR ---', error);
    res.status(500).json({ 
      message: 'An internal server error occurred during faculty deletion.',
      error: error.message 
    });
  }
};
