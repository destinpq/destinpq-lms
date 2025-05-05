import { Injectable, NotFoundException } from '@nestjs/common';

// Mock course data
const COURSES = [
  {
    id: 'sample-course-id',
    title: 'Cognitive Behavioral Techniques',
    description: 'Learn about cognitive behavioral therapy techniques and applications.',
    instructor: 'Dr. Jane Smith',
    modules: [
      {
        id: 'module-1',
        title: 'Introduction to CBT',
        lessons: [
          {
            id: 'lesson-1',
            title: 'History and Background',
            content: '<h1>History and Background of CBT</h1><p>Cognitive Behavioral Therapy (CBT) was developed in the 1960s by Dr. Aaron Beck. It has since become one of the most widely used and effective therapeutic approaches.</p>'
          },
          {
            id: 'lesson-2',
            title: 'Core Principles',
            content: '<h1>Core Principles of CBT</h1><p>CBT is based on the idea that our thoughts, feelings, and behaviors are interconnected. By changing negative thought patterns, we can improve emotional regulation and develop coping strategies.</p>'
          }
        ]
      },
      {
        id: 'module-2',
        title: 'CBT Techniques',
        lessons: [
          {
            id: 'lesson-3',
            title: 'Cognitive Restructuring',
            content: '<h1>Cognitive Restructuring</h1><p>Cognitive restructuring is a technique used to help identify, challenge, and alter stress-inducing thought patterns and beliefs.</p>'
          },
          {
            id: 'lesson-4',
            title: 'Behavioral Activation',
            content: '<h1>Behavioral Activation</h1><p>Behavioral activation is a therapeutic technique used to help people increase engagement in positive, rewarding activities while decreasing avoidance and isolation.</p>'
          }
        ]
      }
    ]
  },
  {
    id: 'sample-course-id-2',
    title: 'Neuroscience Fundamentals',
    description: 'A deep dive into brain structure, functions, and their impact on behavior.',
    instructor: 'Dr. Michael Johnson',
    modules: [
      {
        id: 'module-1',
        title: 'Brain Anatomy',
        lessons: [
          {
            id: 'lesson-1',
            title: 'Cerebral Cortex',
            content: '<h1>The Cerebral Cortex</h1><p>The cerebral cortex is the outermost layer of neural tissue of the cerebrum of the brain. It plays a key role in memory, attention, perception, cognition, awareness, thought, language, and consciousness.</p>'
          },
          {
            id: 'lesson-2',
            title: 'Limbic System',
            content: '<h1>The Limbic System</h1><p>The limbic system is a set of brain structures that supports a variety of functions including emotion, behavior, motivation, long-term memory, and olfaction.</p>'
          }
        ]
      },
      {
        id: 'module-2',
        title: 'Neuroplasticity',
        lessons: [
          {
            id: 'lesson-3',
            title: 'Principles of Neuroplasticity',
            content: '<h1>Principles of Neuroplasticity</h1><p>Neuroplasticity is the ability of neural networks in the brain to change through growth and reorganization. These changes range from individual neurons making new connections to systematic adjustments like cortical remapping.</p>'
          },
          {
            id: 'lesson-4',
            title: 'Applications in Therapy',
            content: '<h1>Applications in Therapy</h1><p>Understanding neuroplasticity has led to the development of therapies and interventions designed to harness the brain\'s capacity for change, especially after injury or in developmental disorders.</p>'
          }
        ]
      }
    ]
  }
];

@Injectable()
export class CoursesService {
  findAll() {
    // Return a list of courses with limited information
    return COURSES.map(({ id, title, description, instructor }) => ({
      id,
      title,
      description,
      instructor
    }));
  }

  findOne(id: string) {
    const course = COURSES.find(course => course.id === id);
    
    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }
    
    return course;
  }
} 