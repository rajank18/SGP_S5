import csv from 'csv-parser';
import { Readable } from 'stream';
import sequelize from '../config/db.js';
import CourseFaculty from '../models/CourseFaculty.js';
import Course from '../models/Course.js';
import Project from '../models/Project.js'; // You will need to create this model file
import User from '../models/User.js';
import ProjectParticipant from '../models/ProjectParticipant.js'; // You will need to create this model file
import Evaluation from '../models/Evaluation.js';
import Rubric from '../models/Rubric.js';

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
  const t = await sequelize.transaction(); // Start a database transaction

  try {
    // This promise-based approach ensures we wait for the file to be fully read.
    await new Promise((resolve, reject) => {
      Readable.from(req.file.buffer)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });
    
    if (results.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'CSV file is empty or invalid.' });
    }

    console.log(`Processing ${results.length} rows from CSV`);

    // Group students by their project using GroupNo
    const projectsMap = new Map();
    const missingStudents = [];
    
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
      
      // Check if we have the minimum required data
      if (!groupNo) {
        console.log('Skipping row: missing groupNo');
        continue;
      }
      
      if (!studentEmail) {
        console.log(`Skipping row for group ${groupNo}: missing studentEmail`);
        continue;
      }
      
      if (!projectsMap.has(groupNo)) {
        projectsMap.set(groupNo, {
          details: {
            groupNo: groupNo,
            groupName: groupName || null,
            title: projectTitle || `Project ${groupNo}`,
            description: projectDescription || null,
            fileUrl: fileUrl || null,
            internalGuideEmail: internalGuideEmail || null,
            externalGuideName: externalGuideName || null,
          },
          students: [],
        });
      }
      // Add student to the group
      projectsMap.get(groupNo).students.push({ studentEmail: studentEmail });
    }

    if (projectsMap.size === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'No valid project groups found in CSV.' });
    }

    console.log(`Found ${projectsMap.size} unique project groups`);

    // Verify course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      await t.rollback();
      return res.status(404).json({ message: `Course with ID ${courseId} not found.` });
    }

    // Get the logged-in faculty details
    const loggedInFaculty = await User.findOne({ where: { id: req.user.id, role: 'faculty' } });
    if (!loggedInFaculty) {
      await t.rollback();
      return res.status(403).json({ message: 'Logged-in user is not a faculty member.' });
    }

    // Process each project group within the transaction
    let createdCount = 0;
    let participantCount = 0;
    let skippedCount = 0;
    
    for (const [groupNo, projectData] of projectsMap.entries()) {
      // Check if this group is assigned to the logged-in faculty
      const internalGuideEmail = projectData.details.internalGuideEmail;
      
      // Skip this group if it has a different faculty assigned
      if (internalGuideEmail) {
        const normalizedEmail = internalGuideEmail.toLowerCase().trim();
        const loggedInEmail = loggedInFaculty.email.toLowerCase().trim();
        
        if (normalizedEmail !== loggedInEmail) {
          console.log(`Skipping group ${groupNo}: assigned to different faculty (${internalGuideEmail})`);
          skippedCount++;
          continue;
        }
      }
      
      // Use the logged-in faculty as the internal guide
      const internalGuide = loggedInFaculty;

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

      createdCount++;
      console.log(`Created project for group ${groupNo}`);

      // Create ProjectParticipant records for each student
      for (const student of projectData.students) {
        const studentUser = await User.findOne({ where: { email: student.studentEmail, role: 'student' } });
        if (!studentUser) {
          missingStudents.push(student.studentEmail);
          console.log(`Warning: Student ${student.studentEmail} not found in database`);
          continue; // Skip this student but continue with others
        }
        await ProjectParticipant.create({
          projectId: newProject.id,
          studentId: studentUser.id,
        }, { transaction: t });
        participantCount++;
      }
    }

    // If everything succeeded, commit the transaction
    await t.commit();
    
    const responseMessage = {
      message: 'CSV processed successfully!',
      projectsCreated: createdCount,
      participantsAdded: participantCount,
      groupsSkipped: skippedCount,
    };
    
    if (skippedCount > 0) {
      responseMessage.info = `${skippedCount} group(s) skipped (assigned to other faculty)`;
    }
    
    if (missingStudents.length > 0) {
      responseMessage.warning = `${missingStudents.length} student(s) not found in database`;
      responseMessage.missingStudents = missingStudents;
    }
    
    console.log('Upload completed successfully:', responseMessage);
    res.status(201).json(responseMessage);

  } catch (error) {
    // If any step failed, roll back all database changes
    await t.rollback();
    console.error('Upload process failed:', error);
    res.status(500).json({ message: 'Failed to process file.', error: error.message });
  }
};

