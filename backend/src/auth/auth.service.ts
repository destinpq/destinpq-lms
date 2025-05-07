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

  private async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    console.log(`[AuthService.validateUser] Validating: ${email}`);
    const user = await this.usersService.findByEmail(email, true);
    
    if (!user) {
      console.log(`[AuthService.validateUser] User not found: ${email}`);
      return null;
    }
    if (!user.password) {
        console.log(`[AuthService.validateUser] User ${email} has no password in DB.`);
        return null;
    }

    const passwordMatches = await bcrypt.compare(pass, user.password);
    if (passwordMatches) {
      console.log(`[AuthService.validateUser] Password for ${email} matches.`);
      const { password, ...result } = user;
      return result;
    }
    console.log(`[AuthService.validateUser] Password for ${email} does NOT match.`);
    return null;
  }

  private generateToken(user: Omit<User, 'password'>) {
    console.log(`[AuthService.generateToken] Generating token with payload for user.id: ${user.id}, email: ${user.email}, isAdmin: ${user.isAdmin}`);
    const payload = { sub: user.id, email: user.email, isAdmin: user.isAdmin };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    console.log(`[AuthService.login] Attempting login for: ${loginDto.email}`);
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      console.log(`[AuthService.login] Authentication failed for ${loginDto.email}.`);
      throw new UnauthorizedException('Invalid credentials');
    }
    
    console.log(`[AuthService.login] User ${loginDto.email} authenticated. ID: ${user.id}. Generating token.`);
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
      ...this.generateToken(result),
    };
  }
}

// Ensure no other hardcoded user data or test account logic remains in this file.
   