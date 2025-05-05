-- Script to create sample homework with various types and questions

-- Variables for the script
DO $$
DECLARE
    course_id UUID;
    quiz_id UUID;
    document_upload_id UUID;
    descriptive_id UUID;
    multiple_choice_id UUID;
BEGIN
    -- Get a course ID to attach homework to
    SELECT id INTO course_id FROM courses LIMIT 1;
    
    -- 1. Create a QUIZ type homework
    INSERT INTO homework (
        title, 
        description, 
        category, 
        "dueDate", 
        status, 
        "homeworkType", 
        "courseId"
    ) 
    VALUES (
        'Psychology Concepts Quiz', 
        'Test your knowledge of key psychological concepts discussed in class so far.', 
        'quiz', 
        CURRENT_DATE + INTERVAL '14 days', 
        'not_started', 
        'quiz', 
        course_id
    )
    RETURNING id INTO quiz_id;
    
    -- Add single choice question
    INSERT INTO homework_questions (
        "homeworkId", 
        question, 
        "questionType", 
        options, 
        "correctAnswer", 
        points
    )
    VALUES (
        quiz_id,
        'Who is considered the founder of psychoanalysis?',
        'single_choice',
        '["Sigmund Freud", "Carl Jung", "B.F. Skinner", "Ivan Pavlov"]',
        '"Sigmund Freud"',
        10
    );
    
    -- Add multiple choice question
    INSERT INTO homework_questions (
        "homeworkId", 
        question, 
        "questionType", 
        options, 
        "correctAnswer", 
        points
    )
    VALUES (
        quiz_id,
        'Which of the following are branches of psychology? (Select all that apply)',
        'multiple_choice',
        '["Clinical Psychology", "Cognitive Psychology", "Medieval Psychology", "Developmental Psychology"]',
        '["Clinical Psychology", "Cognitive Psychology", "Developmental Psychology"]',
        15
    );
    
    -- Add matching question
    INSERT INTO homework_questions (
        "homeworkId", 
        question, 
        "questionType", 
        options, 
        "correctAnswer", 
        points
    )
    VALUES (
        quiz_id,
        'Match the following psychologists with their contributions:',
        'matching',
        '{"items": ["Pavlov", "Skinner", "Piaget", "Maslow"], "matches": ["Classical Conditioning", "Operant Conditioning", "Cognitive Development", "Hierarchy of Needs"]}',
        '{"Pavlov": "Classical Conditioning", "Skinner": "Operant Conditioning", "Piaget": "Cognitive Development", "Maslow": "Hierarchy of Needs"}',
        20
    );
    
    -- 2. Create a DOCUMENT_UPLOAD homework
    INSERT INTO homework (
        title, 
        description, 
        category, 
        "dueDate", 
        status, 
        "homeworkType", 
        "courseId",
        "fileAttachment"
    ) 
    VALUES (
        'Research Paper: Psychology in Modern Society', 
        'Write a 5-page research paper exploring how psychological principles apply to a modern social issue of your choice.', 
        'assignment', 
        CURRENT_DATE + INTERVAL '21 days', 
        'not_started', 
        'document_upload', 
        course_id,
        'https://example.com/psychology_research_template.pdf'
    )
    RETURNING id INTO document_upload_id;
    
    -- Add a descriptive question as instructions
    INSERT INTO homework_questions (
        "homeworkId", 
        question, 
        "questionType", 
        points
    )
    VALUES (
        document_upload_id,
        'Upload your completed research paper as a PDF document. Your paper should include the following sections: Introduction, Literature Review, Methodology, Findings, and Conclusion.',
        'descriptive',
        100
    );
    
    -- 3. Create a DESCRIPTIVE homework
    INSERT INTO homework (
        title, 
        description, 
        category, 
        "dueDate", 
        status, 
        "homeworkType", 
        "courseId"
    ) 
    VALUES (
        'Case Study Analysis: Behavioral Disorders', 
        'Analyze the provided case study and answer the questions.', 
        'assignment', 
        CURRENT_DATE + INTERVAL '10 days', 
        'not_started', 
        'descriptive', 
        course_id
    )
    RETURNING id INTO descriptive_id;
    
    -- Add descriptive questions
    INSERT INTO homework_questions (
        "homeworkId", 
        question, 
        "questionType", 
        points
    )
    VALUES (
        descriptive_id,
        'Based on the case study, identify the main symptoms displayed by the patient and suggest a possible diagnosis. Support your answer with evidence from the text.',
        'descriptive',
        25
    );
    
    INSERT INTO homework_questions (
        "homeworkId", 
        question, 
        "questionType", 
        points
    )
    VALUES (
        descriptive_id,
        'What treatment approaches would you recommend for this patient? Discuss at least three evidence-based interventions.',
        'descriptive',
        25
    );
    
    -- 4. Create a MIXED type homework (multiple choice + descriptive)
    INSERT INTO homework (
        title, 
        description, 
        category, 
        "dueDate", 
        status, 
        "homeworkType", 
        "courseId"
    ) 
    VALUES (
        'Cognitive Psychology Assessment', 
        'Answer both multiple choice and short answer questions about cognitive psychology.', 
        'assignment', 
        CURRENT_DATE + INTERVAL '7 days', 
        'not_started', 
        'quiz', 
        course_id
    )
    RETURNING id INTO multiple_choice_id;
    
    -- Add multiple choice questions
    INSERT INTO homework_questions (
        "homeworkId", 
        question, 
        "questionType", 
        options, 
        "correctAnswer", 
        points
    )
    VALUES (
        multiple_choice_id,
        'Which cognitive bias describes the tendency to search for information that confirms one''s existing beliefs?',
        'single_choice',
        '["Availability heuristic", "Confirmation bias", "Anchoring bias", "Hindsight bias"]',
        '"Confirmation bias"',
        10
    );
    
    -- Add descriptive question
    INSERT INTO homework_questions (
        "homeworkId", 
        question, 
        "questionType", 
        points
    )
    VALUES (
        multiple_choice_id,
        'Explain how working memory differs from long-term memory, and describe one experiment that demonstrates this difference.',
        'descriptive',
        20
    );
    
    RAISE NOTICE 'Created 4 different types of homework with various question types';
END $$;

-- Print confirmation and counts
SELECT 'Sample homework with different question types created.' AS "Message";
SELECT 
    h."homeworkType", 
    COUNT(DISTINCT h.id) AS homework_count,
    COUNT(q.id) AS question_count
FROM 
    homework h
LEFT JOIN 
    homework_questions q ON h.id = q."homeworkId"
GROUP BY 
    h."homeworkType"; 