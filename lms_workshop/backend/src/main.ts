import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('Starting application...');
  
  try {
    // Log environment variables
    logger.log(`Environment variables: DB_HOST=${process.env.DB_HOST}, PORT=${process.env.PORT || '8080'}`);
    
    // Always set port to 8080 for DigitalOcean compatibility - override any PORT env var
    process.env.PORT = '8080';
    
    const app = await NestFactory.create(AppModule, {
      cors: true,  // Enable CORS at app creation
      logger: ['error', 'warn', 'log', 'debug', 'verbose'], // Enable all logs
    });
    
    // Enable CORS with more permissive settings
    app.enableCors({
      origin: true, // Allow all origins
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    
    // Register process termination handlers
    process.on('SIGINT', () => {
      logger.log('SIGINT received, shutting down gracefully');
      app.close().then(() => {
        logger.log('Application terminated');
        process.exit(0);
      });
    });
    
    process.on('SIGTERM', () => {
      logger.log('SIGTERM received, shutting down gracefully');
      app.close().then(() => {
        logger.log('Application terminated');
        process.exit(0);
      });
    });
    
    // Implement uncaught exception handler
    process.on('uncaughtException', (error) => {
      logger.error(`Uncaught exception: ${error.message}`, error.stack);
      // Keep the application running even if there's an uncaught exception
    });
    
    // Setup global validation pipe
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    
    // Setup Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('LMS Workshop API')
      .setDescription('API documentation for the LMS Workshop system')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    
    // Create default admin user in development mode
    logger.log('Checking for default admin user...');
    try {
      const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
      
      // Check if admin user exists
      const admin = await userRepository.findOne({ where: { email: 'admin@local.com' } });
      
      if (!admin) {
        logger.log('Creating default admin user for development...');
        const hashedPassword = await bcrypt.hash('password', 10);
        
        const newAdmin = userRepository.create({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@local.com',
          password: hashedPassword,
          isAdmin: true,
        });
        
        await userRepository.save(newAdmin);
        logger.log('Default admin user created successfully. Use email: admin@local.com, password: password');
      } else {
        logger.log('Default admin user already exists.');
      }
    } catch (error) {
      logger.error(`Error creating default admin user: ${error.message}`, error.stack);
      // Don't fail the app startup if admin user creation fails
      logger.log('Continuing application startup despite admin user creation failure');
    }
    
    // CRITICAL: Force port 8080 for DigitalOcean health checks
    const port = 8080;
    
    // Explicitly bind to 0.0.0.0 to ensure container networking works
    await app.listen(port, '0.0.0.0');
    
    logger.log(`⚡️ Application is running on: http://0.0.0.0:${port}`);
    logger.log(`⚡️ Application is also available at: http://localhost:${port}`);
    logger.log(`📚 Swagger documentation available at: http://localhost:${port}/api`);
    logger.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`💾 Database host: ${process.env.DB_HOST}`);
    logger.log(`🔌 Database connected successfully`);
  } catch (error) {
    logger.error(`❌ Failed to start application: ${error.message}`, error.stack);
    // Exit with error code
    process.exit(1);
  }
}

// Use a better error handler for the bootstrap process
bootstrap().catch(err => {
  console.error('💥 Unhandled bootstrap error:', err);
  process.exit(1);
});
