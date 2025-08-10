
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js'; // Adjust path if necessary

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('faculty', 'student', 'admin'),
    allowNull: false,
  },
  departmentId: {
    type: DataTypes.INTEGER,
    // This will be a foreign key, but we don't define the relation here.
    // We'll define all relations in a central models/index.js file later.
    allowNull: true, 
  }
}, {
  tableName: 'users',
  timestamps: true, // This is the default, adds createdAt and updatedAt
});

export default User;