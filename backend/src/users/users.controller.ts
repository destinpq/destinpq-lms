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

  // Get current user profile - development version
  @Get('profile/me')
  async getUserProfile() {
    try {
      // For development, return the mock user profile
      console.log('Returning mock user profile for development');
      return MOCK_USER_PROFILE;
    } catch (error) {
      throw new HttpException('Failed to get user profile', HttpStatus.INTERNAL_SERVER_ERROR);
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