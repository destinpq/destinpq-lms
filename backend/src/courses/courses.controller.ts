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
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // Get all courses
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    try {
      return await this.coursesService.findAll();
    } catch (error) {
      throw new HttpException('Error fetching courses', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get course by ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.coursesService.findOne(+id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error fetching course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Create new course
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() courseData: Partial<Course>) {
    try {
      return await this.coursesService.create(courseData);
    } catch (error) {
      throw new HttpException('Error creating course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Update course
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() courseData: Partial<Course>
  ) {
    try {
      return await this.coursesService.update(+id, courseData);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error updating course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete course
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.coursesService.remove(+id);
      return { message: 'Course deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error deleting course', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 