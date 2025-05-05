-- Script to create sample homework assignments
-- This script adds fixed sample assignments without requiring existing courses

-- Insert example homework assignments with dummy UUIDs
INSERT INTO homework (id, title, description, category, "dueDate", status)
VALUES 
(uuid_generate_v4(), 'Psychology Assignment 1', 'Write a summary of the key psychological concepts', 'assignment', CURRENT_DATE + INTERVAL '14 days', 'not_started'),
(uuid_generate_v4(), 'Cognitive Psychology Project', 'Design and conduct a memory experiment', 'project', CURRENT_DATE + INTERVAL '10 days', 'not_started'),
(uuid_generate_v4(), 'Social Psychology Research', 'Research the impact of social media on relationships', 'project', CURRENT_DATE + INTERVAL '21 days', 'not_started'),
(uuid_generate_v4(), 'Course Reflection', 'Write a reflection on what you have learned', 'reflection', CURRENT_DATE + INTERVAL '30 days', 'not_started');

-- Print confirmation
SELECT 'Sample homework assignments have been created.' AS "Message";
SELECT COUNT(*) AS "Total Homework Assignments" FROM homework; 