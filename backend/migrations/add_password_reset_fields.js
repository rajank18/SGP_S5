import sequelize from '../config/db.js';
import { QueryTypes } from 'sequelize';

export const addPasswordResetFields = async () => {
  try {
    console.log('Adding passwordResetToken and passwordResetExpires fields to users table...');
    
    // Check if columns already exist
    const result = await sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME IN ('passwordResetToken', 'passwordResetExpires')`,
      { type: QueryTypes.SELECT }
    );

    if (result.length === 0) {
      // Add columns if they don't exist
      await sequelize.query(
        `ALTER TABLE users ADD COLUMN passwordResetToken VARCHAR(255) NULL DEFAULT NULL`
      );
      await sequelize.query(
        `ALTER TABLE users ADD COLUMN passwordResetExpires DATETIME NULL DEFAULT NULL`
      );
      console.log('✓ Password reset fields added successfully');
    } else {
      console.log('✓ Password reset fields already exist');
    }
  } catch (error) {
    console.error('Error adding password reset fields:', error);
  }
};
