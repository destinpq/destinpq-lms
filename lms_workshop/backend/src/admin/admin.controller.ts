import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Course } from '../entities/course.entity';
import { Module } from '../entities/module.entity';
import { Lesson } from '../entities/lesson.entity';
import { User } from '../entities/user.entity';
import { Workshop } from '../entities/workshop.entity';
import { Homework } from '../entities/homework.entity';
import { Achievement } from '../entities/achievement.entity';
import { Message } from '../entities/message.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Course Endpoints
  @Get('courses')
  async getAllCourses(): Promise<Course[]> {
    return this.adminService.getAllCourses();
  }

  @Get('courses/:id')
  async getCourseById(@Param('id', ParseIntPipe) id: number): Promise<Course> {
    return this.adminService.getCourseById(id);
  }

  @Post('courses')
  async createCourse(@Body(ValidationPipe) courseData: Partial<Course>): Promise<Course> {
    return this.adminService.createCourse(courseData);
  }

  @Put('courses/:id')
  async updateCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) courseData: Partial<Course>,
  ): Promise<Course> {
    return this.adminService.updateCourse(id, courseData);
  }

  @Delete('courses/:id')
  async deleteCourse(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.adminService.deleteCourse(id);
  }

  // Module Endpoints
  @Post('courses/:courseId/modules')
  async createModule(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body(ValidationPipe) moduleData: Partial<Module>,
  ): Promise<Module> {
    return this.adminService.createModule(courseId, moduleData);
  }

  @Put('modules/:id')
  async updateModule(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) moduleData: Partial<Module>,
  ): Promise<Module> {
    return this.adminService.updateModule(id, moduleData);
  }

  @Delete('modules/:id')
  async deleteModule(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.adminService.deleteModule(id);
  }

  // Lesson Endpoints
  @Post('modules/:moduleId/lessons')
  async createLesson(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Body(ValidationPipe) lessonData: Partial<Lesson>,
  ): Promise<Lesson> {
    return this.adminService.createLesson(moduleId, lessonData);
  }

  @Put('lessons/:id')
  async updateLesson(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) lessonData: Partial<Lesson>,
  ): Promise<Lesson> {
    return this.adminService.updateLesson(id, lessonData);
  }

  @Delete('lessons/:id')
  async deleteLesson(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.adminService.deleteLesson(id);
  }

  // Workshop Endpoints
  @Get('workshops')
  async getAllWorkshops(): Promise<Workshop[]> {
    return this.adminService.getAllWorkshops();
  }

  @Get('workshops/:id')
  async getWorkshopById(@Param('id', ParseIntPipe) id: number): Promise<Workshop> {
    return this.adminService.getWorkshopById(id);
  }

  @Post('workshops')
  async createWorkshop(@Body(ValidationPipe) workshopData: Partial<Workshop>): Promise<Workshop> {
    return this.adminService.createWorkshop(workshopData);
  }

  @Put('workshops/:id')
  async updateWorkshop(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) workshopData: Partial<Workshop>,
  ): Promise<Workshop> {
    return this.adminService.updateWorkshop(id, workshopData);
  }

  @Delete('workshops/:id')
  async deleteWorkshop(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.adminService.deleteWorkshop(id);
  }
  
  // Workshop participant management
  @Post('workshops/:id/participants')
  async addWorkshopParticipant(
    @Param('id', ParseIntPipe) workshopId: number,
    @Body('userId', ParseIntPipe) userId: number,
  ): Promise<Workshop> {
    return this.adminService.addWorkshopParticipant(workshopId, userId);
  }
  
  @Delete('workshops/:id/participants/:userId')
  async removeWorkshopParticipant(
    @Param('id', ParseIntPipe) workshopId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Workshop> {
    return this.adminService.removeWorkshopParticipant(workshopId, userId);
  }
  
  @Get('workshops/:id/participants')
  async getWorkshopParticipants(
    @Param('id', ParseIntPipe) workshopId: number,
  ): Promise<User[]> {
    return this.adminService.getWorkshopParticipants(workshopId);
  }

  // Homework Endpoints
  @Get('homework')
  async getAllHomework(): Promise<Homework[]> {
    return this.adminService.getAllHomework();
  }

  @Get('homework/:id')
  async getHomeworkById(@Param('id', ParseIntPipe) id: number): Promise<Homework> {
    return this.adminService.getHomeworkById(id);
  }

  @Post('homework')
  async createHomework(@Body(ValidationPipe) homeworkData: Partial<Homework>): Promise<Homework> {
    return this.adminService.createHomework(homeworkData);
  }

  @Put('homework/:id')
  async updateHomework(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) homeworkData: Partial<Homework>,
  ): Promise<Homework> {
    return this.adminService.updateHomework(id, homeworkData);
  }

  @Delete('homework/:id')
  async deleteHomework(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.adminService.deleteHomework(id);
  }

  // Achievement Endpoints
  @Get('achievements')
  async getAllAchievements(): Promise<Achievement[]> {
    return this.adminService.getAllAchievements();
  }

  @Get('achievements/:id')
  async getAchievementById(@Param('id', ParseIntPipe) id: number): Promise<Achievement> {
    return this.adminService.getAchievementById(id);
  }

  @Post('achievements')
  async createAchievement(@Body(ValidationPipe) achievementData: Partial<Achievement>): Promise<Achievement> {
    return this.adminService.createAchievement(achievementData);
  }

  @Put('achievements/:id')
  async updateAchievement(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) achievementData: Partial<Achievement>,
  ): Promise<Achievement> {
    return this.adminService.updateAchievement(id, achievementData);
  }

  @Delete('achievements/:id')
  async deleteAchievement(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.adminService.deleteAchievement(id);
  }

  // Message Endpoints
  @Get('messages')
  async getAllMessages(): Promise<Message[]> {
    return this.adminService.getAllMessages();
  }

  @Get('messages/:id')
  async getMessageById(@Param('id', ParseIntPipe) id: number): Promise<Message> {
    return this.adminService.getMessageById(id);
  }

  @Post('messages')
  async createMessage(@Body(ValidationPipe) messageData: Partial<Message>): Promise<Message> {
    return this.adminService.createMessage(messageData);
  }

  @Put('messages/:id')
  async updateMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) messageData: Partial<Message>,
  ): Promise<Message> {
    return this.adminService.updateMessage(id, messageData);
  }

  @Delete('messages/:id')
  async deleteMessage(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.adminService.deleteMessage(id);
  }

  // User Endpoints
  @Get('users')
  async getAllUsers(): Promise<User[]> {
    return this.adminService.getAllUsers();
  }

  @Put('users/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) userData: Partial<User>,
  ): Promise<User> {
    return this.adminService.updateUser(id, userData);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.adminService.deleteUser(id);
  }

  // Direct insert endpoint for debugging
  @Post('workshops/:id/force-add-participant')
  async forceAddWorkshopParticipant(
    @Param('id', ParseIntPipe) workshopId: number,
    @Body('userId', ParseIntPipe) userId: number,
  ): Promise<any> {
    return this.adminService.forceAddWorkshopParticipant(workshopId, userId);
  }
} 