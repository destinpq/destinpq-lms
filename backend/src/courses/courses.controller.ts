import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from '../entities/course.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // Get all courses
  @Get()
  async findAll() {
    try {
      return await this.coursesService.findAll();
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      throw new HttpException(
        error.message || 'Error fetching courses', 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get course by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const course = await this.coursesService.findOne(+id);
      return course;
    } catch (error: any) {
      console.error(`Error fetching course ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Error fetching course', 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Create new course
  @Post()
  async create(@Body() courseData: Partial<Course>) {
    try {
      return await this.coursesService.create(courseData);
    } catch (error: any) {
      console.error('Error creating course:', error);
      throw new HttpException(
        error.message || 'Error creating course', 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Update course
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() courseData: Partial<Course>
  ) {
    try {
      return await this.coursesService.update(+id, courseData);
    } catch (error: any) {
      console.error(`Error updating course ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Error updating course', 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Delete course
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.coursesService.remove(+id);
      return { message: 'Course deleted successfully' };
    } catch (error: any) {
      console.error(`Error deleting course ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Error deleting course', 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 