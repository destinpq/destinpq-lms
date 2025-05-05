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
    const app = await NestFactory.create(AppModule);
    
    // Enable CORS with more permissive settings
    app.enableCors({
      origin: true, // Allow all origins
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
    }
    
    // Ensure we use port 8080 for DigitalOcean compatibility
    const port = process.env.PORT || 8080;
    
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Swagger documentation available at: http://localhost:${port}/api`);
    logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`Database host: ${process.env.DB_HOST}`);
  } catch (error) {
    logger.error(`Failed to start application: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap().catch(err => {
  console.error('Unhandled bootstrap error:', err);
  process.exit(1);
});
