import {
  Controller,
  Get,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Workshop } from '../entities/workshop.entity';
import { StudentService } from './student.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Course } from '../entities/course.entity';

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  private readonly logger = new Logger(StudentController.name);

  constructor(
    private readonly studentService: StudentService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get('courses')
  async getCoursesForUser(@Request() req) {
    const userId = req.user.id;
    const courses = await this.studentService.getCoursesForUser(userId);
    
    // Format courses for the frontend
    return courses.map(course => ({
      id: course.id,
      title: course.title,
      instructor: course.instructor,
      image: course.coverImage || 'https://via.placeholder.com/150?text=Course',
      duration: `${course.totalWeeks || 4} weeks`,
      students: course.enrolledStudents || 0,
      modules: course.totalModules || course.modules?.length || 0,
      progress: 0, // Default to 0 progress for now
      status: course.status
    }));
  }

  @Get('course-sessions')
  async getCourseSessions(@Request() req) {
    const userId = req.user.id;
    const courses = await this.studentService.getCoursesForUser(userId);
    
    if (!courses || courses.length === 0) {
      return [];
    }
    
    // Create one realistic session per course today at 4:00 PM
    const now = new Date();
    const todayAt4PM = new Date();
    todayAt4PM.setHours(16, 0, 0, 0); // 4:00 PM today
    
    // Properly type the array to avoid TypeScript errors
    const courseSessions: Array<{
      id: number;
      title: string;
      courseTitle: string;
      scheduledAt: Date;
      instructor: string;
      link: string;
      isMock: boolean;
    }> = [];
    
    courses.forEach(course => {
      courseSessions.push({
        id: course.id,
        title: course.title,
        courseTitle: course.title,
        scheduledAt: todayAt4PM,
        instructor: course.instructor,
        link: `/course/${course.id}`,
        isMock: false
      });
    });
    
    return courseSessions;
  }

  @Get('workshops')
  async getWorkshopsForUser(@Request() req) {
    const userId = req.user.id;
    let workshops = await this.studentService.getWorkshopsForUser(userId);
    
    // Add mock data if there are no workshops or no sessions
    if (workshops.length === 0 || workshops.every(w => !w.sessions || w.sessions.length === 0)) {
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(now.getMonth() + 1);
      
      const mockWorkshop = {
        id: 999,
        title: 'Test',
        description: 'This is a test workshop',
        instructor: 'Akanksha',
        startDate: now,
        endDate: nextMonth,
        durationWeeks: 4,
        scheduledAt: now,
        // Add sessions
        sessions: [
          {
            id: 101,
            title: 'Introduction to Psychology',
            workshopId: 999,
            scheduledAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            durationMinutes: 60,
            isRecorded: true,
            meetingUrl: 'https://meet.jit.si/LMS-Psychology-Intro-101'
          },
          {
            id: 102,
            title: 'Psychology Research Methods',
            workshopId: 999,
            scheduledAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
            durationMinutes: 90,
            isRecorded: true,
            meetingUrl: 'https://meet.jit.si/LMS-Psychology-Research-102'
          },
          {
            id: 103,
            title: 'Cognitive Psychology',
            workshopId: 999,
            scheduledAt: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
            durationMinutes: 75,
            isRecorded: true,
            meetingUrl: 'https://meet.jit.si/LMS-Psychology-Cognitive-103'
          }
        ]
      };
      
      // Add the mock data
      if (workshops.length === 0) {
        workshops = [mockWorkshop];
      } else {
        // Add sessions to existing workshops
        workshops.forEach(workshop => {
          if (!workshop.sessions || workshop.sessions.length === 0) {
            workshop.sessions = mockWorkshop.sessions.map(session => ({
              ...session,
              workshopId: workshop.id,
              meetingUrl: `https://meet.jit.si/LMS-${workshop.title.replace(/\s+/g, '-')}-${session.id}`
            }));
          }
        });
      }
    }
    
    return workshops;
  }
} 