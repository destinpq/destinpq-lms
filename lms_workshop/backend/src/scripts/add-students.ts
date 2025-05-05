import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  
  const password = 'DestinPQ@24225';
  
  const students = [
    {
      firstName: 'Pratik',
      lastName: 'Khanapurkar',
      email: 'khanapurkarpratik@gmail.com',
      phone: '07719987999',
    },
    {
      firstName: 'Unnati',
      lastName: 'Mittal',
      email: 'ump52911@gmail.com',
      phone: '9100979798',
    },
    {
      firstName: 'Itee',
      lastName: 'Vijayvargi',
      email: 'iteevijayvargi@gmail.com',
      phone: '9059750543',
    },
    {
      firstName: 'Dhriti',
      lastName: 'Vijaywargi',
      email: 'dhritivijay810@gmail.com',
      phone: '9010005676',
    },
    {
      firstName: 'K Tarini',
      lastName: 'Sesha Sai',
      email: 'tarinifire@gmail.com',
      phone: '80089 12641',
    },
    {
      firstName: 'Mylapalli Rani',
      lastName: 'Dhanya Roopa',
      email: 'mrd.roopa15288@gmail.com',
      phone: '9885308170',
    },
    {
      firstName: 'Aleeza',
      lastName: 'Parpiya',
      email: 'aleezaparpiya@gmail.com',
      phone: '7083045739',
    },
    {
      firstName: 'Akanksha',
      lastName: 'Dhanraj',
      email: 'akankshadhanraj14@gmail.com',
      phone: '8977905022',
    },
    {
      firstName: 'S',
      lastName: 'Khushi',
      email: 'skhushiredwal@gmail.com',
      phone: '6281136323',
    },
  ];

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Register each student
  for (const student of students) {
    try {
      // Check if user already exists
      const existingUser = await usersService.findByEmail(student.email);
      
      if (existingUser) {
        console.log(`User with email ${student.email} already exists, skipping`);
        continue;
      }
      
      // Create the user with hashed password
      const userData = {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        password: hashedPassword,
        isAdmin: false,
      };
      
      const newUser = await usersService.create(userData);
      console.log(`Created student: ${student.firstName} ${student.lastName} (${student.email})`);
    } catch (error) {
      console.error(`Error creating student ${student.email}:`, error.message);
    }
  }

  console.log('Student registration process completed');
  await app.close();
}

bootstrap(); 