import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CoursesService } from '../courses/courses.service';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Course } from '../entities/course.entity';
import { Repository, DataSource } from 'typeorm';

/**
 * This script enrolls students in courses
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/enroll-students.ts
 */
async function bootstrap() {
  // Create a NestJS application context
  const app = await NestFactory.createApplicationContext(AppModule);
  const coursesService = app.get(CoursesService);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const courseRepository = app.get<Repository<Course>>(getRepositoryToken(Course));
  const dataSource = app.get<DataSource>(getDataSourceToken());
  
  try {
    console.log('Starting student course enrollment...');
    
    // First, create the course_students table if it doesn't exist
    console.log('Ensuring course_students table exists...');
    try {
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS course_students (
          "courseId" integer NOT NULL REFERENCES course(id) ON DELETE CASCADE,
          "userId" integer NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
          PRIMARY KEY ("courseId", "userId")
        )
      `);
      console.log('Table course_students created or already exists');
    } catch (error) {
      console.error('Error creating course_students table:', error);
      process.exit(1);
    }
    
    // Get all non-admin users (students)
    const students = await userRepository.find({
      where: { isAdmin: false },
      select: ['id', 'email', 'firstName', 'lastName']
    });
    console.log(`Found ${students.length} students`);
    
    // Get all courses
    const courses = await courseRepository.find({
      select: ['id', 'title']
    });
    console.log(`Found ${courses.length} courses`);
    
    // Enroll each student in each course
    for (const student of students) {
      console.log(`Processing student ${student.email}...`);
      
      for (const course of courses) {
        try {
          // Use the service to enroll the student
          await coursesService.enrollStudent(course.id, student.id);
          console.log(`Enrolled student ${student.email} in course "${course.title}"`);
        } catch (error) {
          console.error(`Error enrolling student ${student.email} in course "${course.title}":`, error.message);
        }
      }
    }
    
    console.log('Student course enrollment complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 