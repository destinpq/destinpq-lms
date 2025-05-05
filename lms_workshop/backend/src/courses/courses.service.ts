import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async findAll(userId?: number): Promise<Course[]> {
    // If userId is provided, filter courses by student enrollment
    if (userId) {
      return this.findCoursesForStudent(userId);
    }
    
    // Otherwise return all courses
    return this.courseRepository.find({
      relations: ['modules'],
    });
  }

  async findCoursesForStudent(userId: number): Promise<Course[]> {
    // If userId is undefined or null, return empty array
    if (!userId) {
      return [];
    }

    return this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.modules', 'module')
      .innerJoinAndSelect('course.students', 'student')
      .where('student.id = :userId', { userId })
      .getMany();
  }

  async findOne(id: string): Promise<Course> {
    // If id is undefined or null, throw error
    if (!id) {
      throw new NotFoundException('Course ID cannot be undefined or null');
    }

    try {
      const course = await this.courseRepository.findOne({
        where: { id: parseInt(id) }, // Convert string ID to number
        relations: ['modules', 'modules.lessons'],
        order: {
          modules: {
            order: 'ASC',
            lessons: {
              order: 'ASC',
            },
          },
        },
      });

      if (!course) {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }

      console.log(`Fetched course ${id} with ${course.modules?.length || 0} modules and ${course.modules?.reduce((count, module) => count + (module.lessons?.length || 0), 0) || 0} total lessons`);
      
      return course;
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error);
      throw new NotFoundException(`Course with ID ${id} not found or invalid ID format`);
    }
  }

  async create(courseData: Partial<Course>): Promise<Course> {
    const course = this.courseRepository.create(courseData);
    return await this.courseRepository.save(course);
  }

  async update(id: string, courseData: Partial<Course>): Promise<Course> {
    const course = await this.findOne(id);
    
    // Update the course properties
    Object.assign(course, courseData);
    
    return await this.courseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
  }

  async enrollStudent(courseId: number, userId: number): Promise<Course> {
    // Handle undefined values
    if (!courseId || !userId) {
      throw new NotFoundException('Course ID and User ID must be provided');
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId }, // Use number directly
      relations: ['students'],
    });
    
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    
    // Initialize students array if it doesn't exist
    if (!course.students) {
      course.students = [];
    }
    
    // Check if student is already enrolled
    const studentExists = course.students.some(student => student.id === userId);
    
    if (!studentExists) {
      // Add the student
      course.students.push({ id: userId } as any);
      
      // Update enrolled student count
      course.enrolledStudents = (course.enrolledStudents || 0) + 1;
      
      return this.courseRepository.save(course);
    }
    
    return course;
  }
} 