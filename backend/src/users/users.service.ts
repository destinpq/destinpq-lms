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
    console.log(`[UsersService] Finding user by email: ${email}, IncludePassword: ${includePassword}`);
    
    let user: User | null = null;
    try {
      const query = this.usersRepository
        .createQueryBuilder('user')
        .where('TRIM(LOWER(user.email)) = TRIM(LOWER(:email))', { email });

      if (includePassword) {
        query.addSelect('user.password');
      }
      
      // Log the generated SQL and parameters
      try {
        const sqlAndParams = query.getQueryAndParameters();
        console.log(`[UsersService] Executing SQL: ${sqlAndParams[0]}, Parameters: ${JSON.stringify(sqlAndParams[1])}`);
      } catch (e) {
        console.warn('[UsersService] Could not get SQL query and parameters for logging:', e);
      }

      user = await query.getOne();
      
      if (!user) {
        console.log(`[UsersService] Query for ${email} (IncludePassword: ${includePassword}) executed but returned no user from database.`);
      }
      console.log(`[UsersService] Result for ${email} (IncludePassword: ${includePassword}). Found: ${!!user}${user ? ' (ID: ' + user.id + ')' : ''}`);
      return user;
    } catch (error) {
      console.error(`[UsersService] CRITICAL ERROR during findByEmail for ${email}:`, error);
      // Log the error object itself for more details if it's not a simple string
      if (typeof error === 'object' && error !== null) {
        console.error('[UsersService] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      }
      throw error;
    }
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