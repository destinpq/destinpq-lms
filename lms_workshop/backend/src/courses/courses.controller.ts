import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ValidationPipe, Query, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Course } from '../entities/course.entity';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req, @Query('enrolled') enrolled: string) {
    // If enrolled=true is specified, filter courses by current user
    let courses;
    if (enrolled === 'true' && req.user) {
      courses = await this.coursesService.findAll(req.user.id);
    } else {
      courses = await this.coursesService.findAll();
    }

    // Transform courses for frontend if student view (enrolled=true)
    if (enrolled === 'true') {
      return courses.map(course => ({
        id: course.id,
        title: course.title,
        instructor: course.instructor,
        image: course.coverImage || 'https://via.placeholder.com/150?text=Course',
        duration: `${course.totalWeeks || 4} weeks`,
        students: course.enrolledStudents || 0,
        modules: course.totalModules || course.modules?.length || 0,
        progress: 0, // Could be calculated from student progress if tracked
        status: course.status
      }));
    }
    
    return courses;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body(new ValidationPipe({ transform: true })) createCourseDto: Partial<Course>) {
    console.log('Creating course with data:', createCourseDto);
    return this.coursesService.create(createCourseDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  update(
    @Param('id') id: string, 
    @Body(new ValidationPipe({ transform: true })) updateCourseDto: Partial<Course>
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/enroll')
  enrollStudent(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.coursesService.enrollStudent(Number(id), userId);
  }
} 