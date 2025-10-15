import sequelize from '../config/db.js';

/**
 * Migration: Add participantId column to evaluations (nullable) and FK
 * Run: node migrations/add_participantid_to_evaluations.js
 */

async function runMigration() {
  try {
    console.log('Starting migration: add participantId to evaluations...');

    // Add column if it doesn't exist (MySQL 8+ supports IF NOT EXISTS)
    await sequelize.query(`
      ALTER TABLE evaluations
      ADD COLUMN IF NOT EXISTS participantId INT NULL AFTER projectId;
    `);
    console.log('✓ participantId column ensured (nullable)');

    // Try to add foreign key constraint; ignore if it already exists or cannot be added
    try {
      await sequelize.query(`
        ALTER TABLE evaluations
        ADD CONSTRAINT fk_evaluations_participant
        FOREIGN KEY (participantId) REFERENCES project_participants(id)
        ON DELETE SET NULL
      `);
      console.log('✓ Added foreign key constraint fk_evaluations_participant');
    } catch (fkErr) {
      console.log('Note: could not add foreign key constraint (it may already exist):', fkErr.message);
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
