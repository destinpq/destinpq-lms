import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Course } from '../entities/course.entity';
import { Module as CourseModule } from '../entities/module.entity';
import { Lesson } from '../entities/lesson.entity';
import { User } from '../entities/user.entity';
import { Workshop } from '../entities/workshop.entity';
import { Homework } from '../entities/homework.entity';
import { Achievement } from '../entities/achievement.entity';
import { Message } from '../entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, CourseModule, Lesson, User, Workshop, Homework, Achievement, Message]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {} 