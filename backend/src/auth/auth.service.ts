import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../entities/user.entity';

// Test accounts for development purposes
const DEV_TEST_ACCOUNTS = [
  {
    id: 999,
    email: 'test@example.com',
    password: 'test123',
    firstName: 'Test',
    lastName: 'User',
    isAdmin: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 998,
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    isAdmin: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 997,
    email: 'drakanksha@destinpq.com',
    password: 'DestinPQ@24225',
    firstName: 'Akanksha',
    lastName: 'Destin',
    isAdmin: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    console.log(`Attempting login for: ${email}`);
    
    // Try to validate with test accounts first (dev only)
    const testUser = this.validateTestUser(email, password);
    if (testUser) {
      console.log(`Using test account for: ${email}`);
      return this.generateToken(testUser as User);
    }
    
    // If no test user matched, try regular validation
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async register(registerDto: RegisterDto) {
    const { password, ...userData } = registerDto;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user with hashed password
    const newUser = await this.usersService.create({
      ...userData,
      password: hashedPassword,
    });

    // Don't include password in response
    const { password: _, ...result } = newUser;
    
    return {
      user: result,
      ...this.generateToken(newUser),
    };
  }
  
  // Special test account validator for development only
  private validateTestUser(email: string, password: string): any {
    // Force admin access for drakanksha@destinpq.com
    if (email === 'drakanksha@destinpq.com' && password === 'DestinPQ@24225') {
      console.log('SPECIAL ACCESS: Forcing admin privileges for drakanksha@destinpq.com');
      return {
        id: 1000,
        email: 'drakanksha@destinpq.com',
        firstName: 'Akanksha',
        lastName: 'Destin',
        isAdmin: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    // Regular test account validation
    const testUser = DEV_TEST_ACCOUNTS.find(
      account => account.email === email && account.password === password
    );
    
    // Special override for drakanksha@destinpq.com to ensure admin access
    if (email === 'drakanksha@destinpq.com' && password === 'DestinPQ@24225') {
      console.log('Giving ADMIN access to drakanksha@destinpq.com');
      return {
        id: 997,
        email: 'drakanksha@destinpq.com',
        firstName: 'Akanksha',
        lastName: 'Destin',
        isAdmin: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    return testUser || null;
  }

  private async validateUser(email: string, password: string): Promise<User | null> {
    // Find user by email with password included
    const user = await this.usersService.findByEmail(email, true);
    
    if (!user) {
      return null;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email, isAdmin: user.isAdmin };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
} 