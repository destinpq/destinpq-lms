import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    console.log(`Attempting login for: ${email}`);
    
    // ONLY use database validation
    const user = await this.validateUser(email, password);

    if (!user) {
      console.log(`Authentication failed for ${email}: Invalid credentials or user not found.`);
      throw new UnauthorizedException('Invalid credentials');
    }
    
    console.log(`User ${email} authenticated successfully via database. ID: ${user.id}`);
    return this.generateToken(user);
  }

  async register(registerDto: RegisterDto) {
    const { password, ...userData } = registerDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.usersService.create({
      ...userData,
      password: hashedPassword,
    });

    const { password: _, ...result } = newUser;
    
    return {
      user: result,
      ...this.generateToken(newUser),
    };
  }

  private async validateUser(email: string, password: string): Promise<User | null> {
    console.log(`[AuthService] Attempting to validate user: ${email}. Requesting user details from UsersService.`);
    const user = await this.usersService.findByEmail(email, true);
    
    if (!user) {
      console.log(`[AuthService] UsersService did not find user with email ${email}. Cannot proceed with password validation.`);
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log(`Invalid password for user ${email}.`);
      return null;
    }
    
    console.log(`Password valid for ${email}.`);
    return user;
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email, isAdmin: user.isAdmin };
    console.log(`Generating token for user ${user.email} (ID: ${user.id}, Admin: ${user.isAdmin})`);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

// Ensure no other hardcoded user data or test account logic remains in this file.
   