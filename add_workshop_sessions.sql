-- Add workshop sessions (Mon/Wed/Fri at 4pm) for 4 weeks
-- Run this after adding the workshop
-- Execute with: psql -h localhost -U postgres -d psychology_lms -f add_workshop_sessions.sql

BEGIN;

-- Get the workshop ID
DO $$
DECLARE
  workshop_id INTEGER;
  base_date DATE := '2025-05-05'; -- First Monday in May 2025
  session_date DATE;
  session_time TIME := '16:00:00'; -- 4PM
  scheduled_timestamp TIMESTAMP;
  session_title TEXT;
  week_number INTEGER;
  day_name TEXT;
BEGIN
  -- Get the Unboxing Psychology workshop ID
  SELECT id FROM workshop WHERE title = 'Unboxing Psychology' INTO workshop_id;
  
  IF workshop_id IS NULL THEN
    RAISE EXCEPTION 'Workshop not found';
  END IF;

  -- Create 12 sessions (3 per week for 4 weeks - Monday, Wednesday, Friday)
  FOR week_number IN 1..4 LOOP
    -- Monday session
    session_date := base_date + ((week_number - 1) * 7) * INTERVAL '1 day';
    scheduled_timestamp := session_date + session_time;
    day_name := 'Monday';
    session_title := 'Week ' || week_number || ' - ' || day_name || ' Session';
    
    INSERT INTO workshop_session (title, description, "workshopId", "scheduledAt", "durationMinutes", "createdAt", "updatedAt")
    VALUES (
      session_title,
      'Psychology session covering material from week ' || week_number || '. Please prepare by reviewing the course materials.',
      workshop_id,
      scheduled_timestamp,
      120, -- 2 hours in minutes
      NOW(),
      NOW()
    );
    
    -- Wednesday session (Monday + 2 days)
    session_date := base_date + ((week_number - 1) * 7 + 2) * INTERVAL '1 day';
    scheduled_timestamp := session_date + session_time;
    day_name := 'Wednesday';
    session_title := 'Week ' || week_number || ' - ' || day_name || ' Session';
    
    INSERT INTO workshop_session (title, description, "workshopId", "scheduledAt", "durationMinutes", "createdAt", "updatedAt")
    VALUES (
      session_title,
      'Psychology session covering material from week ' || week_number || '. Please prepare by reviewing the course materials.',
      workshop_id,
      scheduled_timestamp,
      120, -- 2 hours in minutes
      NOW(),
      NOW()
    );
    
    -- Friday session (Monday + 4 days)
    session_date := base_date + ((week_number - 1) * 7 + 4) * INTERVAL '1 day';
    scheduled_timestamp := session_date + session_time;
    day_name := 'Friday';
    session_title := 'Week ' || week_number || ' - ' || day_name || ' Session';
    
    INSERT INTO workshop_session (title, description, "workshopId", "scheduledAt", "durationMinutes", "createdAt", "updatedAt")
    VALUES (
      session_title,
      'Psychology session covering material from week ' || week_number || '. Please prepare by reviewing the course materials.',
      workshop_id,
      scheduled_timestamp,
      120, -- 2 hours in minutes
      NOW(),
      NOW()
    );
  END LOOP;
END $$;

COMMIT;

-- Display the sessions
SELECT 
  ws.id,
  ws.title,
  w.title as workshop_name,
  to_char(ws."scheduledAt", 'Day, Month DD, YYYY HH:MI AM') as scheduled_time,
  ws."durationMinutes" as duration
FROM 
  workshop_session ws
  JOIN workshop w ON ws."workshopId" = w.id
WHERE 
  w.title = 'Unboxing Psychology'
ORDER BY 
  ws."scheduledAt"; 