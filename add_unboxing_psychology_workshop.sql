-- Add "Unboxing Psychology" Workshop with 12 courses
-- Run this after truncate_all_except_users.sql
-- Execute with: psql -h localhost -U postgres -d psychology_lms -f add_unboxing_psychology_workshop.sql

BEGIN;

-- Insert the main workshop
INSERT INTO workshop (title, description, "startDate", "endDate", "isActive", "createdAt", "updatedAt", "maxParticipants", "durationWeeks", instructor, "scheduledAt")
VALUES (
  'Unboxing Psychology',
  'A comprehensive psychology workshop series covering various aspects of psychology from developmental theories to therapeutic approaches. This workshop includes 12 distinct courses spanning developmental psychology, abnormal psychology, and therapeutic modalities.',
  '2025-05-05', -- startDate (May 5, 2025)
  '2025-08-05', -- endDate (August 5, 2025)
  true,
  NOW(),
  NOW(),
  50,
  12,
  'Dr. Akanksha Agarwal',
  '2025-05-05 16:00:00' -- scheduledAt (May 5, 2025 at 4pm)
);

-- Get the workshop id for later use
DO $$
DECLARE
  workshop_id INTEGER;
  course_id INTEGER;
  module_id INTEGER;
  user_id INTEGER;
  user_cursor CURSOR FOR SELECT id FROM "user" WHERE "isAdmin" = false;
  student_count INTEGER;
