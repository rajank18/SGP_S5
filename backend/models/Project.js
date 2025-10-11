import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Project = sequelize.define('Project', {
  groupNo: { type: DataTypes.INTEGER },
  groupName: { type: DataTypes.STRING },
  title: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT },
  fileUrl: { type: DataTypes.STRING },
  projectReportUrl: { type: DataTypes.STRING },
  presentationUrl: { type: DataTypes.STRING },
  internalGuideId: { type: DataTypes.INTEGER },
  externalGuideName: { type: DataTypes.STRING },
  courseId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'projects',
  timestamps: true,
});

export default Project;