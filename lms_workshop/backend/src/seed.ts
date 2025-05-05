import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const usersService = app.get(UsersService);
  
  try {
    // Check if admin user already exists
    const existingAdmin = await usersService.findByEmail('drakanksha@destinpq.com');
    
    if (!existingAdmin) {
      console.log('Creating admin user...');
      
      const hashedPassword = await bcrypt.hash('DestinPQ@24225', 10);
      
      const adminUser = await usersService.create({
        firstName: 'Drakanksha',
        lastName: 'User',
        email: 'drakanksha@destinpq.com',
        password: hashedPassword,
        isAdmin: true
      });
      
      console.log('Admin user created:', adminUser.email);
    } else {
      console.log('Admin user already exists, skipping creation');
    }
    
    // Check if student user already exists
    const existingStudent = await usersService.findByEmail('student@example.com');
    
    if (!existingStudent) {
      console.log('Creating student user...');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const studentUser = await usersService.create({
        firstName: 'Test',
        lastName: 'Student',
        email: 'student@example.com',
        password: hashedPassword,
        isAdmin: false
      });
      
      console.log('Student user created:', studentUser.email);
    } else {
      console.log('Student user already exists, skipping creation');
    }
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 