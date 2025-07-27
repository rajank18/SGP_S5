import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ProjectParticipant = sequelize.define('ProjectParticipant', {
  projectId: { type: DataTypes.INTEGER, allowNull: false },
  studentId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'project_participants',
  timestamps: true,
});

export default ProjectParticipant;