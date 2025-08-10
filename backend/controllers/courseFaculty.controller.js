import CourseFaculty from '../models/CourseFaculty.js';

// Assign a faculty to a course
export const assignFaculty = async (req, res) => {
  try {
    const { courseId, facultyId } = req.body;
    const assignment = await CourseFaculty.create({ courseId, facultyId });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Error assigning faculty', error: err.message });
  }
};

// Remove a faculty from a course
export const removeFaculty = async (req, res) => {
  try {
    const { courseId, facultyId } = req.params;
    await CourseFaculty.destroy({ where: { courseId, facultyId } });
    res.json({ message: 'Faculty removed from course' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing faculty', error: err.message });
  }
};

// Get all faculty for a course
export const getFacultyByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const faculty = await CourseFaculty.findAll({ where: { courseId } });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching faculty', error: err.message });
  }
};