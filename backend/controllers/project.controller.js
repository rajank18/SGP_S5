import Project from '../models/Project.js';
import ProjectParticipant from '../models/ProjectParticipant.js';

// Create a new project
export const createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error creating project', error: err.message });
  }
};

// Get all projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects', error: err.message });
  }
};

// Get a single project (with participants)
export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findByPk(projectId, {
      include: [{ model: ProjectParticipant }]
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching project', error: err.message });
  }
};