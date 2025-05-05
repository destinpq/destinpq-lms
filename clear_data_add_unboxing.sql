-- Script to truncate all data except users and Jitsi features, add Unboxing Psychology workshop
-- Execute with: heroku pg:psql -a lms-workshop-backend2 < clear_data_add_unboxing.sql

-- Disable foreign key constraints temporarily
SET session_replication_role = 'replica';

-- Truncate all tables except user and Jitsi-related functionality
TRUNCATE TABLE course CASCADE;
TRUNCATE TABLE module CASCADE;
TRUNCATE TABLE lesson CASCADE;
TRUNCATE TABLE homework CASCADE; 
TRUNCATE TABLE achievement CASCADE;
TRUNCATE TABLE message CASCADE; -- Removing chat messages
TRUNCATE TABLE workshop_attendees CASCADE;
TRUNCATE TABLE achievement_users CASCADE;
TRUNCATE TABLE user_achievements CASCADE;

-- Keep workshop table but clear it first to add our new workshop
TRUNCATE TABLE workshop CASCADE;

-- Reset sequences
ALTER SEQUENCE course_id_seq RESTART WITH 1;
ALTER SEQUENCE module_id_seq RESTART WITH 1;
ALTER SEQUENCE lesson_id_seq RESTART WITH 1;
ALTER SEQUENCE homework_id_seq RESTART WITH 1;
ALTER SEQUENCE workshop_id_seq RESTART WITH 1;
ALTER SEQUENCE achievement_id_seq RESTART WITH 1;
ALTER SEQUENCE message_id_seq RESTART WITH 1;

-- Insert the Unboxing Psychology workshop with Jitsi features enabled
INSERT INTO workshop (title, description, "startDate", "endDate", "isActive", "createdAt", "updatedAt", "maxParticipants", "durationWeeks", instructor, "scheduledAt")
VALUES (
  'Unboxing Psychology',
  'A comprehensive psychology workshop with interactive Jitsi features including whiteboard and video conferencing.',
  NOW(), -- startDate (current date)
  NOW() + INTERVAL '3 months', -- endDate (3 months from now)
  true,
  NOW(),
  NOW(),
  50,
  12,
  'Dr. Akanksha Agarwal',
  NOW() + INTERVAL '1 day' -- scheduledAt (tomorrow)
);

-- Get the workshop id
DO $$
DECLARE
  workshop_id INTEGER;
  user_id INTEGER;
  user_cursor CURSOR FOR SELECT id FROM "user" WHERE "isAdmin" = false;
BEGIN
  -- Get workshop ID
  SELECT currval(pg_get_serial_sequence('workshop', 'id')) INTO workshop_id;
  
  -- Enroll all non-admin users in this workshop
  OPEN user_cursor;
  LOOP
    FETCH user_cursor INTO user_id;
    EXIT WHEN NOT FOUND;
    
    INSERT INTO workshop_attendees ("workshopId", "userId") 
    VALUES (workshop_id, user_id);
  END LOOP;
  CLOSE user_cursor;
END $$;

-- Re-enable foreign key constraints
SET session_replication_role = 'origin';

-- Show results
SELECT * FROM workshop;
SELECT COUNT(*) FROM workshop_attendees; 