// Upload groups via CSV (filtered by logged-in faculty's email)
export const uploadGroups = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const tokenUserId = req.user?.id;
  const tokenUserEmail = req.user?.email?.toLowerCase()?.trim();

  if (!tokenUserId || !tokenUserEmail) {
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
    return res.status(403).json({ message: 'Authenticated user is not a faculty or not found' });
  }

  const rows = [];
  try {
    await new Promise((resolve, reject) => {
      Readable.from(req.file.buffer)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    // First pass: Collect all student emails and validate data
    const studentEmails = new Set();
    const rowsToProcess = [];
    const invalidRows = [];

    for (const [index, raw] of rows.entries()) {
      try {
        // Normalize and extract data
        const groupNo = (raw.groupNo ?? raw.GroupNo ?? '').toString().trim();
        const courseCode = (raw.courseCode ?? raw.CourseCode ?? '').toString().trim();
        const studentEmail = (raw.studentEmail ?? raw.StudentEmail ?? '').toString().toLowerCase().trim();
        const internalGuideEmail = (raw.internalGuideEmail ?? raw.InternalGuideEmail ?? '').toString().toLowerCase().trim();
        
        // Basic validation
        if (!groupNo || !courseCode || !studentEmail) {
          invalidRows.push({
            row: index + 2, // +2 because header is row 1 and arrays are 0-based
            reason: 'Missing required fields (groupNo, courseCode, or studentEmail)'
          });
          continue;
        }

        // Check internal guide email
        const facultyEmailNorm = (facultyUser.email || '').toLowerCase().trim();
        if (!internalGuideEmail || internalGuideEmail !== facultyEmailNorm) {
          invalidRows.push({
            row: index + 2,
            reason: 'Internal guide email does not match logged-in faculty',
            data: { internalGuideEmail, facultyEmail: facultyEmailNorm }
          });
          continue;
        }

        // Add to processing queue
        rowsToProcess.push({
          groupNo,
          groupName: (raw.groupName ?? raw.GroupName ?? '').toString().trim() || null,
          projectTitle: (raw.projectTitle ?? raw.ProjectTitle ?? '').toString().trim() || null,
          projectDescription: (raw.projectDescription ?? raw.ProjectDescription ?? '').toString().trim() || null,
          fileUrl: (raw.fileUrl ?? raw.FileUrl ?? '').toString().trim() || null,
          internalGuideEmail,
          externalGuideName: (raw.externalGuideName ?? raw.ExternalGuideName ?? '').toString().trim() || null,
          courseCode,
          studentEmail
        });

        studentEmails.add(studentEmail);
      } catch (rowErr) {
        invalidRows.push({
          row: index + 2,
          reason: 'Error processing row',
          error: rowErr.message
        });
      }
    }

    // If there are any invalid rows, return them immediately
    if (invalidRows.length > 0) {
      return res.status(400).json({
        message: 'Validation errors in CSV',
        invalidRows,
        totalRows: rows.length,
        validRows: rowsToProcess.length
      });
    }

    // Check if all student emails exist in the database
    const existingStudents = await User.findAll({
      where: {
        email: Array.from(studentEmails),
        role: 'student'
      },
      attributes: ['id', 'email']
    });

    const existingEmails = new Set(existingStudents.map(s => s.email.toLowerCase()));
    const missingEmails = Array.from(studentEmails).filter(email => !existingEmails.has(email));

    // If any student emails are missing, return them without making any changes
    if (missingEmails.length > 0) {
      return res.status(400).json({
        message: 'Some student emails were not found in the system',
        missingEmails,
        totalStudents: studentEmails.size,
        foundStudents: existingStudents.length
      });
    }

    // Create a map of email to student ID for quick lookup
    const studentMap = new Map(existingStudents.map(s => [s.email.toLowerCase(), s.id]));

    // Second pass: Process valid rows and create projects/participants
    const processedGroups = new Map();
    const t = await sequelize.transaction();

    try {
      for (const row of rowsToProcess) {
        // Course lookup by courseCode
        const course = await Course.findOne({ 
          where: { courseCode: row.courseCode },
          transaction: t
        });

        if (!course) {
          skippedRows++;
          skippedByReason.courseNotFound++;
          continue;
        }

        const groupKey = `${row.groupNo}-${course.id}-${facultyUser.id}`;
        let project = processedGroups.get(groupKey);

        // Create project if it doesn't exist
        if (!project) {
          [project] = await Project.findOrCreate({
            where: {
              groupNo: Number(row.groupNo),
              courseId: course.id,
              internalGuideId: facultyUser.id,
            },
            defaults: {
              groupName: row.groupName,
              title: row.projectTitle || `Project ${row.groupNo}`,
              description: row.projectDescription,
              fileUrl: row.fileUrl,
              externalGuideName: row.externalGuideName,
              courseId: course.id,
              internalGuideId: facultyUser.id,
              groupNo: Number(row.groupNo),
            },
            transaction: t
          });

          if (project.wasCreated) {
            createdProjects++;
          }
          processedGroups.set(groupKey, project);
        }

        // Add student to project
        const studentId = studentMap.get(row.studentEmail.toLowerCase());
        const existingParticipant = await ProjectParticipant.findOne({
          where: { 
            projectId: project.id, 
            studentId 
          },
          transaction: t
        });

        if (!existingParticipant) {
          await ProjectParticipant.create({
            projectId: project.id,
            studentId
          }, { transaction: t });
          addedParticipants++;
        }
      }

      await t.commit();
      
      res.json({
        message: 'Groups uploaded successfully',
        createdProjects,
        addedParticipants,
        skippedRows,
        skippedByReason,
        totalProcessed: rowsToProcess.length
      });

    } catch (error) {
      await t.rollback();
      console.error('Error in transaction:', error);
      throw error; // Will be caught by the outer try-catch
    }

  } catch (err) {
    console.error('Error processing upload:', err);
    res.status(500).json({ 
      message: 'Failed to process CSV', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Export course data to Excel
export const exportCourseData = async (req, res) => {
  try {
    const { courseId } = req.params;
    const facultyId = req.user.id;

    console.log(`[EXPORT] Attempting to export courseId: ${courseId} for facultyId: ${facultyId}`);

    // Verify faculty is assigned to this course
    const assignment = await CourseFaculty.findOne({
      where: { courseId, facultyId }
    });

    if (!assignment) {
      console.log(`[EXPORT] Faculty ${facultyId} not assigned to course ${courseId}`);
      return res.status(403).json({ message: "You are not authorized to access this course." });
    }

    console.log(`[EXPORT] Authorization verified, fetching projects...`);

    // Fetch all projects for this course with evaluations
    const projects = await Project.findAll({
      where: { courseId, internalGuideId: facultyId },
      include: [
        {
          model: ProjectParticipant,
          as: 'participants',
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: Evaluation,
          as: 'evaluations',
          include: [
            {
              model: Rubric,
              as: 'rubric',
              attributes: ['id', 'title']
            }
          ]
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name']
        }
      ],
      order: [['groupNo', 'ASC']]
    });

    console.log(`[EXPORT] Found ${projects.length} projects for export`);

    // Format data for export
    const exportData = [];
    
    projects.forEach(project => {
      // Parse weekly report URLs
      let weeklySubmissions = [];
      if (project.weeklyReportUrls) {
        try {
          weeklySubmissions = typeof project.weeklyReportUrls === 'string' 
            ? JSON.parse(project.weeklyReportUrls)
            : project.weeklyReportUrls;
        } catch (e) {
          console.warn(`[EXPORT] Error parsing weeklyReportUrls for project ${project.id}:`, e.message);
          weeklySubmissions = [];
        }
      }

      // Get max weeks
      const maxWeek = weeklySubmissions.length > 0 
        ? Math.max(...weeklySubmissions.map(w => w.week || 0))
        : 0;

      // Get student names
      const studentNames = project.participants
        .map(p => p.student?.name || 'Unknown')
        .join(', ');

      // Calculate evaluation scores
      let evaluationScores = [];
      let totalScore = 0;
      let rubricCount = 0;

      if (project.evaluations && project.evaluations.length > 0) {
        project.evaluations.forEach((evaluation, idx) => {
          let rubricScore = 0;
          if (evaluation.criteriaMarks && Array.isArray(evaluation.criteriaMarks)) {
            rubricScore = evaluation.criteriaMarks.reduce((sum, cm) => sum + (cm.marks || 0), 0);
          }
          evaluationScores.push({
            rubric: evaluation.rubric?.title || `Rubric ${idx + 1}`,
            score: rubricScore
          });
          totalScore += rubricScore;
          rubricCount++;
        });
      }

      // Build row data
      const rowData = {
        groupName: project.groupName || `Group ${project.groupNo}`,
        projectTitle: project.title,
        studentNames: studentNames,
        finalReportLink: project.projectReportUrl || '',
        pptLink: project.presentationUrl || '',
        githubLink: project.fileUrl || '',
      };

      // Add evaluation scores
      evaluationScores.forEach((score, idx) => {
        rowData[`evaluationScore_${idx + 1}_${score.rubric}`] = score.score;
      });
      rowData['totalEvaluationScore'] = totalScore;

      // Add weekly submissions
      for (let week = 1; week <= maxWeek; week++) {
        const submitted = weeklySubmissions.some(w => w.week === week);
        rowData[`week_${week}_status`] = submitted ? 'Submitted' : 'Not Submitted';
      }

      rowData['maxWeeks'] = maxWeek;
      rowData['weeklySubmissions'] = weeklySubmissions;
      
      exportData.push(rowData);
    });

    console.log(`[EXPORT] Export data prepared successfully, returning response`);

    // Return data as JSON to be used by frontend for Excel generation
    res.json({
      success: true,
      data: exportData,
      courseName: projects.length > 0 ? projects[0].course?.name : 'Unknown Course',
      exportDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('[EXPORT] Error exporting course data:', error);
    res.status(500).json({ message: 'Failed to export course data', error: error.message });
  }
};