BEGIN
  -- Get workshop ID
  SELECT currval(pg_get_serial_sequence('workshop', 'id')) INTO workshop_id;
  
  -- Get count of students (non-admin users)
  SELECT COUNT(*) FROM "user" WHERE "isAdmin" = false INTO student_count;

  -- Enroll all non-admin users in this workshop
  OPEN user_cursor;
  LOOP
    FETCH user_cursor INTO user_id;
    EXIT WHEN NOT FOUND;
    
    INSERT INTO workshop_attendees ("workshopId", "userId") 
    VALUES (workshop_id, user_id);
  END LOOP;
  CLOSE user_cursor;
  
  -- Update maxParticipants to reflect enrollment
  UPDATE workshop 
  SET "maxParticipants" = student_count
  WHERE id = workshop_id;

  -- Course 1: Developmental Psychology 
  INSERT INTO course (title, description, instructor, "associatedWorkshop", "maxStudents", "totalWeeks", "totalModules", "enrolledStudents", "createdAt", "updatedAt")
  VALUES (
    'Developmental Psychology Fundamentals',
    'Explore key developmental theories and their application across the lifespan, from infancy to older adulthood.',
    'Dr. Akanksha Agarwal',
    'unboxing_psychology',
    30,
    1,
    1,
    0,
    NOW(),
    NOW()
  ) RETURNING id INTO course_id;

  -- Enroll all students in this course
  OPEN user_cursor;
  LOOP
    FETCH user_cursor INTO user_id;
    EXIT WHEN NOT FOUND;
    
    INSERT INTO course_students ("courseId", "userId") 
    VALUES (course_id, user_id);
  END LOOP;
  CLOSE user_cursor;
  
  -- Update enrolled students count
  UPDATE course 
  SET "enrolledStudents" = student_count
  WHERE id = course_id;

  -- Add module for Course 1
  INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
  VALUES ('Developmental Theories', 1, course_id, NOW(), NOW()) 
  RETURNING id INTO module_id;

  -- Add lessons for Course 1
  INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
  VALUES 
    ('Piaget''s Cognitive Development Theory', 'Detailed exploration of Piaget''s four stages of cognitive development: sensorimotor, preoperational, concrete operational, and formal operational.', 1, module_id, NOW(), NOW()),
    ('Erikson''s Psychosocial Development', 'Analysis of Erikson''s eight stages of psychosocial development across the lifespan, focusing on identity formation and psychosocial crises.', 2, module_id, NOW(), NOW()),
    ('Attachment Theory', 'Study of attachment patterns in early childhood and their impact on later relationships and emotional development.', 3, module_id, NOW(), NOW());

  -- Course 2: Abnormal Psychology
  INSERT INTO course (title, description, instructor, "associatedWorkshop", "maxStudents", "totalWeeks", "totalModules", "enrolledStudents", "createdAt", "updatedAt")
  VALUES (
    'Abnormal Psychology & Disorders',
    'Study of psychological disorders, diagnostic criteria, and current treatment approaches. Focus on understanding the complexity of mental health conditions.',
    'Dr. Akanksha Agarwal',
    'unboxing_psychology',
    30,
    1,
    1,
    0,
    NOW(),
    NOW()
  ) RETURNING id INTO course_id;

  -- Enroll all students in this course
  OPEN user_cursor;
  LOOP
    FETCH user_cursor INTO user_id;
    EXIT WHEN NOT FOUND;
    
    INSERT INTO course_students ("courseId", "userId") 
    VALUES (course_id, user_id);
  END LOOP;
  CLOSE user_cursor;
  
  -- Update enrolled students count
  UPDATE course 
  SET "enrolledStudents" = student_count
  WHERE id = course_id;

  -- Add module for Course 2
  INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
  VALUES ('Major Psychological Disorders', 1, course_id, NOW(), NOW()) 
  RETURNING id INTO module_id;

  -- Add lessons for Course 2
  INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
  VALUES 
    ('Mood Disorders', 'Comprehensive overview of depressive and bipolar disorders, including symptoms, etiology, and treatment approaches.', 1, module_id, NOW(), NOW()),
    ('Anxiety Disorders', 'Examination of various anxiety disorders including GAD, panic disorder, phobias, and OCD, with focus on cognitive and biological factors.', 2, module_id, NOW(), NOW()),
    ('Psychotic Disorders', 'In-depth analysis of schizophrenia spectrum disorders, including positive and negative symptoms, neurocognitive aspects, and treatment challenges.', 3, module_id, NOW(), NOW());

  -- Course 3: Cognitive Psychology
  INSERT INTO course (title, description, instructor, "associatedWorkshop", "maxStudents", "totalWeeks", "totalModules", "enrolledStudents", "createdAt", "updatedAt")
  VALUES (
    'Cognitive Processes & Thinking',
    'Exploration of cognitive processes including perception, attention, memory, language, and decision-making.',
    'Dr. Akanksha Agarwal',
    'unboxing_psychology',
    30,
    1,
    1,
    0,
    NOW(),
    NOW()
  ) RETURNING id INTO course_id;

  -- Enroll all students in this course
  OPEN user_cursor;
  LOOP
    FETCH user_cursor INTO user_id;
    EXIT WHEN NOT FOUND;
    
    INSERT INTO course_students ("courseId", "userId") 
    VALUES (course_id, user_id);
  END LOOP;
  CLOSE user_cursor;
  
  -- Update enrolled students count
  UPDATE course 
  SET "enrolledStudents" = student_count
  WHERE id = course_id;

  -- Add module for Course 3
  INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
  VALUES ('Memory and Learning', 1, course_id, NOW(), NOW()) 
  RETURNING id INTO module_id;

  -- Add lessons for Course 3
  INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
  VALUES 
    ('Memory Processes', 'Study of encoding, storage, and retrieval processes in memory, including working memory, long-term memory, and autobiographical memory.', 1, module_id, NOW(), NOW()),
    ('Attention and Consciousness', 'Examination of attentional processes, selective attention, divided attention, and theories of consciousness.', 2, module_id, NOW(), NOW()),
    ('Language and Thought', 'Analysis of language acquisition, processing, and the relationship between language and thought, including linguistic relativity.', 3, module_id, NOW(), NOW());

  -- Course 4: Social Psychology
  INSERT INTO course (title, description, instructor, "associatedWorkshop", "maxStudents", "totalWeeks", "totalModules", "enrolledStudents", "createdAt", "updatedAt")
  VALUES (
    'Social Influence & Behavior',
    'Study of how others influence our thoughts, feelings, and behaviors, including conformity, obedience, and group dynamics.',
    'Dr. Akanksha Agarwal',
    'unboxing_psychology',
    30,
    1,
    1,
    0,
    NOW(),
    NOW()
  ) RETURNING id INTO course_id;

  -- Enroll all students in this course
  OPEN user_cursor;
  LOOP
    FETCH user_cursor INTO user_id;
    EXIT WHEN NOT FOUND;
    
    INSERT INTO course_students ("courseId", "userId") 
    VALUES (course_id, user_id);
  END LOOP;
  CLOSE user_cursor;
  
  -- Update enrolled students count
  UPDATE course 
  SET "enrolledStudents" = student_count
  WHERE id = course_id;

  -- Add module for Course 4
  INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
  VALUES ('Group Influence', 1, course_id, NOW(), NOW()) 
  RETURNING id INTO module_id;

  -- Add lessons for Course 4
  INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
  VALUES 
    ('Social Conformity', 'Examination of Asch''s conformity experiments, normative and informational influence, and factors affecting conformity.', 1, module_id, NOW(), NOW()),
    ('Obedience to Authority', 'Analysis of Milgram''s obedience studies, factors influencing obedience, and ethical implications for society.', 2, module_id, NOW(), NOW()),
    ('Group Polarization', 'Study of how group discussions can strengthen pre-existing attitudes and lead to more extreme positions.', 3, module_id, NOW(), NOW());

  -- Course 5: Biological Psychology
  INSERT INTO course (title, description, instructor, "associatedWorkshop", "maxStudents", "totalWeeks", "totalModules", "enrolledStudents", "createdAt", "updatedAt")
  VALUES (
    'Brain & Behavior Connections',
    'Exploration of the biological bases of behavior, including neural mechanisms, neurochemistry, and the influence of genetics.',
    'Dr. Akanksha Agarwal',
    'unboxing_psychology',
    30,
    1,
    1,
    0,
    NOW(),
    NOW()
  ) RETURNING id INTO course_id;

  -- Enroll all students in this course
  OPEN user_cursor;
  LOOP
    FETCH user_cursor INTO user_id;
    EXIT WHEN NOT FOUND;
    
    INSERT INTO course_students ("courseId", "userId") 
    VALUES (course_id, user_id);
  END LOOP;
  CLOSE user_cursor;
  
  -- Update enrolled students count
  UPDATE course 
  SET "enrolledStudents" = student_count
  WHERE id = course_id;

  -- Add module for Course 5
  INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
  VALUES ('Neuroscience Fundamentals', 1, course_id, NOW(), NOW()) 
  RETURNING id INTO module_id;

  -- Add lessons for Course 5
  INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
  VALUES 
    ('Neural Communication', 'Study of neurons, action potentials, neurotransmitters, and synaptic transmission.', 1, module_id, NOW(), NOW()),
    ('Brain Structure and Function', 'Examination of major brain regions and their specialized functions in cognition, emotion, and behavior.', 2, module_id, NOW(), NOW()),
    ('Genetics and Behavior', 'Analysis of genetic influences on behavior, including heritability, gene-environment interactions, and epigenetics.', 3, module_id, NOW(), NOW());

  -- Course 6: Personality Psychology
  INSERT INTO course (title, description, instructor, "associatedWorkshop", "maxStudents", "totalWeeks", "totalModules", "enrolledStudents", "createdAt", "updatedAt")
  VALUES (
    'Personality Theories & Assessment',
    'Overview of major personality theories and approaches to personality assessment.',
    'Dr. Akanksha Agarwal',
    'unboxing_psychology',
    30,
    1,
    1,
    0,
    NOW(),
    NOW()
  ) RETURNING id INTO course_id;

  -- Enroll all students in this course
  OPEN user_cursor;
  LOOP
    FETCH user_cursor INTO user_id;
    EXIT WHEN NOT FOUND;
    
    INSERT INTO course_students ("courseId", "userId") 
    VALUES (course_id, user_id);
  END LOOP;
  CLOSE user_cursor;
  
  -- Update enrolled students count
  UPDATE course 
  SET "enrolledStudents" = student_count
  WHERE id = course_id;

  -- Add module for Course 6
  INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
  VALUES ('Personality Perspectives', 1, course_id, NOW(), NOW()) 
  RETURNING id INTO module_id;

  -- Add lessons for Course 6
  INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
  VALUES 
    ('Trait Theories', 'Examination of trait approaches to personality, including the Five-Factor Model and biological bases of traits.', 1, module_id, NOW(), NOW()),
    ('Psychodynamic Theories', 'Analysis of Freud''s psychoanalytic theory and neo-Freudian approaches to personality development.', 2, module_id, NOW(), NOW()),
    ('Humanistic Theories', 'Study of Rogers'' person-centered approach and Maslow''s hierarchy of needs as frameworks for understanding personality.', 3, module_id, NOW(), NOW());

  -- Course 7: Health Psychology
  INSERT INTO course (title, description, instructor, "associatedWorkshop", "maxStudents", "totalWeeks", "totalModules", "enrolledStudents", "createdAt", "updatedAt")
  VALUES (
    'Psychology of Health & Wellness',
    'Study of psychological factors in health, illness, and healthcare, including stress, coping, and health behaviors.',
    'Dr. Akanksha Agarwal',
    'unboxing_psychology',
    30,
    1,
    1,
    0,
    NOW(),
    NOW()
  ) RETURNING id INTO course_id;

  -- Enroll all students in this course
  OPEN user_cursor;
  LOOP
    FETCH user_cursor INTO user_id;
    EXIT WHEN NOT FOUND;
    
    INSERT INTO course_students ("courseId", "userId") 
    VALUES (course_id, user_id);
  END LOOP;
  CLOSE user_cursor;
  
  -- Update enrolled students count
  UPDATE course 
  SET "enrolledStudents" = student_count
  WHERE id = course_id;

  -- Add module for Course 7
  INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
  VALUES ('Stress and Coping', 1, course_id, NOW(), NOW()) 
  RETURNING id INTO module_id;

  -- Add lessons for Course 7
  INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
  VALUES 
    ('Stress Physiology', 'Examination of physiological stress responses, including the HPA axis and sympathetic nervous system activation.', 1, module_id, NOW(), NOW()),
    ('Coping Mechanisms', 'Analysis of problem-focused and emotion-focused coping strategies and their effectiveness in different situations.', 2, module_id, NOW(), NOW()),
    ('Health Behavior Change', 'Study of models of health behavior change, including the Transtheoretical Model and Health Belief Model.', 3, module_id, NOW(), NOW());

  -- Course 8: Positive Psychology
  INSERT INTO course (title, description, instructor, "associatedWorkshop", "maxStudents", "totalWeeks", "totalModules", "enrolledStudents", "createdAt", "updatedAt")
  VALUES (
    'Well-being & Positive Emotions',
    'Exploration of human strengths, virtues, and factors that contribute to a fulfilling life.',
    'Dr. Akanksha Agarwal',
    'unboxing_psychology',
    30,
    1,
    1,
    0,
    NOW(),
    NOW()
  ) RETURNING id INTO course_id;

  -- Enroll all students in this course
  OPEN user_cursor;
  LOOP
    FETCH user_cursor INTO user_id;
    EXIT WHEN NOT FOUND;
    
    INSERT INTO course_students ("courseId", "userId") 
    VALUES (course_id, user_id);
  END LOOP;
  CLOSE user_cursor;
  
  -- Update enrolled students count
  UPDATE course 
  SET "enrolledStudents" = student_count
  WHERE id = course_id;

  -- Add module for Course 8
  INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
  VALUES ('Happiness and Flourishing', 1, course_id, NOW(), NOW()) 
  RETURNING id INTO module_id;

  -- Add lessons for Course 8
  INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
  VALUES 
    ('Positive Emotions', 'Study of the broaden-and-build theory of positive emotions and their role in resilience and well-being.', 1, module_id, NOW(), NOW()),
    ('Character Strengths', 'Examination of the VIA classification of character strengths and their application in everyday life.', 2, module_id, NOW(), NOW()),
    ('Flow and Engagement', 'Analysis of Csikszentmihalyi''s concept of flow and optimal experience in work and leisure activities.', 3, module_id, NOW(), NOW());

  -- Course 9: Cross-Cultural Psychology
  INSERT INTO course (title, description, instructor, "associatedWorkshop", "maxStudents", "totalWeeks", "totalModules", "enrolledStudents", "createdAt", "updatedAt")
  VALUES (
    'Cultural Perspectives in Psychology',
    'Examination of how culture influences human behavior, cognition, emotion, and social interactions.',
    'Dr. Akanksha Agarwal',
    'unboxing_psychology',
    30,
    1,
    1,
    0,
    NOW(),
    NOW()
  ) RETURNING id INTO course_id;

  -- Enroll all students in this course
  OPEN user_cursor;
  LOOP
    FETCH user_cursor INTO user_id;
    EXIT WHEN NOT FOUND;
    
    INSERT INTO course_students ("courseId", "userId") 
    VALUES (course_id, user_id);
  END LOOP;
  CLOSE user_cursor;
  
  -- Update enrolled students count
  UPDATE course 
  SET "enrolledStudents" = student_count
  WHERE id = course_id;

  -- Add module for Course 9
  INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
  VALUES ('Cultural Influences', 1, course_id, NOW(), NOW()) 
  RETURNING id INTO module_id;

  -- Add lessons for Course 9
  INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
  VALUES 
    ('Individualism vs. Collectivism', 'Analysis of cultural value dimensions and their impact on cognition, emotion, and social behavior.', 1, module_id, NOW(), NOW()),
    ('Cultural Neuroscience', 'Exploration of cultural influences on brain development and neural processing of information.', 2, module_id, NOW(), NOW()),
    ('Culture and Mental Health', 'Examination of cultural variations in psychopathology, help-seeking behaviors, and treatment effectiveness.', 3, module_id, NOW(), NOW());

  -- Course 10: Educational Psychology
  INSERT INTO course (title, description, instructor, "associatedWorkshop", "maxStudents", "totalWeeks", "totalModules", "enrolledStudents", "createdAt", "updatedAt")
  VALUES (
    'Learning & Educational Applications',
    'Study of how people learn in educational settings, including cognitive, social, and motivational factors.',
    'Dr. Akanksha Agarwal',
    'unboxing_psychology',
    30,
    1,
    1,
    0,
    NOW(),
    NOW()
  ) RETURNING id INTO course_id;

  -- Enroll all students in this course
  OPEN user_cursor;
  LOOP
    FETCH user_cursor INTO user_id;
    EXIT WHEN NOT FOUND;
    
    INSERT INTO course_students ("courseId", "userId") 
    VALUES (course_id, user_id);
  END LOOP;
  CLOSE user_cursor;
  
  -- Update enrolled students count
  UPDATE course 
  SET "enrolledStudents" = student_count
  WHERE id = course_id;

  -- Add module for Course 10
  INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
  VALUES ('Learning Processes', 1, course_id, NOW(), NOW()) 
  RETURNING id INTO module_id;

  -- Add lessons for Course 10
  INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
  VALUES 
    ('Cognitive Learning Processes', 'Study of information processing, working memory, and cognitive load theory in educational contexts.', 1, module_id, NOW(), NOW()),
    ('Motivation in Learning', 'Examination of intrinsic and extrinsic motivation, self-determination theory, and achievement goal theory.', 2, module_id, NOW(), NOW()),
    ('Individual Differences', 'Analysis of learning styles, multiple intelligences, and the role of personality in academic achievement.', 3, module_id, NOW(), NOW());

  -- Course 11: Industrial-Organizational Psychology
  INSERT INTO course (title, description, instructor, "associatedWorkshop", "maxStudents", "totalWeeks", "totalModules", "enrolledStudents", "createdAt", "updatedAt")
  VALUES (
    'Psychology in the Workplace',
    'Application of psychological principles to organizations and the workplace, focusing on productivity, leadership, and employee well-being.',
    'Dr. Akanksha Agarwal',
    'unboxing_psychology',
    30,
    1,
    1,
    0,
    NOW(),
    NOW()
  ) RETURNING id INTO course_id;

  -- Enroll all students in this course
  OPEN user_cursor;
  LOOP
    FETCH user_cursor INTO user_id;
    EXIT WHEN NOT FOUND;
    
    INSERT INTO course_students ("courseId", "userId") 
    VALUES (course_id, user_id);
  END LOOP;
  CLOSE user_cursor;
  
  -- Update enrolled students count
  UPDATE course 
  SET "enrolledStudents" = student_count
  WHERE id = course_id;

  -- Add module for Course 11
  INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
  VALUES ('Organizational Behavior', 1, course_id, NOW(), NOW()) 
  RETURNING id INTO module_id;

  -- Add lessons for Course 11
  INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
  VALUES 
    ('Leadership and Management', 'Examination of leadership styles, transformational leadership, and evidence-based management practices.', 1, module_id, NOW(), NOW()),
    ('Employee Motivation', 'Analysis of job satisfaction, organizational commitment, and theories of work motivation.', 2, module_id, NOW(), NOW()),
    ('Team Dynamics', 'Study of group processes, team effectiveness, and virtual team collaboration.', 3, module_id, NOW(), NOW());

  -- Course 12: Psychological Research Methods
  INSERT INTO course (title, description, instructor, "associatedWorkshop", "maxStudents", "totalWeeks", "totalModules", "enrolledStudents", "createdAt", "updatedAt")
  VALUES (
    'Research Design & Data Analysis',
    'Introduction to research methods in psychology, including experimental design, survey methods, and statistical analysis.',
    'Dr. Akanksha Agarwal',
    'unboxing_psychology',
    30,
    1,
    1,
    0,
    NOW(),
    NOW()
  ) RETURNING id INTO course_id;

  -- Enroll all students in this course
  OPEN user_cursor;
  LOOP
    FETCH user_cursor INTO user_id;
    EXIT WHEN NOT FOUND;
    
    INSERT INTO course_students ("courseId", "userId") 
    VALUES (course_id, user_id);
  END LOOP;
  CLOSE user_cursor;
  
  -- Update enrolled students count
  UPDATE course 
  SET "enrolledStudents" = student_count
  WHERE id = course_id;

  -- Add module for Course 12
  INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
  VALUES ('Research Fundamentals', 1, course_id, NOW(), NOW()) 
  RETURNING id INTO module_id;

  -- Add lessons for Course 12
  INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
  VALUES 
    ('Experimental Design', 'Study of variables, control techniques, and validity in experimental research.', 1, module_id, NOW(), NOW()),
    ('Qualitative Methods', 'Examination of interviews, focus groups, and thematic analysis in psychological research.', 2, module_id, NOW(), NOW()),
    ('Ethics in Research', 'Analysis of ethical principles, informed consent, and research with vulnerable populations.', 3, module_id, NOW(), NOW());

END $$;

COMMIT;

-- Display results
SELECT w.id, w.title, w."maxParticipants",
       (SELECT COUNT(*) FROM course WHERE "associatedWorkshop" = 'unboxing_psychology') AS total_courses
FROM workshop w
WHERE w.title = 'Unboxing Psychology';

SELECT c.id, c.title, c."enrolledStudents", 
       (SELECT COUNT(*) FROM module WHERE "courseId" = c.id) AS modules,
       (SELECT COUNT(*) FROM module m JOIN lesson l ON m.id = l."moduleId" WHERE m."courseId" = c.id) AS lessons
FROM course c
WHERE c."associatedWorkshop" = 'unboxing_psychology'
ORDER BY c.id; 