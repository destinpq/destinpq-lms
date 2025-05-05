-- SQL Script to add detailed course with modules and lessons
-- This script adds a complete course with rich content

-- Check if the course exists, insert if it doesn't
DO $$
DECLARE
    course_id INTEGER;
    module1_id INTEGER;
    module2_id INTEGER;
    module3_id INTEGER;
BEGIN
    -- Check if the example course exists
    SELECT id INTO course_id FROM course WHERE title = 'Advanced Cognitive Psychology';
    
    -- Create course if it doesn't exist
    IF course_id IS NULL THEN
        INSERT INTO course (title, description, instructor, status, "createdAt", "updatedAt", "totalModules", "enrolledStudents")
        VALUES (
            'Advanced Cognitive Psychology',
            'A comprehensive exploration of cognitive processes including perception, memory, language, problem solving, and decision making.',
            'Dr. Akanksha Agarwal',
            'ACTIVE',
            NOW(),
            NOW(),
            3,
            42
        )
        RETURNING id INTO course_id;
        
        RAISE NOTICE 'Created new course with ID: %', course_id;
    ELSE
        RAISE NOTICE 'Course already exists with ID: %', course_id;
    END IF;
    
    -- Create Module 1: Perception and Attention
    INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
    VALUES ('Perception and Attention', 1, course_id, NOW(), NOW())
    RETURNING id INTO module1_id;
    
    -- Add lessons to Module 1
    INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
    VALUES (
        'Visual Processing Pathways',
        '<h2>Visual Processing Pathways</h2>
        <p>The human visual system processes information through two main pathways: the dorsal ("where") and ventral ("what") streams.</p>
        
        <h3>The Ventral Stream</h3>
        <p>The ventral stream, often called the "what pathway," runs from the primary visual cortex (V1) through V2 and V4 to the inferior temporal cortex. This pathway is responsible for object recognition, face perception, and color processing.</p>
        <ul>
            <li>Processes form, color, and texture information</li>
            <li>Critical for object recognition and identification</li>
            <li>Contains specialized regions for face processing (fusiform face area)</li>
            <li>Damage can result in specific visual agnosias</li>
        </ul>
        
        <h3>The Dorsal Stream</h3>
        <p>The dorsal stream, or "where pathway," projects from V1 through the middle temporal area to the posterior parietal cortex. This pathway processes spatial relationships and guides actions.</p>
        <ul>
            <li>Processes motion and spatial location information</li>
            <li>Critical for visual-motor coordination</li>
            <li>Helps guide actions like reaching and grasping</li>
            <li>Damage can result in spatial neglect or optic ataxia</li>
        </ul>
        
        <h3>Integration and Interaction</h3>
        <p>While the two-streams model provides a useful framework, modern research shows significant interaction between these pathways. The visual system is highly interconnected, with information flowing back and forth between regions.</p>',
        1,
        module1_id,
        NOW(),
        NOW()
    );
    
    INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
    VALUES (
        'Selective Attention Mechanisms',
        '<h2>Selective Attention Mechanisms</h2>
        <p>Selective attention allows us to focus on relevant information while filtering out irrelevant stimuli. This critical cognitive ability has been studied through various models and experiments.</p>
        
        <h3>Early Selection Models</h3>
        <p>Proposed by Donald Broadbent in 1958, early selection models suggest that attentional filtering occurs early in perceptual processing. According to Broadbent''s Filter Theory:</p>
        <ul>
            <li>Information enters a sensory buffer</li>
            <li>A selective filter blocks unattended information based on physical characteristics</li>
            <li>Only attended information receives further processing</li>
            <li>Evidence: The cocktail party effect - ability to focus on one conversation in a noisy room</li>
        </ul>
        
        <h3>Late Selection Models</h3>
        <p>Deutsch and Deutsch (1963) proposed that selection happens after perceptual processing is complete:</p>
        <ul>
            <li>All stimuli are fully processed for meaning</li>
            <li>Selection occurs at the response stage</li>
            <li>Evidence: The ability to detect your name in an unattended conversation</li>
        </ul>
        
        <h3>Load Theory</h3>
        <p>Lavie''s Load Theory (1995) reconciles early and late selection models:</p>
        <ul>
            <li>Under high perceptual load, irrelevant stimuli are filtered early</li>
            <li>Under low perceptual load, irrelevant stimuli are processed</li>
            <li>Explains why selection sometimes appears early and sometimes late</li>
        </ul>
        
        <h3>Neural Mechanisms</h3>
        <p>Modern neuroscience has identified key brain regions involved in attention:</p>
        <ul>
            <li>Frontal and parietal networks form the "attention control network"</li>
            <li>Enhances neural responses to attended stimuli and suppresses responses to unattended stimuli</li>
            <li>Involves neurotransmitters like acetylcholine and norepinephrine</li>
        </ul>',
        2,
        module1_id,
        NOW(),
        NOW()
    );
    
    INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
    VALUES (
        'Change Blindness and Inattentional Blindness',
        '<h2>Change Blindness and Inattentional Blindness</h2>
        <p>These phenomena demonstrate surprising limitations in our visual awareness, revealing that we often fail to notice changes or unexpected objects in our visual field.</p>
        
        <h3>Change Blindness</h3>
        <p>Change blindness refers to the failure to detect changes in visual scenes, even when these changes are large and should be obvious.</p>
        <ul>
            <li><strong>Flicker Paradigm</strong>: When brief blank screens separate scene changes, observers often miss substantial alterations</li>
            <li><strong>Real-world Examples</strong>: People fail to notice when conversation partners are switched during brief interruptions</li>
            <li><strong>Implications</strong>: We don''t form complete internal representations of visual scenes</li>
            <li><strong>Explanation</strong>: Without attention specifically directed to the changing element, the change may not enter awareness</li>
        </ul>
        
        <h3>Inattentional Blindness</h3>
        <p>Inattentional blindness refers to the failure to notice unexpected objects or events when attention is focused elsewhere.</p>
        <ul>
            <li><strong>Classic Study</strong>: Simons and Chabris'' "Invisible Gorilla" experiment - about 50% of observers failed to notice a person in a gorilla suit walking through a basketball game when focused on counting passes</li>
            <li><strong>Factors Affecting Detection</strong>: Similarity of unexpected object to attended items, perceptual load, and individual differences</li>
            <li><strong>Real-world Implications</strong>: Critical for understanding failure to detect unexpected hazards while driving or in other safety-critical situations</li>
        </ul>
        
        <h3>Significance for Cognitive Theory</h3>
        <p>These phenomena challenge the intuitive belief that we see everything in our visual field. Instead, they suggest:</p>
        <ul>
            <li>Perception is highly selective and constructed</li>
            <li>We are aware of much less of our visual world than we believe</li>
            <li>Attention plays a crucial role in determining what we consciously perceive</li>
            <li>Our intuitions about our own perceptual abilities are often incorrect</li>
        </ul>',
        3,
        module1_id,
        NOW(),
        NOW()
    );
    
    -- Create Module 2: Memory and Learning
    INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
    VALUES ('Memory and Learning', 2, course_id, NOW(), NOW())
    RETURNING id INTO module2_id;
    
    -- Add lessons to Module 2
    INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
    VALUES (
        'Working Memory Models',
        '<h2>Working Memory Models</h2>
        <p>Working memory refers to the system responsible for temporarily holding and manipulating information. Several influential models have been proposed to explain its mechanisms.</p>
        
        <h3>Baddeley and Hitch Model</h3>
        <p>The most influential working memory model was proposed by Baddeley and Hitch in 1974 and has undergone several revisions since.</p>
        <h4>Core Components:</h4>
        <ul>
            <li><strong>Central Executive</strong>: Attentional control system that coordinates the subsystems</li>
            <li><strong>Phonological Loop</strong>: Stores and rehearses speech-based information</li>
            <li><strong>Visuospatial Sketchpad</strong>: Stores and manipulates visual and spatial information</li>
            <li><strong>Episodic Buffer</strong> (added in 2000): Integrates information from different subsystems and long-term memory</li>
        </ul>
        
        <h3>Cowan''s Embedded Processes Model</h3>
        <p>Cowan''s model views working memory as an activated portion of long-term memory:</p>
        <ul>
            <li>All information in working memory is part of long-term memory</li>
            <li>Information can be in different states of activation</li>
            <li>Focus of attention is limited to about 4 items</li>
            <li>Emphasizes attentional processes rather than separate storage buffers</li>
        </ul>
        
        <h3>Individual Differences and Capacity</h3>
        <p>Working memory capacity varies among individuals and has significant implications:</p>
        <ul>
            <li>Typically limited to 4±1 items (or "chunks")</li>
            <li>Strongly correlated with fluid intelligence</li>
            <li>Predictive of academic achievement</li>
            <li>Capacity can be measured using complex span tasks</li>
        </ul>
        
        <h3>Neural Basis</h3>
        <p>Working memory involves multiple brain regions:</p>
        <ul>
            <li>Prefrontal cortex: Critical for maintenance and manipulation</li>
            <li>Parietal cortex: Involved in storage functions</li>
            <li>Content-specific regions activate based on the type of information</li>
            <li>Depends on dopaminergic neurotransmission</li>
        </ul>',
        1,
        module2_id,
        NOW(),
        NOW()
    );
    
    INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
    VALUES (
        'Long-term Memory Formation',
        '<h2>Long-term Memory Formation</h2>
        <p>Long-term memory formation involves complex processes that transform experiences into enduring neural representations. Understanding these processes reveals how memories are encoded, consolidated, and stored.</p>
        
        <h3>Encoding</h3>
        <p>Encoding is the initial process of registering information in memory:</p>
        <ul>
            <li><strong>Levels of Processing</strong>: Deeper semantic processing leads to better memory than shallow processing</li>
            <li><strong>Elaboration</strong>: Connecting new information to existing knowledge enhances encoding</li>
            <li><strong>Self-reference Effect</strong>: Information related to oneself is remembered better</li>
            <li><strong>Generation Effect</strong>: Self-generated information is remembered better than passively received information</li>
        </ul>
        
        <h3>Consolidation</h3>
        <p>Consolidation refers to the stabilization of memory traces after initial encoding:</p>
        <ul>
            <li><strong>Synaptic Consolidation</strong>: Occurs within minutes to hours, involves protein synthesis and synaptic changes</li>
            <li><strong>Systems Consolidation</strong>: Occurs over days to years, involves reorganization of brain networks</li>
            <li><strong>Sleep and Consolidation</strong>: Different sleep stages play distinct roles in memory consolidation</li>
            <li><strong>Memory Reactivation</strong>: Spontaneous replay of neural patterns during rest and sleep strengthens memories</li>
        </ul>
        
        <h3>Cellular and Molecular Mechanisms</h3>
        <p>At the cellular level, long-term memory formation involves:</p>
        <ul>
            <li><strong>Long-term Potentiation (LTP)</strong>: Activity-dependent strengthening of synapses, considered a primary cellular mechanism of learning</li>
            <li><strong>CREB Pathway</strong>: Transcription factor critical for converting short-term to long-term memory</li>
            <li><strong>Protein Synthesis</strong>: Required for structural changes supporting long-term memory</li>
            <li><strong>Epigenetic Mechanisms</strong>: DNA methylation and histone modifications regulate gene expression for memory formation</li>
        </ul>
        
        <h3>Brain Structures</h3>
        <p>Key brain regions involved in memory formation include:</p>
        <ul>
            <li><strong>Hippocampus</strong>: Crucial for initial encoding of declarative memories</li>
            <li><strong>Amygdala</strong>: Critical for emotional memory enhancement</li>
            <li><strong>Prefrontal Cortex</strong>: Involved in strategic aspects of encoding and retrieval</li>
            <li><strong>Neocortex</strong>: Ultimate storage site for consolidated memories</li>
        </ul>',
        2,
        module2_id,
        NOW(),
        NOW()
    );
    
    -- Create Module 3: Decision Making and Cognitive Biases
    INSERT INTO module (title, "order", "courseId", "createdAt", "updatedAt")
    VALUES ('Decision Making and Cognitive Biases', 3, course_id, NOW(), NOW())
    RETURNING id INTO module3_id;
    
    -- Add lessons to Module 3
    INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
    VALUES (
        'Heuristics and Biases',
        '<h2>Heuristics and Biases</h2>
        <p>Humans rely on mental shortcuts (heuristics) when making judgments and decisions. While often useful, these can lead to systematic errors or cognitive biases.</p>
        
        <h3>Key Heuristics</h3>
        <p>Tversky and Kahneman identified several fundamental heuristics:</p>
        <ul>
            <li><strong>Availability Heuristic</strong>: Judging probability by how easily examples come to mind
                <ul>
                    <li>Example: Overestimating plane crash risk after reading news coverage</li>
                    <li>Bias: More memorable or recent events seem more probable</li>
                </ul>
            </li>
            <li><strong>Representativeness Heuristic</strong>: Judging probability by similarity to prototypes
                <ul>
                    <li>Example: Thinking Linda is more likely to be a "feminist bank teller" than just a "bank teller"</li>
                    <li>Bias: Conjunction fallacy - ignoring statistical principles</li>
                </ul>
            </li>
            <li><strong>Anchoring and Adjustment</strong>: Using initial values as reference points
                <ul>
                    <li>Example: Price negotiations starting with a high/low initial offer</li>
                    <li>Bias: Insufficient adjustment from arbitrary anchors</li>
                </ul>
            </li>
        </ul>
        
        <h3>Common Cognitive Biases</h3>
        <p>Beyond the basic heuristics, researchers have documented numerous biases:</p>
        <ul>
            <li><strong>Confirmation Bias</strong>: Seeking information that confirms existing beliefs</li>
            <li><strong>Hindsight Bias</strong>: Overestimating one''s ability to have predicted past events</li>
            <li><strong>Framing Effect</strong>: Being influenced by how information is presented</li>
            <li><strong>Overconfidence Effect</strong>: Excessive confidence in one''s judgments</li>
            <li><strong>Base Rate Neglect</strong>: Ignoring general statistical information in favor of specific cases</li>
        </ul>
        
        <h3>Debiasing Strategies</h3>
        <p>Several approaches can help reduce the impact of cognitive biases:</p>
        <ul>
            <li>Awareness of biases and their mechanisms</li>
            <li>Statistical training and fostering statistical thinking</li>
            <li>Considering alternative perspectives or hypotheses</li>
            <li>Using structured decision frameworks</li>
            <li>Leveraging group decision-making with diverse viewpoints</li>
        </ul>
        
        <h3>Evolutionary Perspective</h3>
        <p>Cognitive psychologists debate why biases persist:</p>
        <ul>
            <li>May have been adaptive in ancestral environments</li>
            <li>Represent trade-offs between accuracy and cognitive efficiency</li>
            <li>May be by-products of otherwise beneficial cognitive mechanisms</li>
        </ul>',
        1,
        module3_id,
        NOW(),
        NOW()
    );
    
    INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
    VALUES (
        'Dual Process Theory',
        '<h2>Dual Process Theory</h2>
        <p>Dual process theory proposes that human thinking operates through two distinct systems or processes, each with different characteristics and functions.</p>
        
        <h3>System 1 and System 2</h3>
        <p>Popularized by Daniel Kahneman in "Thinking, Fast and Slow," these systems represent different modes of cognition:</p>
        
        <h4>System 1 (Intuitive Thinking)</h4>
        <ul>
            <li><strong>Features</strong>: Fast, automatic, effortless, implicit, emotional</li>
            <li><strong>Operations</strong>: Pattern recognition, habitual responses, implicit learning</li>
            <li><strong>Strengths</strong>: Efficiency, parallel processing, handling familiar situations</li>
            <li><strong>Weaknesses</strong>: Prone to biases, difficulty with statistical reasoning</li>
            <li><strong>Examples</strong>: Recognizing faces, driving on familiar routes, gut reactions</li>
        </ul>
        
        <h4>System 2 (Analytical Thinking)</h4>
        <ul>
            <li><strong>Features</strong>: Slow, deliberate, effortful, explicit, logical</li>
            <li><strong>Operations</strong>: Rule-based reasoning, mental simulation, hypothetical thinking</li>
            <li><strong>Strengths</strong>: Logical consistency, ability to follow rules, handling novel situations</li>
            <li><strong>Weaknesses</strong>: Limited capacity, requires effort and motivation</li>
            <li><strong>Examples</strong>: Solving math problems, weighing pros and cons, learning new skills</li>
        </ul>
        
        <h3>Interaction Between Systems</h3>
        <p>The two systems interact in complex ways:</p>
        <ul>
            <li>System 2 can monitor and override System 1 (cognitive control)</li>
            <li>System 1 can influence System 2 through implicit biases and intuitions</li>
            <li>Practice can shift processing from System 2 to System 1 (skill acquisition)</li>
            <li>Cognitive load can reduce ability to engage System 2, leading to greater reliance on System 1</li>
        </ul>
        
        <h3>Neural Bases</h3>
        <p>Neuroimaging research suggests distinct but overlapping neural correlates:</p>
        <ul>
            <li>System 1: More activity in evolutionarily older brain regions (basal ganglia, amygdala)</li>
            <li>System 2: Greater prefrontal cortex and anterior cingulate cortex involvement</li>
            <li>Working memory capacity closely related to System 2 functioning</li>
        </ul>
        
        <h3>Applications</h3>
        <p>Dual process theory has implications for many domains:</p>
        <ul>
            <li><strong>Education</strong>: Teaching strategies to engage appropriate systems</li>
            <li><strong>Decision-making</strong>: Understanding when to trust intuition vs. analysis</li>
            <li><strong>Morality</strong>: Explaining emotional vs. principled moral judgments</li>
            <li><strong>Clinical psychology</strong>: Understanding automatic thought patterns in cognitive therapy</li>
        </ul>',
        2,
        module3_id,
        NOW(),
        NOW()
    );
    
    INSERT INTO lesson (title, content, "order", "moduleId", "createdAt", "updatedAt")
    VALUES (
        'Bounded Rationality',
        '<h2>Bounded Rationality</h2>
        <p>Bounded rationality, a concept introduced by Herbert Simon, recognizes that human decision-making is constrained by cognitive limitations, available information, and time constraints.</p>
        
        <h3>Key Principles</h3>
        <ul>
            <li><strong>Satisficing vs. Maximizing</strong>: Instead of optimizing (finding the best possible solution), people often satisfice (find a solution that is good enough)</li>
            <li><strong>Cognitive Limitations</strong>: Limited attention, working memory, and processing capacity constrain optimal decision-making</li>
            <li><strong>Environmental Structure</strong>: Decision environments can be more or less forgiving of cognitive limitations</li>
            <li><strong>Ecological Rationality</strong>: Simple heuristics can be highly effective when matched to appropriate environments</li>
        </ul>
        
        <h3>Simon''s Contributions</h3>
        <p>Herbert Simon''s pioneering work established foundational concepts:</p>
        <ul>
            <li>Challenged classical economic assumptions of perfect rationality</li>
            <li>Introduced "satisficing" as a realistic alternative to optimizing</li>
            <li>Emphasized that rationality is relative to cognitive capabilities</li>
            <li>Won the Nobel Prize in Economics (1978) for this work</li>
        </ul>
        
        <h3>Heuristics as Adaptive Tools</h3>
        <p>Building on bounded rationality, Gigerenzer and colleagues proposed that heuristics can be effective adaptive tools:</p>
        <ul>
            <li><strong>Fast and Frugal Heuristics</strong>: Simple decision rules that use minimal information</li>
            <li><strong>Recognition Heuristic</strong>: If one option is recognized and others aren''t, choose the recognized option</li>
            <li><strong>Take-the-Best</strong>: Consider cues one at a time in order of validity until a decision can be made</li>
            <li><strong>Tallying</strong>: Count the number of favorable cues for each option, ignoring cue weights</li>
        </ul>
        
        <h3>Applications and Implications</h3>
        <p>Bounded rationality has far-reaching implications for multiple domains:</p>
        <ul>
            <li><strong>Policy Design</strong>: Creating decision environments that work with human cognitive limitations</li>
            <li><strong>Artificial Intelligence</strong>: Designing systems that make good decisions under constraints</li>
            <li><strong>Organizational Behavior</strong>: Understanding how institutions can compensate for individual limitations</li>
            <li><strong>Financial Decision-Making</strong>: Explaining why people don''t make optimal investment choices</li>
        </ul>
        
        <h3>Modern Extensions</h3>
        <p>Contemporary research extends bounded rationality in several directions:</p>
        <ul>
            <li><strong>Bounded Willpower</strong>: Limitations in self-control even when optimal choices are known</li>
            <li><strong>Bounded Self-interest</strong>: Social preferences and fairness concerns in decision-making</li>
            <li><strong>Nudge Theory</strong>: Using choice architecture to improve decisions while preserving freedom of choice</li>
        </ul>',
        3,
        module3_id,
        NOW(),
        NOW()
    );
    
    -- Update the course total modules count
    UPDATE course SET "totalModules" = 3 WHERE id = course_id;
    
    RAISE NOTICE 'Successfully added detailed course data with all modules and lessons';
END $$; 