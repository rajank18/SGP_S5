import Course from '../models/Course.js';
import CourseFaculty from '../models/CourseFaculty.js';
import User from '../models/User.js';

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