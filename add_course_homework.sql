-- Add homework assignments for all 12 courses
-- Run this after adding the courses
-- Execute with: psql -h localhost -U postgres -d psychology_lms -f add_course_homework.sql

BEGIN;

DO $$
DECLARE
  current_course RECORD;
  user_id INTEGER;
  user_cursor CURSOR FOR SELECT id FROM "user" WHERE "isAdmin" = false;
  base_date DATE := '2025-05-05'; -- Start date
  hw_due_date TIMESTAMP;
  hw_titles TEXT[] := ARRAY[
    'Reading Response', 
    'Case Study Analysis', 
    'Research Summary', 
    'Reflection Paper', 
    'Practice Exercises'
  ];
  hw_categories TEXT[] := ARRAY[
    'assignment', 
    'project', 
    'quiz', 
    'reflection', 
    'exercise'
  ];
  current_title TEXT;
  current_category TEXT;
  hw_description TEXT;
  i INTEGER;
  j INTEGER;
BEGIN
  -- For each course, add multiple homework assignments
  FOR current_course IN SELECT id, title FROM course WHERE "associatedWorkshop" = 'unboxing_psychology' LOOP
    
    -- Add 3 homework assignments per course with different due dates
    FOR i IN 1..3 LOOP
      -- Calculate due date (1 week apart for each assignment)
      hw_due_date := (base_date + ((i-1) * 7) * INTERVAL '1 day')::TIMESTAMP + TIME '23:59:00';
      
      -- Pick a title and category
      j := (i % 5) + 1;
      current_title := hw_titles[j];
      current_category := hw_categories[j];
      
      -- Create homework description based on course content
      hw_description := 'This ' || current_category || ' for the ' || current_course.title || ' course requires you to demonstrate your understanding of key concepts covered in week ' || i || '. ';
      
      IF current_category = 'assignment' THEN
        hw_description := hw_description || 'Read the assigned materials and write a 500-word response addressing the main concepts.';
      ELSIF current_category = 'project' THEN
        hw_description := hw_description || 'Analyze the provided case study and apply theoretical frameworks discussed in class.';
      ELSIF current_category = 'quiz' THEN
        hw_description := hw_description || 'Complete the online quiz covering material from the lectures and readings.';
      ELSIF current_category = 'reflection' THEN
        hw_description := hw_description || 'Write a personal reflection on how the course material applies to your own experiences.';
      ELSE
        hw_description := hw_description || 'Complete the practical exercises to apply the theories and methods discussed in class.';
      END IF;
      
      -- Create a homework for the current course that all students need to complete
      INSERT INTO homework (title, description, category, "dueDate", status, "courseId", "createdAt", "updatedAt")
      VALUES (
        current_title || ' ' || i || ' - ' || current_course.title,
        hw_description,
        current_category,
        hw_due_date,
        'not_started',
        current_course.id,
        NOW(),
        NOW()
      );
      
      -- Create individual assignments for each student (optional)
      -- This assigns a copy of the homework to each student individually
      OPEN user_cursor;
      LOOP
        FETCH user_cursor INTO user_id;
        EXIT WHEN NOT FOUND;
        
        -- Individual assignment with student assignment tracking
        INSERT INTO homework (
          title, 
          description, 
          category, 
          "dueDate", 
          status, 
          "assignedToId", 
          "courseId", 
          "studentResponse", 
          "createdAt", 
          "updatedAt"
        )
        VALUES (
          'Individual ' || current_title || ' ' || i || ' - ' || current_course.title,
          'Personalized version of homework: ' || hw_description,
          current_category,
          hw_due_date,
          'not_started',
          user_id,
          current_course.id,
          '',
          NOW(),
          NOW()
        );
      END LOOP;
      CLOSE user_cursor;
    END LOOP;
  END LOOP;
END $$;

COMMIT;

-- Display the homework assignments
SELECT 
  h.id, 
  h.title, 
  h.category, 
  c.title as course, 
  to_char(h."dueDate", 'Day, Month DD, YYYY HH:MI PM') as due_date, 
  h.status,
  u.email as assigned_to
FROM 
  homework h
  LEFT JOIN course c ON h."courseId" = c.id
  LEFT JOIN "user" u ON h."assignedToId" = u.id
WHERE 
  c."associatedWorkshop" = 'unboxing_psychology'
ORDER BY 
  c.id, h."dueDate", h."assignedToId" NULLS FIRST
LIMIT 20; 