import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with more permissive settings
  app.enableCors({
    origin: true, // Allow all origins, or you can specify: ['http://localhost:4000', 'http://localhost:3000', 'https://your-frontend-domain.com']
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
  if (process.env.NODE_ENV !== 'production') {
    try {
      const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
      
      // Check if admin user exists
      const admin = await userRepository.findOne({ where: { email: 'admin@local.com' } });
      
      if (!admin) {
        console.log('Creating default admin user for development...');
        const hashedPassword = await bcrypt.hash('password', 10);
        
        const newAdmin = userRepository.create({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@local.com',
          password: hashedPassword,
          isAdmin: true,
        });
        
        await userRepository.save(newAdmin);
        console.log('Default admin user created successfully. Use email: admin@local.com, password: password');
      } else {
        console.log('Default admin user already exists.');
      }
    } catch (error) {
      console.error('Error creating default admin user:', error);
    }
  }
  
  // Get port from environment variable or use default 4001
  const port = process.env.PORT || 4001;
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api`);
}
bootstrap();
