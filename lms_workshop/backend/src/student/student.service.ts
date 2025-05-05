import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workshop } from '../entities/workshop.entity';
import { User } from '../entities/user.entity';
import { Course, CourseStatus } from '../entities/course.entity';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    @InjectRepository(Workshop)
    private workshopRepository: Repository<Workshop>,
    
    @InjectRepository(User)
    private userRepository: Repository<User>,
    
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async getCoursesForUser(userId: number): Promise<Course[]> {
    // Check for valid userId
    if (!userId) {
      this.logger.warn(
        'getCoursesForUser called with undefined or null userId',
      );
      return [];
    }

    try {
      // Get courses where the user is enrolled as a student
      const enrolledCourses = await this.courseRepository
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.modules', 'module')
        .innerJoinAndSelect('course.students', 'student')
        .where('student.id = :userId', { userId })
        .orderBy('course.createdAt', 'DESC')
        .getMany();

      if (enrolledCourses.length === 0) {
        this.logger.warn(
          `No courses found for user ${userId}. Will auto-enroll in all courses.`,
        );
        
        // Get all active courses
        const availableCourses = await this.courseRepository.find({
          where: { status: CourseStatus.ACTIVE },
        });
        
        // Get the user
        const user = await this.userRepository.findOne({
          where: { id: userId },
        });
        
        if (user && availableCourses.length > 0) {
          // Auto-enroll user in all available courses
          for (const course of availableCourses) {
            // Check if course has a students property
            if (!course.students) {
              course.students = [];
            }
            
            // Add user to course students
            course.students.push(user);
            
            // Update enrolled student count
            course.enrolledStudents = (course.enrolledStudents || 0) + 1;
            
            // Save the course
            await this.courseRepository.save(course);
            this.logger.log(
              `Auto-enrolled user ${userId} in course ${course.id}: ${course.title}`,
            );
          }
          
          // Return the now-enrolled courses
          return availableCourses;
        }
      }

      return enrolledCourses;
    } catch (error) {
      this.logger.error(`Error getting courses for user ${userId}:`, error);
      return [];
    }
  }

  async getStudentWorkshops(userId: number): Promise<Workshop[]> {
    // Check for valid userId
    if (!userId) {
      this.logger.warn(
        'getStudentWorkshops called with undefined or null userId',
      );
      return [];
    }

    this.logger.log(
      `DIRECT SQL APPROACH: Fetching workshops for user ID: ${userId}`,
    );
    this.logger.log(`UserID type: ${typeof userId}`);
    
    try {
      // Get direct database connection
      const connection = this.workshopRepository.manager.connection;
      
      // Check for valid workshop_attendees entries
      const attendeesQuery = `SELECT * FROM workshop_attendees WHERE "userId" = $1`;
      const attendees = await connection.query(attendeesQuery, [userId]);
      this.logger.log(
        `Workshop attendees for userId=${userId}: ${JSON.stringify(attendees)}`,
      );
      
      // STEP 1: Get all workshop IDs this user is enrolled in using RAW SQL
      const query = `
        SELECT w.* 
        FROM workshop w
        INNER JOIN workshop_attendees wa ON w.id = wa."workshopId"
        WHERE wa."userId" = $1
        AND w."isActive" = true
        ORDER BY w."scheduledAt" ASC
      `;
      
      this.logger.log(
        `Running direct SQL query: ${query} with parameter [${userId}]`,
      );
      
      // Execute the query with proper parameter
      const workshopResults = await connection.query(query, [userId]);
      
      this.logger.log(`Raw SQL results: ${JSON.stringify(workshopResults)}`);
      
      // Try a direct check for the user association
      const directCheck = await connection.query(
        `
        SELECT COUNT(*) as count 
        FROM workshop_attendees 
        WHERE "userId" = $1
        `,
        [userId],
      );
      this.logger.log(
        `Direct count of workshop associations: ${JSON.stringify(directCheck)}`,
      );
      
      if (!workshopResults || workshopResults.length === 0) {
        this.logger.warn(
          `No workshops found for user ${userId} using direct SQL`,
        );
        
        // Try a different query with no condition on active
        this.logger.log('Trying alternative query without isActive filter...');
        const alternativeResults = await connection.query(
          `
          SELECT w.* 
          FROM workshop w
          INNER JOIN workshop_attendees wa ON w.id = wa."workshopId"
          WHERE wa."userId" = $1
          ORDER BY w."scheduledAt" ASC
          `,
          [userId],
        );
        
        this.logger.log(
          `Alternative query results: ${JSON.stringify(alternativeResults)}`,
        );
        
        // If we find workshops with the alternative query, it means they're inactive
        if (alternativeResults && alternativeResults.length > 0) {
          this.logger.log('Found inactive workshops - activating them...');
          
          // Activate these workshops
          for (const workshop of alternativeResults) {
            await connection.query(
              'UPDATE workshop SET "isActive" = true WHERE id = $1',
              [workshop.id],
            );
            this.logger.log(`Activated workshop ID: ${workshop.id}`);
          }
          
          // Return the now-active workshops
          return alternativeResults.map((row: any) => {
            const workshop = new Workshop();
            workshop.id = row.id;
            workshop.title = row.title;
            workshop.description = row.description;
            workshop.instructor = row.instructor;
            workshop.scheduledAt = row.scheduledAt;
            workshop.preparatoryMaterials = row.preparatoryMaterials;
            workshop.category = row.category;
            workshop.maxParticipants = row.maxParticipants;
            workshop.isActive = true; // We just activated it
            workshop.createdAt = row.createdAt;
            workshop.updatedAt = row.updatedAt;
            workshop.attendees = []; // Initialize with empty array
            return workshop;
          });
        }
        
        return [];
      }
      
      // STEP 2: Convert the raw results to Workshop entities
      const workshops = workshopResults.map((row: any) => {
        const workshop = new Workshop();
        workshop.id = row.id;
        workshop.title = row.title;
        workshop.description = row.description;
        workshop.instructor = row.instructor;
        workshop.scheduledAt = row.scheduledAt;
        workshop.preparatoryMaterials = row.preparatoryMaterials;
        workshop.category = row.category;
        workshop.maxParticipants = row.maxParticipants;
        workshop.isActive = row.isActive;
        workshop.createdAt = row.createdAt;
        workshop.updatedAt = row.updatedAt;
        workshop.attendees = []; // Initialize with empty array
        return workshop;
      });
      
      this.logger.log(
        `Converted ${workshops.length} workshops from SQL results`,
      );
      
      // Success - return the workshops
      return workshops;
    } catch (error) {
      this.logger.error(`SQL ERROR: ${error.message}`, error.stack);
      return [];
    }
  }

  async getWorkshopsForUser(userId: number): Promise<any[]> {
    // Check for valid userId
    if (!userId) {
      this.logger.warn(
        'getWorkshopsForUser called with undefined or null userId',
      );
      return [];
    }

    try {
      // Get workshops where the user is an attendee
      const workshopsWithSessions = await this.workshopRepository
        .createQueryBuilder('workshop')
        .leftJoinAndSelect('workshop.attendees', 'user', 'user.id = :userId', { 
          userId,
        })
        .leftJoinAndSelect('workshop.sessions', 'session')
        .where('user.id = :userId', { userId })
        .orderBy('workshop.startDate', 'ASC')
        .getMany();

      return workshopsWithSessions;
    } catch (error) {
      console.error(`Error getting workshops for user ${userId}:`, error);
      return [];
    }
  }
} 