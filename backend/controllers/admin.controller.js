import { Course, CourseFaculty, User } from '../models/index.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';

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

// --- NEW FUNCTION ---
// Update a course
export const updateCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findByPk(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        await course.update(req.body);
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: 'Error updating course', error: err.message });
    }
};

// --- NEW FUNCTION ---
// Delete a course
export const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findByPk(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if course is assigned to any faculty
        const courseAssignments = await CourseFaculty.findAll({ 
            where: { courseId } 
        });
        
        if (courseAssignments.length > 0) {
            return res.status(400).json({ 
                message: "Cannot delete course. It is currently assigned to faculty. Please remove course assignments first." 
            });
        }

        await course.destroy();
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting course', error: err.message });
    }
};

// Assign faculty to course
export const assignFaculty = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { facultyId } = req.body;
    
    
    // Validate input
    if (!courseId || !facultyId) {
      return res.status(400).json({ 
        message: 'Course ID and Faculty ID are required' 
      });
    }
    
    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if faculty exists and is actually a faculty member
    const faculty = await User.findByPk(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }
    if (faculty.role !== 'faculty') {
      return res.status(400).json({ message: 'User is not a faculty member' });
    }
    
    // Check if assignment already exists
    const existingAssignment = await CourseFaculty.findOne({ 
      where: { courseId, facultyId } 
    });
    if (existingAssignment) {
      return res.status(409).json({ message: 'Faculty is already assigned to this course' });
    }
    
    // Create the assignment
    const assignment = await CourseFaculty.create({ courseId, facultyId });
    
    res.status(201).json({ 
      message: 'Faculty assigned to course successfully',
      assignment: { courseId, facultyId }
    });
  } catch (err) {
    console.error('--- ASSIGN FACULTY ERROR ---', err);
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
    console.error('--- CREATE FACULTY ERROR ---', error.stack); // Log full stack
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

    // Convert facultyId to integer for safety
    const facultyId = parseInt(req.params.facultyId, 10);

    if (isNaN(facultyId)) {
      return res.status(400).json({ message: "Invalid faculty ID." });
    }

    // Find the faculty user
    const faculty = await User.findOne({ 
      where: { id: facultyId, role: 'faculty' } 
    });

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found." });
    }


    // Remove all course assignments for this faculty
    await CourseFaculty.destroy({ where: { facultyId } });

    // Delete the faculty user
    await faculty.destroy();

    res.json({ message: "Faculty deleted successfully!" });

  } catch (error) {
    console.error('--- DELETE FACULTY ERROR ---', error);
    res.status(500).json({ 
      message: 'An internal server error occurred during faculty deletion.',
      error: error.message 
    });
  }
};


// Get all course assignments
export const getCourseAssignments = async (req, res) => {
  try {
    console.log('--- GET COURSE ASSIGNMENTS REQUEST ---');
    
    const assignments = await CourseFaculty.findAll({
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'courseCode', 'semester', 'year']
        },
        {
          model: User,
          as: 'faculty',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    const formattedAssignments = assignments.map(assignment => ({
      courseId: assignment.courseId,
      facultyId: assignment.facultyId,
      courseName: assignment.course?.name || 'Unknown Course',
      courseCode: assignment.course?.courseCode || 'N/A',
      facultyName: assignment.faculty?.name || 'Unknown Faculty',
      createdAt: assignment.createdAt
    }));


    res.json({ 
      assignments: formattedAssignments 
    });

  } catch (error) {
    console.error('--- GET COURSE ASSIGNMENTS ERROR ---', error);
    res.status(500).json({ 
      message: 'An internal server error occurred while fetching course assignments.',
      error: error.message 
    });
  }
};

// Student bulk upload
export const uploadStudents = async (req, res) => {
  // Use multer to handle file upload
  const upload = multer({ dest: 'uploads/' }).single('file');
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = req.file.path;
    const results = [];
    const skippedEmails = [];
    let insertedCount = 0;
    let skippedCount = 0;
    try {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => results.push(row))
          .on('end', resolve)
          .on('error', reject);
      });
      for (const row of results) {
        const { name, email, password, departmentId } = row;
        if (!name || !email || !password) {
          skippedCount++;
          skippedEmails.push(email || '(missing email)');
          continue;
        }
        const existing = await User.findOne({ where: { email } });
        if (existing) {
          skippedCount++;
          skippedEmails.push(email);
          continue;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await User.create({
          name,
          email,
          password: hashedPassword,
          role: 'student',
          departmentId: departmentId || null
        });
        insertedCount++;
      }
      fs.unlinkSync(filePath); // Clean up uploaded file
      res.json({ insertedCount, skippedCount, skippedEmails });
    } catch (error) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(500).json({ message: 'Error processing CSV', error: error.message });
    }
  });
};

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'email', 'departmentId']
    });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students', error: err.message });
  }
};
