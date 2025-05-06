import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Workshop } from '../entities/workshop.entity';
import { Course } from '../entities/course.entity';

// Function to parse the DATABASE_URL from Heroku
function parseDbUrl(): TypeOrmModuleOptions {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    // Format: postgres://username:password@host:port/database
    const matches = databaseUrl.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (matches) {
      const [, username, password, host, port, database] = matches;
      return {
        type: 'postgres',
        host,
        port: parseInt(port, 10),
        username,
        password,
        database,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        entities: [User, Workshop, Course],
        synchronize: process.env.NODE_ENV !== 'production',
        dropSchema: process.env.NODE_ENV !== 'production' && process.env.DROP_SCHEMA === 'true', // Only drop in dev with explicit flag
      };
    }
  }
  
  // Fallback to direct configuration if URL parsing fails
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'tiger',
    database: process.env.DB_NAME || 'task_tracker_v3',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    entities: [User, Workshop, Course],
    synchronize: process.env.NODE_ENV !== 'production',
    dropSchema: process.env.NODE_ENV !== 'production' && process.env.DROP_SCHEMA === 'true', // Only drop in dev with explicit flag
  };
}

export const typeOrmConfig: TypeOrmModuleOptions = parseDbUrl(); 