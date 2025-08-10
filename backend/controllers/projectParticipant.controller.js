import ProjectParticipant from '../models/ProjectParticipant.js';

// Add a participant to a project
export const addParticipant = async (req, res) => {
  try {
    const participant = await ProjectParticipant.create(req.body);
    res.status(201).json(participant);
  } catch (err) {
    res.status(500).json({ message: 'Error adding participant', error: err.message });
  }
};

// Get all participants for a project
export const getParticipantsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const participants = await ProjectParticipant.findAll({ where: { projectId } });
    res.json(participants);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching participants', error: err.message });
  }
};