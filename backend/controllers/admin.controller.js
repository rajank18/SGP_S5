import { Course, CourseFaculty, User, CourseRubric, Rubric, Project, ProjectParticipant, Evaluation } from '../models/index.js';
import bcrypt from 'bcryptjs';
import csv from 'csv-parser';
import { Readable } from 'stream';
import mailer from '../lib/mailer.js';
import ExcelJS from 'exceljs';

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

// Assign faculty to course (with optional rubrics)
export const assignFaculty = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { facultyId, rubricIds } = req.body; // rubricIds is optional array
    
    
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
    
    // Assign rubrics if provided
    let assignedRubrics = [];
    if (rubricIds && Array.isArray(rubricIds) && rubricIds.length > 0) {
      for (const rubricId of rubricIds) {
        // Check if rubric exists
        const rubric = await Rubric.findByPk(rubricId);
        if (rubric) {
          // Check if already assigned
          const existing = await CourseRubric.findOne({
            where: { courseId, facultyId, rubricId }
          });
          if (!existing) {
            await CourseRubric.create({ courseId, facultyId, rubricId });
            assignedRubrics.push(rubricId);
          }
        }
      }
    }
    
    res.status(201).json({ 
      message: 'Faculty assigned to course successfully',
      assignment: { courseId, facultyId },
      rubricsAssigned: assignedRubrics.length,
      rubricIds: assignedRubrics
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

    // Import the email function
    import('../controllers/mail.controller.js').then(mailController => {
      // Send email with credentials (don't await to avoid blocking the response)
      mailController.sendFacultyCredentials(email, name, password)
        .then(sent => {
          if (!sent) {
            console.warn(`Failed to send credentials email to ${email}`);
          }
        })
        .catch(err => {
          console.error('Error in sendFacultyCredentials:', err);
        });
    });

    res.status(201).json({
      message: "Faculty created successfully! Credentials have been sent to the provided email.",
      faculty: { 
        id: newFaculty.id, 
        name: newFaculty.name, 
        email: newFaculty.email,
        role: newFaculty.role,
        departmentId: newFaculty.departmentId
      }
    });

  } catch (error) {
    console.error('--- CREATE FACULTY ERROR ---', error.stack);
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
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const results = [];
  const skippedEmails = [];
  const insertedStudents = []; // Track newly inserted students
  let insertedCount = 0;
  let skippedCount = 0;
  
  try {
    await new Promise((resolve, reject) => {
      Readable.from(req.file.buffer)
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
      // Store the newly inserted student data (with plain password for email)
      insertedStudents.push({
        name,
        email,
        password, // Plain password for email
        departmentId
      });
    }
    
    res.json({ 
      insertedCount, 
      skippedCount, 
      skippedEmails,
      insertedStudents // Return newly inserted students
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing CSV', error: error.message });
  }
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

// Send emails to students with their credentials
export const sendStudentEmails = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'No student data provided' });
    }

    // Check if email credentials are configured
    if (!mailer.isConfigured()) {
      return res.status(500).json({ 
        message: 'Email credentials not configured. Please configure the mailer module' 
      });
    }

    const results = {
      success: [],
      failed: [],
    };

    // Send email to each student
    for (const student of data) {
      // Handle both capitalized and lowercase column names
      const email = student.Email || student.email;
      const name = student.Name || student.name;
      const password = student.Password || student.password || 'default123';
      const studentId = student.StudentID || student.studentId || student.id || 'N/A';
      
      // Skip if missing required fields
      if (!email || !name) {
        results.failed.push({
          email: email || 'unknown',
          name: name || 'unknown',
          error: 'Missing required fields (email or name)',
        });
        continue;
      }

        try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your ProGrade Account Credentials',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">Welcome to ProGrade!</h2>
              
              <p style="color: #555; font-size: 16px;">Dear <strong>${name}</strong>,</p>
              
              <p style="color: #555; font-size: 14px;">Your account has been successfully created. Below are your login credentials:</p>
              
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Student ID:</strong> ${studentId}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
              </div>
              
              <p style="color: #555; font-size: 14px;">Please login to the ProGrade portal and change your password immediately for security purposes.</p>
              
              <p style="color: #555; font-size: 14px; margin-top: 20px;">If you have any questions or need assistance, please contact your administrator.</p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
              
              <p style="color: #888; font-size: 12px; text-align: center;">This is an automated email. Please do not reply to this message.</p>
            </div>
          `,
        };

        await mailer.sendMail(mailOptions);
        results.success.push({
          email: email,
          name: name,
        });
        console.log(`✓ Email sent to ${email}`);
      } catch (error) {
        results.failed.push({
          email: email,
          name: name,
          error: error.message,
        });
        console.error(`✗ Failed to send email to ${email}:`, error.message);
      }
    }

    res.status(200).json({
      message: 'Bulk email process completed',
      total: data.length,
      successful: results.success.length,
      failed: results.failed.length,
      results,
    });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Export master data to Excel
export const exportMasterData = async (req, res) => {
  try {
    // Fetch all courses with their projects and evaluations
    const courses = await Course.findAll({
      include: [
        {
          model: Project,
          as: 'projects',
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
              model: User,
              as: 'internalGuide',
              attributes: ['id', 'name']
            },
            {
              model: Evaluation,
              as: 'evaluations',
              include: [
                {
                  model: Rubric,
                  as: 'rubric',
                  attributes: ['id', 'title']
                },
                {
                  model: User,
                  as: 'evaluator',
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        }
      ]
    });

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Master Data');

    // Define column headers
    const headers = [
      'Course Code',
      'Course Name',
      'Group Number',
      'Group Name',
      'Project Title',
      'Project Description',
      'Internal Guide Name',
      'External Guide Name',
      'Student Names',
      'Student Emails',
      'GitHub Link',
      'Final Report Link',
      'PPT Link',
      'Rubric Name',
      'Score',
      'Max Score',
      'Evaluated By',
      'Evaluation Date'
    ];

    // Set column widths
    worksheet.columns = [
      { header: 'Course Code', key: 'courseCode', width: 15 },
      { header: 'Course Name', key: 'courseName', width: 25 },
      { header: 'Group Number', key: 'groupNumber', width: 12 },
      { header: 'Group Name', key: 'groupName', width: 20 },
      { header: 'Project Title', key: 'projectTitle', width: 25 },
      { header: 'Project Description', key: 'projectDescription', width: 30 },
      { header: 'Internal Guide Name', key: 'internalGuideName', width: 20 },
      { header: 'External Guide Name', key: 'externalGuideName', width: 20 },
      { header: 'Student Names', key: 'studentNames', width: 25 },
      { header: 'Student Emails', key: 'studentEmails', width: 30 },
      { header: 'GitHub Link', key: 'githubLink', width: 30 },
      { header: 'Final Report Link', key: 'reportLink', width: 30 },
      { header: 'PPT Link', key: 'pptLink', width: 30 },
      { header: 'Rubric Name', key: 'rubricName', width: 20 },
      { header: 'Score', key: 'score', width: 10 },
      { header: 'Max Score', key: 'maxScore', width: 10 },
      { header: 'Evaluated By', key: 'evaluatedBy', width: 20 },
      { header: 'Evaluation Date', key: 'evaluationDate', width: 15 }
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    // Populate data rows
    let rowIndex = 2;
    for (const course of courses) {
      for (const project of course.projects || []) {
        // Get students for this project
        const students = project.participants || [];
        const studentNames = students.map(p => p.student?.name || 'Unknown').join(', ');
        const studentEmails = students.map(p => p.student?.email || 'Unknown').join(', ');

        // Get evaluations for this project
        const evaluations = project.evaluations || [];
        if (evaluations.length === 0) {
          // Add one row without evaluation data
          const row = worksheet.getRow(rowIndex);
          row.values = {
            courseCode: course.courseCode,
            courseName: course.name,
            groupNumber: project.groupNo,
            groupName: project.groupName,
            projectTitle: project.title,
            projectDescription: project.description,
            internalGuideName: project.internalGuide?.name || 'N/A',
            externalGuideName: project.externalGuideName || 'N/A',
            studentNames: studentNames || 'N/A',
            studentEmails: studentEmails || 'N/A',
            githubLink: project.fileUrl || 'N/A',
            reportLink: project.projectReportUrl || 'N/A',
            pptLink: project.presentationUrl || 'N/A',
            rubricName: 'N/A',
            score: 'N/A',
            maxScore: 'N/A',
            evaluatedBy: 'N/A',
            evaluationDate: 'N/A'
          };
          styleDataRow(row);
          rowIndex++;
        } else {
          // Add a row for each evaluation
          for (let i = 0; i < evaluations.length; i++) {
            const evaluation = evaluations[i];
            const row = worksheet.getRow(rowIndex);
            
            // Only show project info on first evaluation row
            row.values = {
              courseCode: i === 0 ? course.courseCode : '',
              courseName: i === 0 ? course.name : '',
              groupNumber: i === 0 ? project.groupNo : '',
              groupName: i === 0 ? project.groupName : '',
              projectTitle: i === 0 ? project.title : '',
              projectDescription: i === 0 ? project.description : '',
              internalGuideName: i === 0 ? (project.internalGuide?.name || 'N/A') : '',
              externalGuideName: i === 0 ? (project.externalGuideName || 'N/A') : '',
              studentNames: i === 0 ? (studentNames || 'N/A') : '',
              studentEmails: i === 0 ? (studentEmails || 'N/A') : '',
              githubLink: i === 0 ? (project.fileUrl || 'N/A') : '',
              reportLink: i === 0 ? (project.projectReportUrl || 'N/A') : '',
              pptLink: i === 0 ? (project.presentationUrl || 'N/A') : '',
              rubricName: evaluation.rubric?.title || 'Unknown Rubric',
              score: evaluation.totalMarks || 'N/A',
              maxScore: 'N/A', // Will be calculated from rubric criteria
              evaluatedBy: evaluation.evaluator?.name || 'Unknown',
              evaluationDate: evaluation.createdAt ? new Date(evaluation.createdAt).toLocaleDateString() : 'N/A'
            };
            styleDataRow(row);
            rowIndex++;
          }
        }
      }
    }

    // Generate the file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=master_data.xlsx');
    res.send(buffer);

  } catch (error) {
    console.error('Error exporting master data:', error);
    res.status(500).json({
      message: 'Error exporting master data',
      error: error.message
    });
  }
};

// Helper function to style data rows
function styleDataRow(row) {
  row.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  row.font = { size: 11 };
  row.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
}
