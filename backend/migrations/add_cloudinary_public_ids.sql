-- Migration: Add Cloudinary public ID columns to projects table
-- Run this SQL script in your MySQL database

ALTER TABLE projects 
ADD COLUMN reportPublicId VARCHAR(255) DEFAULT NULL AFTER projectReportUrl,
ADD COLUMN presentationPublicId VARCHAR(255) DEFAULT NULL AFTER presentationUrl;

-- Verify the changes
DESCRIBE projects;
