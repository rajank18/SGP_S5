-- Migration: Add weeklyReportUrls column to projects table for weekly report uploads
ALTER TABLE projects ADD COLUMN weeklyReportUrls JSON DEFAULT NULL AFTER presentationPublicId;
