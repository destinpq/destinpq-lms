import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { Homework, HomeworkStatus } from '../entities/homework.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() createHomeworkDto: Partial<Homework>): Promise<Homework> {
    return this.homeworkService.create(createHomeworkDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll(): Promise<Homework[]> {
    return this.homeworkService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(@Request() req): Promise<Homework[]> {
    const userId = req.user.userId;
    
    // Validate userId
    if (!userId || isNaN(userId) || userId <= 0) {
      throw new BadRequestException(`Invalid user ID: ${userId}`);
    }
    
    return this.homeworkService.findAllForStudent(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine/pending')
  findPending(@Request() req): Promise<Homework[]> {
    const userId = req.user.userId;
    
    // Validate userId
    if (!userId || isNaN(userId) || userId <= 0) {
      throw new BadRequestException(`Invalid user ID: ${userId}`);
    }
    
    return this.homeworkService.findPendingForStudent(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Homework> {
    return this.homeworkService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateHomeworkDto: Partial<Homework>,
  ): Promise<Homework> {
    return this.homeworkService.update(+id, updateHomeworkDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.homeworkService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: HomeworkStatus,
  ): Promise<Homework> {
    return this.homeworkService.updateStatus(+id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/submit')
  submitHomework(
    @Param('id') id: string,
    @Body('response') studentResponse: string,
  ): Promise<Homework> {
    return this.homeworkService.submitHomework(+id, studentResponse);
  }
} 