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
      return res.json({ courses: [] });
    }
    const courses = await Course.findAll({ where: { id: courseIds } });
    res.json({ courses: courses });
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
    
    console.log('CSV parsed results:', results);
    if (results.length > 0) {
      console.log('First row keys:', Object.keys(results[0]));
      console.log('First row values:', results[0]);
    }

    // Group students by their project using GroupNo
    const projectsMap = new Map();
    for (const row of results) {
      // Handle both uppercase and lowercase column names for your CSV structure
      const groupNo = row.GroupNo || row.groupNo;
      const groupName = row.GroupName || row.groupName;
      const projectTitle = row.ProjectTitle || row.projectTitle;
      const projectDescription = row.ProjectDescription || row.projectDescription;
      const fileUrl = row.FileUrl || row.fileUrl;
      const internalGuideEmail = row.InternalGuideEmail || row.internalGuideEmail;
      const externalGuideName = row.ExternalGuideName || row.externalGuideName;
      const studentEmail = row.StudentEmail || row.studentEmail;
      
      // Debug: Log what we're getting from each column
      console.log('Processing row:', {
        groupNo,
        groupName,
        projectTitle,
        projectDescription,
        fileUrl,
        internalGuideEmail,
        externalGuideName,
        studentEmail,
        rawRow: row
      });
      
      // Check if we have the minimum required data
      if (!groupNo) {
        console.log('Skipping row - missing groupNo:', row);
        continue;
      }
      
      if (!studentEmail) {
        console.log('Skipping row - no valid student email found:', row);
        continue;
      }
      
      if (!projectsMap.has(groupNo)) {
        projectsMap.set(groupNo, {
          details: {
            groupNo: groupNo,
            groupName: groupName,
            title: projectTitle,
            description: projectDescription,
            fileUrl: fileUrl,
            internalGuideEmail: internalGuideEmail,
            externalGuideName: externalGuideName,
          },
          students: [],
        });
      }
      // Add student to the group
      projectsMap.get(groupNo).students.push({ studentEmail: studentEmail });
    }

    // Process each project group within the transaction
    for (const projectData of projectsMap.values()) {
      // Get the course details from the database
      const course = await Course.findByPk(courseId);
      if (!course) {
        throw new Error(`Course with ID ${courseId} not found.`);
      }
      
      console.log(`Processing project for course: ${course.name} (${course.courseCode})`);
      
      // Find the internal guide's user ID from their email
      let internalGuide = null;
      
      if (projectData.details.internalGuideEmail && projectData.details.internalGuideEmail.includes('@')) {
        // If it's an email, search by email
        internalGuide = await User.findOne({ where: { email: projectData.details.internalGuideEmail, role: 'faculty' } });
      } else {
        // If it's a name, search by name
        internalGuide = await User.findOne({ where: { name: projectData.details.internalGuideEmail, role: 'faculty' } });
      }
      
      if (!internalGuide) {
        // Use the logged-in faculty as the internal guide
        internalGuide = await User.findOne({ where: { id: req.user.id, role: 'faculty' } });
        if (!internalGuide) {
          throw new Error(`Could not find internal guide and logged-in user is not faculty`);
        }
        console.log('Using logged-in faculty as internal guide:', internalGuide.email);
      }

      // Create the Project record
      const newProject = await Project.create({
        groupNo: projectData.details.groupNo,
        groupName: projectData.details.groupName,
        title: projectData.details.title,
        description: projectData.details.description,
        fileUrl: projectData.details.fileUrl,
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

// Upload groups via CSV (filtered by logged-in faculty's email)
export const uploadGroups = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const tokenUserId = req.user?.id;
  const tokenUserEmail = req.user?.email?.toLowerCase()?.trim();

  if (!tokenUserId || !tokenUserEmail) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(401).json({ message: 'Unauthorized' });
  }

  let createdProjects = 0;
  let addedParticipants = 0;
  let skippedRows = 0;
  let skippedByReason = {
    internalGuideMismatch: 0,
    missingFields: 0,
    courseNotFound: 0,
    studentNotFound: 0,
    rowError: 0,
  };

  // Resolve faculty user definitively (in case token id/email mismatch)
  let facultyUser = null;
  try {
    facultyUser = await User.findOne({ where: { email: tokenUserEmail, role: 'faculty' } });
    if (!facultyUser) {
      facultyUser = await User.findOne({ where: { id: tokenUserId, role: 'faculty' } });
    }
  } catch (e) {
    // fallthrough handled below
  }
  if (!facultyUser) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(403).json({ message: 'Authenticated user is not a faculty or not found' });
  }

  const rows = [];
  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    for (const raw of rows) {
      try {
        // Normalize headers expected: groupNo, groupName, projectTitle, projectDescription, fileUrl, internalGuideEmail, externalGuideName, courseCode, studentEmail
        const groupNo = (raw.groupNo ?? raw.GroupNo ?? '').toString().trim();
        const groupName = (raw.groupName ?? raw.GroupName ?? '').toString().trim() || null;
        const projectTitle = (raw.projectTitle ?? raw.ProjectTitle ?? '').toString().trim() || null;
        const projectDescription = (raw.projectDescription ?? raw.ProjectDescription ?? '').toString().trim() || null;
        const fileUrl = (raw.fileUrl ?? raw.FileUrl ?? '').toString().trim() || null;
        const internalGuideEmail = (raw.internalGuideEmail ?? raw.InternalGuideEmail ?? '').toString().toLowerCase().trim();
        const externalGuideName = (raw.externalGuideName ?? raw.ExternalGuideName ?? '').toString().trim() || null;
        const courseCode = (raw.courseCode ?? raw.CourseCode ?? '').toString().trim();
        const studentEmail = (raw.studentEmail ?? raw.StudentEmail ?? '').toString().toLowerCase().trim();

        // Basic validation
        if (!groupNo || !courseCode || !studentEmail) {
          skippedRows++;
          skippedByReason.missingFields++;
          continue;
        }

        // Filter: only rows where internalGuideEmail matches logged-in faculty email
        const facultyEmailNorm = (facultyUser.email || '').toLowerCase().trim();
        if (!internalGuideEmail || internalGuideEmail !== facultyEmailNorm) {
          skippedRows++;
          skippedByReason.internalGuideMismatch++;
          continue;
        }

        // Course lookup by courseCode
        const course = await Course.findOne({ where: { courseCode } });
        if (!course) {
          skippedRows++;
          skippedByReason.courseNotFound++;
          continue;
        }

        // Student lookup by email
        const student = await User.findOne({ where: { email: studentEmail, role: 'student' } });
        if (!student) {
          skippedRows++;
          skippedByReason.studentNotFound++;
          continue;
        }

        // Find or create project by (groupNo, courseId, internalGuideId)
        const [project, wasCreated] = await Project.findOrCreate({
          where: {
            groupNo: Number(groupNo),
            courseId: course.id,
            internalGuideId: facultyUser.id,
          },
          defaults: {
            groupName: groupName || null,
            title: projectTitle || null,
            description: projectDescription || null,
            fileUrl: fileUrl || null,
            externalGuideName: externalGuideName || null,
            courseId: course.id,
            internalGuideId: facultyUser.id,
            groupNo: Number(groupNo),
          },
        });

        if (wasCreated) {
          createdProjects++;
        }

        // Ensure participant exists
        const existingParticipant = await ProjectParticipant.findOne({
          where: { projectId: project.id, studentId: student.id },
        });
        if (!existingParticipant) {
          await ProjectParticipant.create({ projectId: project.id, studentId: student.id });
          addedParticipants++;
        }
      } catch (rowErr) {
        // Skip problematic row but continue processing
        skippedRows++;
        skippedByReason.rowError++;
      }
    }

    res.json({ createdProjects, addedParticipants, skippedRows, skippedByReason });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process CSV', error: err.message });
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
};