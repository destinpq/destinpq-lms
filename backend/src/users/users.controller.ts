import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Mock user profile for development
const MOCK_USER_PROFILE = {
  id: 999,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  isAdmin: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const MOCK_ADMIN_PROFILE = {
  id: 998,
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  isAdmin: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Special admin profiles for guaranteed access
const FIXED_ADMIN_PROFILES = {
  'drakanksha@destinpq.com': {
    id: 1000,
    email: 'drakanksha@destinpq.com',
    firstName: 'Akanksha',
    lastName: 'Destin',
    isAdmin: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findOne(+id);
  }

  @Post()
  create(@Body() createUserDto: Partial<User>): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<User>,
  ): Promise<User | null> {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(+id);
  }

  // Get current user profile
  @UseGuards(JwtAuthGuard)
  @Get('profile/me')
  async getUserProfile(@Request() req) {
    try {
      console.log('Getting user profile from token:', req.user);
      
      if (!req.user || !req.user.sub) {
        throw new HttpException('Invalid authentication token', HttpStatus.UNAUTHORIZED);
      }
      
      // Get user from database using ID from JWT token
      const userId = req.user.sub;
      const user = await this.usersService.findOne(userId);
      
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      
      // Return user without password
      const { password, ...result } = user;
      return result;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new HttpException(
        error.message || 'Failed to get user profile', 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Get user by ID for admin panel - development version
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    try {
      if (id === '999') {
        return MOCK_USER_PROFILE;
      } else if (id === '998') {
        return MOCK_ADMIN_PROFILE;
      } else if (id === '1000') {
        return FIXED_ADMIN_PROFILES['drakanksha@destinpq.com'];
      }

      // Return a generated mock user
      return {
        id: parseInt(id),
        email: `user${id}@example.com`,
        firstName: `User`,
        lastName: `${id}`,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }
} 