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
import { Logger } from '@nestjs/common';

// Create a logger for database connection
const logger = new Logger('Database');

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
  // Always create tables in development mode
  synchronize: true,
  // SSL configuration
  ssl: process.env.DB_SSLMODE === 'require' ? {
    rejectUnauthorized: false
  } : false,
  extra: {
    // Additional SSL options
    ssl: process.env.DB_SSLMODE === 'require' ? {
      rejectUnauthorized: false,
      ca: null,
      checkServerIdentity: () => undefined
    } : undefined,
    // Add connection timeouts
    connectTimeout: 30000, // 30 seconds
    idleTimeoutMillis: 30000, // 30 seconds
    query_timeout: 30000 // 30 seconds
  },
  // Retry configuration for connection failures
  retryAttempts: 10, // Increased from 5
  retryDelay: 5000, // Increased from 3000
  // Auto-load entities for easier development
  autoLoadEntities: true,
  // Enable logging
  logging: true,
  logger: {
    log: (level, message) => {
      logger.log(`[${level}] ${message}`);
    },
    logQuery: (query, parameters) => {
      if (process.env.NODE_ENV !== 'production') {
        logger.debug(`Query: ${query} -- Parameters: ${parameters}`);
      }
    },
    logQueryError: (error, query, parameters) => {
      logger.error(`Query error: ${error} -- Query: ${query} -- Parameters: ${parameters}`);
    },
    logQuerySlow: (time, query, parameters) => {
      logger.warn(`Slow query (${time}ms): ${query} -- Parameters: ${parameters}`);
    },
    logSchemaBuild: (message) => {
      logger.log(`Schema build: ${message}`);
    },
    logMigration: (message) => {
      logger.log(`Migration: ${message}`);
    },
  }
}; 