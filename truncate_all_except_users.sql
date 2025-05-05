-- Script to truncate all data except users
-- Execute with: psql -h localhost -U postgres -d psychology_lms -f truncate_all_except_users.sql

-- Disable foreign key constraints temporarily
SET session_replication_role = 'replica';

-- Truncate all tables except user
TRUNCATE TABLE course CASCADE;
TRUNCATE TABLE module CASCADE;
TRUNCATE TABLE lesson CASCADE;
TRUNCATE TABLE homework CASCADE; 
TRUNCATE TABLE workshop CASCADE;
TRUNCATE TABLE achievement CASCADE;
TRUNCATE TABLE message CASCADE;
TRUNCATE TABLE workshop_attendees CASCADE;
TRUNCATE TABLE achievement_users CASCADE;
TRUNCATE TABLE user_achievements CASCADE;

-- Reset sequences
ALTER SEQUENCE course_id_seq RESTART WITH 1;
ALTER SEQUENCE module_id_seq RESTART WITH 1;
ALTER SEQUENCE lesson_id_seq RESTART WITH 1;
ALTER SEQUENCE homework_id_seq RESTART WITH 1;
ALTER SEQUENCE workshop_id_seq RESTART WITH 1;
ALTER SEQUENCE achievement_id_seq RESTART WITH 1;
ALTER SEQUENCE message_id_seq RESTART WITH 1;

-- Re-enable foreign key constraints
SET session_replication_role = 'origin'; 