import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Course } from '../entities/course.entity';
import { Module } from '../entities/module.entity';
import { Homework } from '../entities/homework.entity';
import { Lesson } from '../entities/lesson.entity';
import { Workshop } from '../entities/workshop.entity';
import { WorkshopSession } from '../entities/workshop-session.entity';
import { Achievement } from '../entities/achievement.entity';
import { Message } from '../entities/message.entity';
import { HomeworkQuestion } from '../entities/homework-question.entity';
import { HomeworkResponse } from '../entities/homework-response.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'tiger',
  database: process.env.DB_DATABASE || 'psychology_lms',
  entities: [
    User, 
    Course, 
    Module, 
    Homework, 
    Lesson, 
    Workshop, 
    WorkshopSession, 
    Achievement, 
    Message,
    HomeworkQuestion,
    HomeworkResponse
  ],
  synchronize: process.env.NODE_ENV !== 'production',
}; 