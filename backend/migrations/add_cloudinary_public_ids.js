import sequelize from '../config/db.js';

/**
 * Migration: Add reportPublicId and presentationPublicId columns to projects table
 * Run this with: node migrations/add_cloudinary_public_ids.js
 */

async function runMigration() {
  try {
    console.log('Starting migration: Adding Cloudinary public ID columns...');

    // Add reportPublicId column
    await sequelize.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS reportPublicId VARCHAR(255) DEFAULT NULL AFTER projectReportUrl
    `);
    console.log('✓ Added reportPublicId column');

    // Add presentationPublicId column
    await sequelize.query(`
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS presentationPublicId VARCHAR(255) DEFAULT NULL AFTER presentationUrl
    `);
    console.log('✓ Added presentationPublicId column');

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
