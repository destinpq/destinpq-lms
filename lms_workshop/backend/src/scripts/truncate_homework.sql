-- Script to truncate only homework-related tables
-- This preserves users, courses, and other data

-- Disable foreign key checks to allow truncation
SET session_replication_role = 'replica';

-- Truncate the homework table
TRUNCATE TABLE "homework" RESTART IDENTITY CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Print confirmation
SELECT 'All homework data has been truncated.' AS "Message"; 