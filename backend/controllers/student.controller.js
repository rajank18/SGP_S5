import Project from '../models/Project.js';
import ProjectParticipant from '../models/ProjectParticipant.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';
import fs from 'fs';

// GET /api/student/projects
// Returns the list of project groups that the logged-in student belongs to,
// including title, groupNo, groupName, faculty (internal guide) name/email, and course info
export const getMyProjects = async (req, res) => {
  try {
    const studentId = req.user.id;

    const projects = await Project.findAll({
      include: [
        {
          model: ProjectParticipant,
          as: 'participants',
          where: { studentId },
          required: true,
          attributes: ['studentId'],
        },
        {
          model: User,
          as: 'internalGuide',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'courseCode', 'semester', 'year'],
        },
      ],
      order: [['groupNo', 'ASC']],
    });

    const response = projects.map((p) => ({
      id: p.id,
      groupNo: p.groupNo,
      groupName: p.groupName,
      title: p.title,
      description: p.description,
      course: p.course ? { id: p.course.id, name: p.course.name, courseCode: p.course.courseCode, semester: p.course.semester, year: p.course.year } : null,
      faculty: p.internalGuide ? { id: p.internalGuide.id, name: p.internalGuide.name, email: p.internalGuide.email } : null,
      externalGuideName: p.externalGuideName,
      fileUrl: p.fileUrl,
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
    }));

    res.json({ projects: response });
  } catch (error) {
    console.error('Error fetching student projects:', error);
    res.status(500).json({ message: 'Failed to fetch student projects', error: error.message });
  }
};

// GET /api/student/projects/:projectId
// Returns full details of the specified project if the logged-in student is a participant
export const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    const studentId = req.user.id;

    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: ProjectParticipant,
          as: 'participants',
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
        { model: User, as: 'internalGuide', attributes: ['id', 'name', 'email'] },
        { model: Course, as: 'course', attributes: ['id', 'name', 'courseCode', 'semester', 'year'] },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isParticipant = await ProjectParticipant.findOne({ where: { projectId: project.id, studentId } });
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    return res.json(project);
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ message: 'Failed to fetch project details', error: error.message });
  }
};

// PUT /api/student/projects/:projectId
// Allows a student in the project to update description and fileUrl for the group (single submission per group)
export const updateMyProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const studentId = req.user.id;
    const { description, fileUrl } = req.body || {};

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isParticipant = await ProjectParticipant.findOne({ where: { projectId: project.id, studentId } });
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    if (typeof description === 'string') {
      project.description = description.trim();
    }
    if (typeof fileUrl === 'string') {
      project.fileUrl = fileUrl.trim();
    }

    await project.save();
    res.json({ message: 'Project updated', project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Failed to update project', error: error.message });
  }
};

// POST /api/student/projects/:projectId/upload-report
// Uploads project report PDF for the group (single upload per group)
export const uploadProjectReport = async (req, res) => {
  try {
    const { projectId } = req.params;
    const studentId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isParticipant = await ProjectParticipant.findOne({ where: { projectId: project.id, studentId } });
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to upload for this project' });
    }

    if (project.projectReportUrl) {
      return res.status(400).json({ message: 'Project report already uploaded' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'raw',
      folder: 'prograde/projects/reports',
    });

    project.projectReportUrl = result.secure_url;
    project.reportPublicId = result.public_id;
    await project.save();

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.json({ message: 'Project report uploaded successfully', url: result.secure_url });
  } catch (error) {
    console.error('Error uploading project report:', error);
    res.status(500).json({ message: 'Failed to upload project report', error: error.message });
  }
};

// POST /api/student/projects/:projectId/upload-presentation
// Uploads PPT presentation for the group (single upload per group)
export const uploadPresentation = async (req, res) => {
  try {
    const { projectId } = req.params;
    const studentId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isParticipant = await ProjectParticipant.findOne({ where: { projectId: project.id, studentId } });
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to upload for this project' });
    }

    if (project.presentationUrl) {
      return res.status(400).json({ message: 'Presentation already uploaded' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'raw',
      folder: 'prograde/projects/presentations',
    });

    project.presentationUrl = result.secure_url;
    project.presentationPublicId = result.public_id;
    await project.save();

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.json({ message: 'Presentation uploaded successfully', url: result.secure_url });
  } catch (error) {
    console.error('Error uploading presentation:', error);
    res.status(500).json({ message: 'Failed to upload presentation', error: error.message });
  }
};

// DELETE /api/student/projects/:projectId/delete-report
// Removes the project report from Cloudinary and clears the URL from the database
export const deleteProjectReport = async (req, res) => {
  try {
    const { projectId } = req.params;
    const studentId = req.user.id;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isParticipant = await ProjectParticipant.findOne({ where: { projectId: project.id, studentId } });
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to delete for this project' });
    }

    if (!project.reportPublicId) {
      return res.status(400).json({ message: 'No report uploaded or public_id not available' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(project.reportPublicId);

    // Clear fields
    project.projectReportUrl = null;
    project.reportPublicId = null;
    await project.save();

    res.json({ message: 'Project report deleted successfully' });
  } catch (error) {
    console.error('Error deleting project report:', error);
    res.status(500).json({ message: 'Failed to delete project report', error: error.message });
  }
};

// DELETE /api/student/projects/:projectId/delete-presentation
// Removes the presentation from Cloudinary and clears the URL from the database
export const deletePresentation = async (req, res) => {
  try {
    const { projectId } = req.params;
    const studentId = req.user.id;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isParticipant = await ProjectParticipant.findOne({ where: { projectId: project.id, studentId } });
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to delete for this project' });
    }

    if (!project.presentationPublicId) {
      return res.status(400).json({ message: 'No presentation uploaded or public_id not available' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(project.presentationPublicId);

    // Clear fields
    project.presentationUrl = null;
    project.presentationPublicId = null;
    await project.save();

    res.json({ message: 'Presentation deleted successfully' });
  } catch (error) {
    console.error('Error deleting presentation:', error);
    res.status(500).json({ message: 'Failed to delete presentation', error: error.message });
  }
};
