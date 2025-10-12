import { Evaluation, Project, Course, Rubric, Criterion, CourseRubric, ProjectParticipant, User } from '../models/index.js';
import sequelize from '../config/db.js';

// GET /api/faculty/courses/:courseId/projects/:projectId/rubrics
// Get assigned rubrics for a specific project (faculty view)
export const getProjectRubrics = async (req, res) => {
  try {
    const { courseId, projectId } = req.params;
    const facultyId = req.user.id;

    // Verify project exists and belongs to this course and faculty
    const project = await Project.findOne({
      where: { id: projectId, courseId, internalGuideId: facultyId }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or not authorized' });
    }

    // Get assigned rubrics for this course-faculty pair
    const courseRubrics = await CourseRubric.findAll({
      where: { courseId, facultyId },
      include: [
        {
          model: Rubric,
          as: 'rubric',
          include: [
            {
              model: Criterion,
              as: 'criteria',
              order: [['id', 'ASC']]
            }
          ]
        }
      ]
    });

    const rubrics = courseRubrics.map(cr => cr.rubric);
    res.json({ rubrics });
  } catch (error) {
    console.error('Error fetching project rubrics:', error);
    res.status(500).json({ message: 'Failed to fetch rubrics', error: error.message });
  }
};

// POST /api/faculty/evaluations
// Save evaluation for a project
export const saveEvaluation = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const facultyId = req.user.id;
    const { courseId, projectId, rubricId, criteriaMarks, generalFeedback } = req.body;

    // Validate input
    if (!courseId || !projectId || !rubricId || !Array.isArray(criteriaMarks)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify project exists and belongs to this faculty
    const project = await Project.findOne({
      where: { id: projectId, courseId, internalGuideId: facultyId }
    });

    if (!project) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Project not found or not authorized' });
    }

    // Verify rubric is assigned to this course-faculty pair
    const courseRubric = await CourseRubric.findOne({
      where: { courseId, facultyId, rubricId }
    });

    if (!courseRubric) {
      await transaction.rollback();
      return res.status(403).json({ message: 'Rubric not assigned to this course' });
    }

    // Calculate total marks
    const totalMarks = criteriaMarks.reduce((sum, item) => sum + (item.marks || 0), 0);

    // Check if evaluation already exists
    const existingEvaluation = await Evaluation.findOne({
      where: { projectId, rubricId, facultyId }
    });

    let evaluation;
    if (existingEvaluation) {
      // Update existing evaluation
      await existingEvaluation.update({
        criteriaMarks,
        totalMarks,
        generalFeedback: generalFeedback || null
      }, { transaction });
      evaluation = existingEvaluation;
    } else {
      // Create new evaluation
      evaluation = await Evaluation.create({
        courseId,
        projectId,
        rubricId,
        facultyId,
        criteriaMarks,
        totalMarks,
        generalFeedback: generalFeedback || null
      }, { transaction });
    }

    await transaction.commit();
    res.json({ 
      message: 'Evaluation saved successfully',
      evaluation 
    });
  } catch (error) {
    try { await transaction.rollback(); } catch (_) { /* ignore */ }
    console.error('Error saving evaluation:', error);
    res.status(500).json({ message: 'Failed to save evaluation', error: error.message });
  }
};

// GET /api/faculty/evaluations/:projectId/:rubricId
// Get evaluation for a specific project and rubric (faculty view)
export const getEvaluation = async (req, res) => {
  try {
    const { projectId, rubricId } = req.params;
    const facultyId = req.user.id;

    const evaluation = await Evaluation.findOne({
      where: { projectId, rubricId, facultyId },
      include: [
        {
          model: Rubric,
          as: 'rubric',
          include: [
            {
              model: Criterion,
              as: 'criteria'
            }
          ]
        },
        {
          model: Project,
          as: 'project'
        }
      ]
    });

    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    res.json({ evaluation });
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    res.status(500).json({ message: 'Failed to fetch evaluation', error: error.message });
  }
};

// GET /api/student/projects/:projectId/evaluations
// Get all evaluations for a project (student view - read only)
export const getProjectEvaluations = async (req, res) => {
  try {
    const { projectId } = req.params;
    const studentId = req.user.id;

    // Verify student is part of this project
    const participant = await ProjectParticipant.findOne({
      where: { projectId, studentId }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    // Get all evaluations for this project
    const evaluations = await Evaluation.findAll({
      where: { projectId },
      include: [
        {
          model: Rubric,
          as: 'rubric',
          include: [
            {
              model: Criterion,
              as: 'criteria'
            }
          ]
        },
        {
          model: User,
          as: 'evaluator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ evaluations });
  } catch (error) {
    console.error('Error fetching project evaluations:', error);
    res.status(500).json({ message: 'Failed to fetch evaluations', error: error.message });
  }
};

export default {
  getProjectRubrics,
  saveEvaluation,
  getEvaluation,
  getProjectEvaluations
};
