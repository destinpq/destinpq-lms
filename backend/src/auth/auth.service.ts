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
    const payload = { sub: user.id, email: user.email };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
} 