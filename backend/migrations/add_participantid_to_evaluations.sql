-- Migration: Add participantId column to evaluations (nullable) and FK

ALTER TABLE evaluations
  ADD COLUMN participantId INT NULL AFTER projectId;

-- Add foreign key constraint if desired (run only if project_participants exists)
ALTER TABLE evaluations
  ADD CONSTRAINT fk_evaluations_participant
  FOREIGN KEY (participantId) REFERENCES project_participants(id)
  ON DELETE SET NULL;

-- Verify
SHOW COLUMNS FROM evaluations LIKE 'participantId';
