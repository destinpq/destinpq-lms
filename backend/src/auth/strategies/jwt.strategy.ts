import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

// These should match the test accounts in auth.service.ts
const TEST_USERS = [
  {
    id: 999,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    isAdmin: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 998,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    isAdmin: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: any) {
    console.log('Validating JWT payload:', payload);

    // Check for test users first
    if (payload.sub === 999 || payload.sub === 998) {
      const testUser = TEST_USERS.find(user => user.id === payload.sub);
      console.log('Using test user for validation:', testUser?.email);
      return testUser;
    }
    
    // For regular users, get from database
    const user = await this.usersService.findOne(payload.sub);
    
    if (!user) {
      console.log('User not found in database with id:', payload.sub);
      throw new UnauthorizedException();
    }
    
    // Remove sensitive data
    const { password, ...result } = user;
    
    return result;
  }
} 