-- Script to create sample homework assignments for existing courses

-- First get the UUID of one admin user for instructor feedback
DO $$
DECLARE
    admin_id UUID;
    course_id UUID;
    course_record RECORD;
    num_assignments INT := 0;
BEGIN
    -- Get an admin user ID for instructor assignments
    SELECT id INTO admin_id FROM users WHERE role = 'admin' LIMIT 1;
    
    -- If no admin user found, exit
    IF admin_id IS NULL THEN
        RAISE NOTICE 'No admin user found in the database. Skipping homework creation.';
        RETURN;
    END IF;
    
    -- Loop through all courses
    FOR course_record IN SELECT id, title FROM courses LOOP
        course_id := course_record.id;
        
        -- Create Psychology 101 assignments
        IF course_record.title LIKE '%Introduction to Psychology%' THEN
            -- Assignment 1
            INSERT INTO homework (title, description, category, "dueDate", "courseId")
            VALUES (
                'Psychology Concepts Summary', 
                'Write a 2-page summary of the key psychological concepts discussed in class so far.', 
                'assignment', 
                CURRENT_DATE + INTERVAL '14 days',
                course_id
            );
            
            -- Assignment 2
            INSERT INTO homework (title, description, category, "dueDate", "courseId")
            VALUES (
                'Research Method Analysis', 
                'Select a psychology research paper and analyze the methodology used. Discuss strengths and weaknesses.', 
                'project', 
                CURRENT_DATE + INTERVAL '21 days',
                course_id
            );
            
            num_assignments := num_assignments + 2;
        END IF;
        
        -- Create Cognitive Psychology assignments
        IF course_record.title LIKE '%Cognitive Psychology%' THEN
            -- Assignment 1
            INSERT INTO homework (title, description, category, "dueDate", "courseId")
            VALUES (
                'Memory Experiment', 
                'Design and conduct a simple memory experiment with at least 5 participants. Document your findings.', 
                'project', 
                CURRENT_DATE + INTERVAL '10 days',
                course_id
            );
            
            -- Assignment 2
            INSERT INTO homework (title, description, category, "dueDate", "courseId")
            VALUES (
                'Cognitive Biases Reflection', 
                'Write a 3-page reflection identifying cognitive biases in everyday decision-making.', 
                'reflection', 
                CURRENT_DATE + INTERVAL '14 days',
                course_id
            );
            
            num_assignments := num_assignments + 2;
        END IF;
        
        -- Create Social Psychology assignments
        IF course_record.title LIKE '%Social Psychology%' THEN
            -- Assignment 1
            INSERT INTO homework (title, description, category, "dueDate", "courseId")
            VALUES (
                'Group Dynamics Analysis', 
                'Observe a social group interaction for 30 minutes and analyze the group dynamics using concepts from social psychology.', 
                'assignment', 
                CURRENT_DATE + INTERVAL '7 days',
                course_id
            );
            
            -- Assignment 2
            INSERT INTO homework (title, description, category, "dueDate", "courseId")
            VALUES (
                'Social Media Impact Study', 
                'Research and write a 4-page paper on how social media affects social behavior and interpersonal relationships.', 
                'project', 
                CURRENT_DATE + INTERVAL '21 days',
                course_id
            );
            
            num_assignments := num_assignments + 2;
        END IF;
        
        -- Default assignment for any course
        INSERT INTO homework (title, description, category, "dueDate", "courseId")
        VALUES (
            'Course Reflection', 
            'Write a 1-page reflection on what you have learned in this course and how you plan to apply it.', 
            'reflection', 
            CURRENT_DATE + INTERVAL '30 days',
            course_id
        );
        
        num_assignments := num_assignments + 1;
    END LOOP;
    
    RAISE NOTICE 'Successfully created % homework assignments across all courses', num_assignments;
END $$;

-- Print confirmation
SELECT 'Sample homework assignments have been created.' AS "Message"; 