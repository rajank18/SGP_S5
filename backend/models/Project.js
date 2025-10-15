import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Project = sequelize.define('Project', {
  groupNo: { type: DataTypes.INTEGER },
  groupName: { type: DataTypes.STRING },
  title: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT },
  fileUrl: { type: DataTypes.STRING },
  projectReportUrl: { type: DataTypes.STRING },
  reportPublicId: { type: DataTypes.STRING }, // Cloudinary public ID for report
  presentationUrl: { type: DataTypes.STRING },
  presentationPublicId: { type: DataTypes.STRING }, // Cloudinary public ID for presentation
  internalGuideId: { type: DataTypes.INTEGER },
  externalGuideName: { type: DataTypes.STRING },
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  weeklyReportUrls: { type: DataTypes.JSON, allowNull: true }
}, {
  tableName: 'projects',
  timestamps: true,
});

export default Project;