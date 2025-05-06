import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
  ) {}

  // Initialize with seed data if no courses exist
  async onModuleInit() {
    const count = await this.coursesRepository.count();
    if (count === 0) {
      console.log('No courses found. Seeding initial courses...');
      await this.seedInitialCourses();
    }
  }

  // Seed initial courses
  private async seedInitialCourses() {
    const courses = [
      {
        title: 'Cognitive Behavioral Techniques',
        description: 'Learn about cognitive behavioral therapy techniques and applications.',
        instructor: 'Dr. Jane Smith',
        duration: '8 weeks',
        students: 0,
        imageUrl: '/images/cbt-course.jpg',
        syllabus: [
          {
            week: 1,
            topic: 'Introduction to CBT',
            description: 'History and core principles of cognitive behavioral therapy'
          },
          {
            week: 2,
            topic: 'Cognitive Restructuring',
            description: 'Identifying and challenging negative thought patterns'
          },
          {
            week: 3,
            topic: 'Behavioral Activation',
            description: 'Techniques to increase engagement in positive activities'
          }
        ],
        materials: [
          {
            id: 1,
            name: 'CBT Introduction',
            type: 'PDF',
            url: '/materials/cbt-intro.pdf'
          },
          {
            id: 2,
            name: 'Thought Record Template',
            type: 'DOCX',
            url: '/materials/thought-record.docx'
          }
        ]
      },
      {
        title: 'Neuroscience Fundamentals',
        description: 'A deep dive into brain structure, functions, and their impact on behavior.',
        instructor: 'Dr. Michael Johnson',
        duration: '10 weeks',
        students: 0,
        imageUrl: '/images/neuroscience-course.jpg',
        syllabus: [
          {
            week: 1,
            topic: 'Brain Anatomy',
            description: 'Structure and organization of the human brain'
          },
          {
            week: 2,
            topic: 'Neuronal Communication',
            description: 'Synapses, neurotransmitters, and signal propagation'
          },
          {
            week: 3,
            topic: 'Neuroplasticity',
            description: 'How the brain changes and adapts'
          }
        ],
        materials: [
          {
            id: 1,
            name: 'Brain Anatomy Overview',
            type: 'PDF',
            url: '/materials/brain-anatomy.pdf'
          },
          {
            id: 2,
            name: 'Neurotransmitter Reference',
            type: 'PDF',
            url: '/materials/neurotransmitters.pdf'
          }
        ]
      }
    ];

    for (const course of courses) {
      await this.coursesRepository.save(course);
    }
    
    console.log('Initial courses seeded successfully');
  }

  // Find all courses
  async findAll(): Promise<Course[]> {
    return this.coursesRepository.find();
  }

  // Find a single course by id
  async findOne(id: number): Promise<Course> {
    const course = await this.coursesRepository.findOneBy({ id });
    
    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }
    
    return course;
  }

  // Create a new course
  async create(courseData: Partial<Course>): Promise<Course> {
    const course = this.coursesRepository.create(courseData);
    return this.coursesRepository.save(course);
  }

  // Update an existing course
  async update(id: number, courseData: Partial<Course>): Promise<Course> {
    await this.findOne(id); // Will throw NotFoundException if not found
    await this.coursesRepository.update(id, courseData);
    
    const updatedCourse = await this.coursesRepository.findOneBy({ id });
    if (!updatedCourse) {
      throw new NotFoundException(`Course with ID "${id}" not found after update`);
    }
    
    return updatedCourse;
  }

  // Delete a course
  async remove(id: number): Promise<void> {
    await this.findOne(id); // Will throw NotFoundException if not found
    await this.coursesRepository.delete(id);
  }
} 