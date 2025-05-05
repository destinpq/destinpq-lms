-- Debug and fix module IDs issue
DO $$
DECLARE
    course_id INTEGER;
    module1_id INTEGER;
    module2_id INTEGER;
    module3_id INTEGER;
BEGIN
    -- Get the course ID
    SELECT id INTO course_id FROM course WHERE title = 'Developmental Psychology Fundamentals';
    
    IF course_id IS NULL THEN
        RAISE EXCEPTION 'Course not found!';
    END IF;
    
    RAISE NOTICE 'Found course with ID: %', course_id;
    
    -- Get module IDs and verify they exist
    SELECT id INTO module1_id FROM module WHERE "courseId" = course_id AND "order" = 1;
    SELECT id INTO module2_id FROM module WHERE "courseId" = course_id AND "order" = 2;
    SELECT id INTO module3_id FROM module WHERE "courseId" = course_id AND "order" = 3;
    
    RAISE NOTICE 'Module IDs: % (Theories), % (Milestones), % (Research Methods)', 
        module1_id, module2_id, module3_id;
    
    -- Check if modules exist
    IF module1_id IS NULL OR module2_id IS NULL OR module3_id IS NULL THEN
        RAISE NOTICE 'Some modules are missing, creating them...';
        
        -- Create missing modules
        IF module1_id IS NULL THEN
            INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
            VALUES ('Developmental Theories', 1, course_id, NOW(), NOW())
            RETURNING id INTO module1_id;
            RAISE NOTICE 'Created Module 1 with ID: %', module1_id;
        END IF;
        
        IF module2_id IS NULL THEN
            INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
            VALUES ('Developmental Milestones', 2, course_id, NOW(), NOW())
            RETURNING id INTO module2_id;
            RAISE NOTICE 'Created Module 2 with ID: %', module2_id;
        END IF;
        
        IF module3_id IS NULL THEN
            INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
            VALUES ('Research Methods in Developmental Psychology', 3, course_id, NOW(), NOW())
            RETURNING id INTO module3_id;
            RAISE NOTICE 'Created Module 3 with ID: %', module3_id;
        END IF;
    END IF;
    
    -- Check for and add lessons to each module
    IF NOT EXISTS (SELECT 1 FROM lesson WHERE "moduleId" = module1_id) THEN
        RAISE NOTICE 'Adding lessons to Module 1 (ID: %)', module1_id;
        
        -- Add lessons for Module 1
        INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
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
            module1_id,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Added Piaget''s Theory lesson';
        
        INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
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
            module1_id,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Added Vygotsky''s Theory lesson';
        
        INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
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
            module1_id,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Added Attachment Theory lesson';
    ELSE
        RAISE NOTICE 'Lessons already exist for Module 1';
    END IF;
    
    -- Check for and add lessons to Module 2
    IF NOT EXISTS (SELECT 1 FROM lesson WHERE "moduleId" = module2_id) THEN
        RAISE NOTICE 'Adding lessons to Module 2 (ID: %)', module2_id;
        
        INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
        VALUES (
            'Infant Development (0-2 years)',
            '<h2>Infant Development (0-2 years)</h2>
            <p>The first two years of life represent a period of extraordinarily rapid development across physical, cognitive, social, and emotional domains.</p>
            <h3>Physical Development</h3>
            <ul>
              <li><strong>0-3 months</strong>: Reflex movements, lifting head when on stomach, tracking moving objects with eyes</li>
              <li><strong>3-6 months</strong>: Rolling over, reaching for objects, beginning to sit with support</li>
              <li><strong>6-9 months</strong>: Sitting without support, starting to crawl, developing pincer grasp</li>
              <li><strong>9-12 months</strong>: Pulling to stand, cruising along furniture, possibly first steps</li>
              <li><strong>12-24 months</strong>: Walking independently, running, climbing, scribbling with crayons</li>
            </ul>
            <h3>Cognitive Development</h3>
            <ul>
              <li>Developing object permanence (understanding objects exist even when not seen)</li>
              <li>Beginning of symbolic thinking and pretend play</li>
              <li>Increasing memory capacity and problem-solving abilities</li>
              <li>Language acquisition beginning with babbling and proceeding to first words and simple phrases</li>
            </ul>
            <p>This period lays the foundation for all future development, highlighting the importance of responsive caregiving, stimulating environments, and secure attachment relationships.</p>',
            1, 
            module2_id,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Added Infant Development lesson';
        
        INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
        VALUES (
            'Early Childhood (2-6 years)',
            '<h2>Early Childhood Development (2-6 years)</h2>
            <p>Early childhood is characterized by dramatic advances in cognitive abilities, language skills, and social-emotional development.</p>
            <h3>Cognitive Development</h3>
            <ul>
              <li>Development of symbolic thinking and representational abilities</li>
              <li>Emergence of Theory of Mind (understanding that others have different thoughts and feelings)</li>
              <li>Egocentric thinking gradually gives way to perspective-taking</li>
              <li>Developing understanding of basic concepts like numbers, colors, and categories</li>
            </ul>
            <h3>Language Development</h3>
            <ul>
              <li>Vocabulary explosion (learning 5-10 new words per day)</li>
              <li>Development of grammar and syntax</li>
              <li>Increasing conversational abilities</li>
              <li>Emerging literacy skills (phonological awareness, print concepts)</li>
            </ul>
            <h3>Social-Emotional Development</h3>
            <ul>
              <li>Developing self-concept and gender identity</li>
              <li>Emergence of prosocial behaviors and empathy</li>
              <li>Increasing emotional regulation abilities</li>
              <li>Development of peer relationships and cooperative play</li>
            </ul>
            <p>Play becomes increasingly complex during this period, evolving from solitary to parallel to cooperative play, and serves as a primary context for learning and development.</p>',
            2, 
            module2_id,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Added Early Childhood lesson';
    ELSE
        RAISE NOTICE 'Lessons already exist for Module 2';
    END IF;
    
    -- Check for and add lessons to Module 3
    IF NOT EXISTS (SELECT 1 FROM lesson WHERE "moduleId" = module3_id) THEN
        RAISE NOTICE 'Adding lessons to Module 3 (ID: %)', module3_id;
        
        INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
        VALUES (
            'Cross-Sectional vs. Longitudinal Research',
            '<h2>Cross-Sectional vs. Longitudinal Research</h2>
            <p>Developmental psychologists use different research designs to study changes across the lifespan. Two primary approaches are cross-sectional and longitudinal designs.</p>
            <h3>Cross-Sectional Research</h3>
            <ul>
              <li><strong>Definition</strong>: Studies different age groups at the same point in time</li>
              <li><strong>Advantages</strong>: Quicker to conduct, less expensive, no participant attrition</li>
              <li><strong>Limitations</strong>: Cannot distinguish age effects from cohort effects (generational differences)</li>
              <li><strong>Example</strong>: Comparing cognitive abilities of 20, 40, and 60 year-olds tested in 2023</li>
            </ul>
            <h3>Longitudinal Research</h3>
            <ul>
              <li><strong>Definition</strong>: Studies the same individuals repeatedly over an extended period</li>
              <li><strong>Advantages</strong>: Can track individual developmental trajectories, distinguishes between cohort effects and true developmental changes</li>
              <li><strong>Limitations</strong>: Time-consuming, expensive, participant attrition, practice effects</li>
              <li><strong>Example</strong>: The Grant Study following Harvard graduates for over 80 years</li>
            </ul>
            <h3>Sequential Designs</h3>
            <p>Researchers often combine approaches to overcome limitations:</p>
            <ul>
              <li><strong>Sequential designs</strong>: Follow multiple cohorts over time, allowing researchers to separate age, cohort, and time-of-measurement effects</li>
            </ul>
            <p>The choice of research design depends on the specific research questions, available resources, and practical constraints.</p>',
            1, 
            module3_id,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Added Research Methods lesson 1';
        
        INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
        VALUES (
            'Ethical Considerations in Developmental Research',
            '<h2>Ethical Considerations in Developmental Research</h2>
            <p>Research with children and vulnerable populations presents unique ethical challenges that researchers must carefully address.</p>
            <h3>Informed Consent</h3>
            <ul>
              <li>Parental/guardian consent required for minors</li>
              <li>Age-appropriate assent from children when possible</li>
              <li>Clear, accessible explanations of research procedures</li>
              <li>Emphasis on voluntary participation and right to withdraw</li>
            </ul>
            <h3>Minimizing Risks</h3>
            <ul>
              <li>Assessment of potential physical and psychological risks</li>
              <li>Procedures to minimize discomfort or distress</li>
              <li>Debriefing and follow-up when necessary</li>
              <li>Special considerations for sensitive topics</li>
            </ul>
            <h3>Confidentiality and Privacy</h3>
            <ul>
              <li>Protecting identifiable information</li>
              <li>Secure data storage and handling</li>
              <li>Clear limits to confidentiality (e.g., mandatory reporting of abuse)</li>
              <li>Considerations for longitudinal research and data sharing</li>
            </ul>
            <h3>Ethical Review and Oversight</h3>
            <ul>
              <li>Institutional Review Board (IRB) approval</li>
              <li>Ongoing monitoring of research procedures</li>
              <li>Adherence to professional guidelines and standards</li>
              <li>Responsiveness to emerging ethical concerns</li>
            </ul>
            <p>Researchers must balance the pursuit of knowledge with protection of participants, particularly when working with children and vulnerable populations.</p>',
            2, 
            module3_id,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Added Research Methods lesson 2';
    ELSE
        RAISE NOTICE 'Lessons already exist for Module 3';
    END IF;
    
    -- Update course total modules
    UPDATE course SET "totalModules" = 3 WHERE id = course_id;
    
    RAISE NOTICE 'Successfully added/verified modules and lessons for Developmental Psychology Fundamentals course.';
END $$; 