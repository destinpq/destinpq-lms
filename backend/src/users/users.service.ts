import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    // Seed admin user on application startup
    await this.seedAdminUser();
    await this.seedTestUser();
  }

  async seedAdminUser() {
    const adminEmail = 'admin@example.com';
    const existingAdmin = await this.findByEmail(adminEmail);
    
    if (!existingAdmin) {
      console.log('No admin user found. Creating default admin account...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = this.usersRepository.create({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
      });
      
      await this.usersRepository.save(adminUser);
      console.log('Admin user created successfully!');
    }
  }

  async seedTestUser() {
    const testEmail = 'test@example.com';
    const existingTestUser = await this.findByEmail(testEmail);
    
    if (!existingTestUser) {
      console.log('No test user found. Creating test account...');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const testUser = this.usersRepository.create({
        firstName: 'Test',
        lastName: 'User',
        email: testEmail,
        password: hashedPassword,
        isAdmin: false,
      });
      
      await this.usersRepository.save(testUser);
      console.log('Test user created successfully!');
    }
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async findByEmail(email: string, includePassword: boolean = false): Promise<User | null> {
    if (includePassword) {
      return this.usersRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.email = :email', { email })
        .getOne();
    }
    
    return this.usersRepository.findOneBy({ email });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
} 