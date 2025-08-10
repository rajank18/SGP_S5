import fs from 'fs';
import csv from 'csv-parser';
import sequelize from '../config/db.js';
import CourseFaculty from '../models/CourseFaculty.js';
import Course from '../models/Course.js';
import Project from '../models/Project.js'; // You will need to create this model file
import User from '../models/User.js';
import ProjectParticipant from '../models/ProjectParticipant.js'; // You will need to create this model file

// --- EXISTING FUNCTION ---
export const getAssignedCourses = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const assignments = await CourseFaculty.findAll({ where: { facultyId } });
    const courseIds = assignments.map(a => a.courseId);
    if (!courseIds.length) {
      return res.json([]);
    }
    const courses = await Course.findAll({ where: { id: courseIds } });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assigned courses', error: err.message });
  }
};

export const getCourseProjects = async (req, res) => {
    try {
        const { courseId } = req.params;
        const facultyId = req.user.id;

        // --- SECURITY FIX ---
        // 1. First, verify that this faculty is actually assigned to this course.
        const assignment = await CourseFaculty.findOne({
            where: {
                courseId: courseId,
                facultyId: facultyId
            }
        });

        // If no assignment is found, the faculty is not authorized to view this course's projects.
        if (!assignment) {
            return res.status(403).json({ message: "You are not authorized to access this course." });
        }
        // --- END SECURITY FIX ---


        // 2. If authorized, find all projects for this course where the logged-in faculty is the internal guide.
        const projects = await Project.findAll({
            where: {
                courseId: courseId,
                internalGuideId: facultyId
            },
            // Include the student participants for each project
            include: [{
                model: ProjectParticipant,
                as: 'participants', // Define an alias
                include: [{
                    model: User,
                    as: 'student', // Define an alias
                    attributes: ['id', 'name', 'email'] // Only select needed fields
                }]
            }],
            order: [['groupNo', 'ASC']] // Order the results by group number
        });

        res.json(projects);

    } catch (error) {
        console.error("Error fetching course projects:", error);
        res.status(500).json({ message: "Failed to fetch course projects", error: error.message });
    }
};



// --- NEW FUNCTION ---
export const uploadProjects = async (req, res) => {
  const { courseId } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'No file was uploaded.' });
  }

  const results = [];
  const filePath = req.file.path;
  const t = await sequelize.transaction(); // Start a database transaction

  try {
    // This promise-based approach ensures we wait for the file to be fully read.
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    // Group students by their project using GroupNo
    const projectsMap = new Map();
    for (const row of results) {
      const groupNo = row.GroupNo;
      if (!projectsMap.has(groupNo)) {
        projectsMap.set(groupNo, {
          details: {
            groupNo: row.GroupNo,
            groupName: row.GroupName,
            title: row.ProjectTitle,
            internalGuideEmail: row.InternalGuideEmail,
            externalGuideName: row.ExternalGuideName,
          },
          students: [],
        });
      }
      // Assuming the CSV has a column 'StudentEmail'
      projectsMap.get(groupNo).students.push({ studentEmail: row.StudentEmail });
    }

    // Process each project group within the transaction
    for (const projectData of projectsMap.values()) {
      // Find the internal guide's user ID from their email
      const internalGuide = await User.findOne({ where: { email: projectData.details.internalGuideEmail, role: 'faculty' } });
      if (!internalGuide) {
        throw new Error(`Faculty guide with email ${projectData.details.internalGuideEmail} not found.`);
      }

      // Create the Project record
      const newProject = await Project.create({
        groupNo: projectData.details.groupNo,
        groupName: projectData.details.groupName,
        title: projectData.details.title,
        internalGuideId: internalGuide.id,
        externalGuideName: projectData.details.externalGuideName,
        courseId: courseId,
      }, { transaction: t });

      // Create ProjectParticipant records for each student
      for (const student of projectData.students) {
        const studentUser = await User.findOne({ where: { email: student.studentEmail } });
        if (!studentUser) {
          throw new Error(`Student with email ${student.studentEmail} not found.`);
        }
        await ProjectParticipant.create({
          projectId: newProject.id,
          studentId: studentUser.id,
        }, { transaction: t });
      }
    }

    // If everything succeeded, commit the transaction
    await t.commit();
    res.status(201).json({ message: 'CSV processed and projects created successfully!' });

  } catch (error) {
    // If any step failed, roll back all database changes
    await t.rollback();
    console.error('Upload process failed:', error);
    res.status(500).json({ message: 'Failed to process file.', error: error.message });
  } finally {
    // Clean up by deleting the temporary uploaded file
    fs.unlinkSync(filePath);
  }
};
