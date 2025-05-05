-- Script to assign existing homework to students
-- This creates individual copies of homework for each student

DO $$
DECLARE
    hw_record RECORD;
    student_record RECORD;
    course_id UUID;
BEGIN
    -- Get course ID from the first course
    SELECT id INTO course_id FROM courses LIMIT 1;
    
    -- Create individual assignments for each student and each homework
    FOR hw_record IN SELECT id, title, description, category, "dueDate", status FROM homework WHERE "assignedToId" IS NULL LOOP
        FOR student_record IN SELECT id, email FROM users WHERE role = 'student' LOOP
            -- Create personalized version of the homework
            INSERT INTO homework (
                title, 
                description, 
                category, 
                "dueDate", 
                status, 
                "assignedToId", 
                "courseId"
            )
            VALUES (
                'Individual: ' || hw_record.title,
                'Personalized assignment for ' || student_record.email || ': ' || hw_record.description,
                hw_record.category,
                hw_record."dueDate",
                hw_record.status,
                student_record.id,
                course_id
            );
            
            RAISE NOTICE 'Created assignment for student %', student_record.email;
        END LOOP;
    END LOOP;
END $$;

-- Print confirmation and counts
SELECT 'Individual homework assignments have been created.' AS "Message";
SELECT COUNT(*) AS "Total Assignments" FROM homework;
SELECT COUNT(*) AS "Individual Assignments" FROM homework WHERE "assignedToId" IS NOT NULL; 