#!/bin/bash

# Set the app name
APP_NAME="destinpq-lms"

echo "Importing workshop and course data into Heroku Postgres database for $APP_NAME..."

# Import Unboxing Psychology workshop
echo "Creating Unboxing Psychology workshop..."
heroku pg:psql -c "
INSERT INTO workshop (title, description, \"startDate\", \"endDate\", \"isActive\", \"createdAt\", \"updatedAt\", \"maxParticipants\", \"durationWeeks\", instructor, \"scheduledAt\")
VALUES (
  'Unboxing Psychology',
  'A comprehensive psychology workshop series covering various aspects of psychology from developmental theories to therapeutic approaches. This workshop includes 12 distinct courses spanning developmental psychology, abnormal psychology, and therapeutic modalities.',
  '2025-05-05',
  '2025-08-05',
  true,
  NOW(),
  NOW(),
  50,
  12,
  'Dr. Akanksha Agarwal',
  '2025-05-05 16:00:00'
);" --app $APP_NAME

# Get the workshop ID
WORKSHOP_ID=$(heroku pg:psql -c "SELECT id FROM workshop WHERE title = 'Unboxing Psychology' LIMIT 1;" --app $APP_NAME | tail -n 3 | head -n 1 | tr -d ' ')
echo "Created workshop with ID: $WORKSHOP_ID"

# Enroll users in the workshop
echo "Enrolling users in the workshop..."
heroku pg:psql -c "
INSERT INTO workshop_attendees (\"workshopId\", \"userId\", \"joinedAt\", \"updatedAt\")
SELECT $WORKSHOP_ID, id, NOW(), NOW() FROM \"user\";" --app $APP_NAME

# Create Developmental Psychology course
echo "Creating Developmental Psychology course..."
heroku pg:psql -c "
INSERT INTO course (title, description, instructor, \"associatedWorkshop\", \"maxStudents\", \"totalWeeks\", \"totalModules\", \"enrolledStudents\", \"createdAt\", \"updatedAt\")
VALUES (
  'Developmental Psychology Fundamentals',
  'Explore key developmental theories and their application across the lifespan, from infancy to older adulthood.',
  'Dr. Akanksha Agarwal',
  'unboxing_psychology',
  30,
  1,
  3,
  2,
  NOW(),
  NOW()
);" --app $APP_NAME

# Get the course ID
COURSE_ID=$(heroku pg:psql -c "SELECT id FROM course WHERE title = 'Developmental Psychology Fundamentals' LIMIT 1;" --app $APP_NAME | tail -n 3 | head -n 1 | tr -d ' ')
echo "Created course with ID: $COURSE_ID"

# Enroll users in the course
echo "Enrolling users in the course..."
heroku pg:psql -c "
INSERT INTO course_students (\"courseId\", \"userId\", \"enrolledAt\", \"updatedAt\")
SELECT $COURSE_ID, id, NOW(), NOW() FROM \"user\";" --app $APP_NAME

# Create modules for the course
echo "Creating modules for the course..."
heroku pg:psql -c "
INSERT INTO module (title, \"order\", \"courseId\", \"createdAt\", \"updatedAt\")
VALUES ('Developmental Theories', 1, $COURSE_ID, NOW(), NOW()),
       ('Developmental Milestones', 2, $COURSE_ID, NOW(), NOW()),
       ('Research Methods in Developmental Psychology', 3, $COURSE_ID, NOW(), NOW());" --app $APP_NAME

# Get module IDs
MODULE1_ID=$(heroku pg:psql -c "SELECT id FROM module WHERE \"courseId\" = $COURSE_ID AND \"order\" = 1 LIMIT 1;" --app $APP_NAME | tail -n 3 | head -n 1 | tr -d ' ')
MODULE2_ID=$(heroku pg:psql -c "SELECT id FROM module WHERE \"courseId\" = $COURSE_ID AND \"order\" = 2 LIMIT 1;" --app $APP_NAME | tail -n 3 | head -n 1 | tr -d ' ')
MODULE3_ID=$(heroku pg:psql -c "SELECT id FROM module WHERE \"courseId\" = $COURSE_ID AND \"order\" = 3 LIMIT 1;" --app $APP_NAME | tail -n 3 | head -n 1 | tr -d ' ')

echo "Created modules with IDs: $MODULE1_ID, $MODULE2_ID, $MODULE3_ID"

# Create lessons for Module 1
echo "Creating lessons for Module 1..."
heroku pg:psql -c "
INSERT INTO lesson (title, content, \"order\", \"moduleId\", \"createdAt\", \"updatedAt\")
VALUES (
  'Piaget''s Theory of Cognitive Development',
  '<h2>Piaget''s Theory of Cognitive Development</h2>
  <p>Jean Piaget was a Swiss psychologist known for his pioneering work in child development. His theory of cognitive development describes how children''s thinking patterns evolve through four distinct stages as they grow.</p>
  <h3>The Four Stages</h3>
  <ul>
    <li><strong>Sensorimotor Stage (Birth to 2 years)</strong>: Infants understand the world through sensory experiences and physical interactions. Object permanence develops during this stage.</li>
    <li><strong>Preoperational Stage (2 to 7 years)</strong>: Children begin to use symbolic thinking but struggle with logic and taking others'' perspectives. Magical thinking is common.</li>
    <li><strong>Concrete Operational Stage (7 to 11 years)</strong>: Logical thinking emerges about concrete events. Children develop conservation, classification, and seriation skills.</li>
    <li><strong>Formal Operational Stage (12 years and up)</strong>: Abstract reasoning, hypothetical thinking, and systematic problem-solving develop.</li>
  </ul>
  <p>Piaget''s theory emphasizes that children actively construct their understanding of the world through experiences and interactions, not simply by absorbing information passively.</p>',
  1, 
  $MODULE1_ID,
  NOW(),
  NOW()
);" --app $APP_NAME

echo "Creating lessons for Module 1 (continued)..."
heroku pg:psql -c "
INSERT INTO lesson (title, content, \"order\", \"moduleId\", \"createdAt\", \"updatedAt\")
VALUES (
  'Vygotsky''s Sociocultural Theory',
  '<h2>Vygotsky''s Sociocultural Theory</h2>
  <p>Lev Vygotsky''s sociocultural theory emphasizes the role of social interaction and culture in cognitive development. Unlike Piaget, who focused on individual construction of knowledge, Vygotsky believed that learning occurs primarily through social interactions.</p>
  <h3>Key Concepts</h3>
  <ul>
    <li><strong>Zone of Proximal Development (ZPD)</strong>: The gap between what a learner can do independently and what they can do with guidance. Learning occurs most effectively in this zone.</li>
    <li><strong>Scaffolding</strong>: Temporary support provided to help a child master a task or concept, gradually removed as the child becomes more independent.</li>
    <li><strong>Cultural Tools</strong>: Language, symbols, and other cultural artifacts that help children organize and control their thinking.</li>
    <li><strong>Private Speech</strong>: Children''s self-talk that guides their thinking and behavior, eventually becoming internal thought.</li>
  </ul>
  <p>Vygotsky''s theory has profound implications for education, emphasizing collaborative learning, guided instruction, and the importance of cultural context in development.</p>',
  2, 
  $MODULE1_ID,
  NOW(),
  NOW()
);" --app $APP_NAME

echo "Creating lessons for Module 1 (continued)..."
heroku pg:psql -c "
INSERT INTO lesson (title, content, \"order\", \"moduleId\", \"createdAt\", \"updatedAt\")
VALUES (
  'Attachment Theory',
  '<h2>Attachment Theory</h2>
  <p>Attachment theory, developed by John Bowlby and expanded by Mary Ainsworth, describes the emotional bond between infants and their primary caregivers and how these early relationships affect social and emotional development throughout life.</p>
  <h3>Attachment Styles</h3>
  <ul>
    <li><strong>Secure Attachment</strong>: Children feel confident exploring their environment, using the caregiver as a secure base. They show distress when separated but are easily comforted upon reunion.</li>
    <li><strong>Anxious-Ambivalent Attachment</strong>: Children are clingy and anxious, often reluctant to explore. They become extremely distressed upon separation and may show ambivalence (seeking comfort while simultaneously showing anger) upon reunion.</li>
    <li><strong>Avoidant Attachment</strong>: Children appear independent and show little distress when separated from caregivers. They may avoid or ignore the caregiver upon reunion.</li>
    <li><strong>Disorganized Attachment</strong>: Children show inconsistent, contradictory behaviors during separation and reunion, often due to frightening or unpredictable caregiver behavior.</li>
  </ul>
  <p>Research shows that early attachment patterns can influence relationships, emotional regulation, and mental health throughout the lifespan, highlighting the importance of responsive caregiving in early childhood.</p>',
  3, 
  $MODULE1_ID,
  NOW(),
  NOW()
);" --app $APP_NAME

# Create workshop session
echo "Creating workshop session..."
heroku pg:psql -c "
INSERT INTO workshop_session (title, description, \"workshopId\", \"scheduledAt\", \"durationMinutes\", \"createdAt\", \"updatedAt\")
VALUES (
  'Week 1 - Introduction to Psychology',
  'Introduction to key psychological concepts and theories. Please prepare by reviewing the course materials.',
  $WORKSHOP_ID,
  '2025-05-12 16:00:00',
  120,
  NOW(),
  NOW()
);" --app $APP_NAME

# Create homework assignment
echo "Creating homework assignment..."
heroku pg:psql -c "
INSERT INTO homework (title, description, category, \"dueDate\", status, \"courseId\", \"createdAt\", \"updatedAt\")
VALUES (
  'Reading Response 1 - Developmental Psychology',
  'Read the assigned materials and write a 500-word response addressing the main concepts of Piaget''s theory of cognitive development.',
  'assignment',
  '2025-05-15 23:59:00',
  'not_started',
  $COURSE_ID,
  NOW(),
  NOW()
);" --app $APP_NAME

# Create personal homework assignments for users
echo "Creating personal homework assignments for users..."
heroku pg:psql -c "
INSERT INTO homework (title, description, category, \"dueDate\", status, \"assignedToId\", \"courseId\", \"studentResponse\", \"createdAt\", \"updatedAt\")
SELECT 
  'Individual Reading Response 1 - Developmental Psychology',
  'Personalized version of homework: Read the assigned materials and write a 500-word response addressing the main concepts of Piaget''s theory of cognitive development.',
  'assignment',
  '2025-05-15 23:59:00',
  'not_started',
  id,
  $COURSE_ID,
  '',
  NOW(),
  NOW()
FROM \"user\";" --app $APP_NAME

echo "Verifying data..."
echo "Workshops:"
heroku pg:psql -c "SELECT id, title, instructor FROM workshop;" --app $APP_NAME

echo "Courses:"
heroku pg:psql -c "SELECT id, title, instructor FROM course;" --app $APP_NAME

echo "Modules:"
heroku pg:psql -c "SELECT id, title, \"courseId\" FROM module;" --app $APP_NAME

echo "Lessons:"
heroku pg:psql -c "SELECT id, title, \"moduleId\" FROM lesson;" --app $APP_NAME

echo "Workshop sessions:"
heroku pg:psql -c "SELECT id, title, \"workshopId\" FROM workshop_session;" --app $APP_NAME

echo "Homework assignments:"
heroku pg:psql -c "SELECT id, title, \"courseId\", \"assignedToId\" FROM homework;" --app $APP_NAME

echo "Finished importing data!" 