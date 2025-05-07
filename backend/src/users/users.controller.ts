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

@Controller('users')
@UseGuards(JwtAuthGuard) // Global guard for all user endpoints
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get all users
  @Get()
  async findAll(): Promise<User[]> {
    try {
      return await this.usersService.findAll();
    } catch (error: any) {
      console.error('Error fetching all users:', error);
      throw new HttpException(
        error.message || 'Failed to fetch users',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get current user profile - THIS MUST COME BEFORE THE :id ROUTE
  @Get('profile/me')
  async getUserProfile(@Request() req: any) {
    try {
      console.log('[UC] req.user raw:', req.user);
      console.log('[UC] req.user stringified:', JSON.stringify(req.user));
      
      const condition1_isReqUserFalsy = !req.user;
      const condition2_isReqUserIdUndefined = typeof req.user?.id === 'undefined'; // Optional chaining for safety
      
      console.log(`[UC] Condition Check: !req.user is ${condition1_isReqUserFalsy}`);
      console.log(`[UC] Condition Check: typeof req.user?.id === \'undefined\' is ${condition2_isReqUserIdUndefined}`);
      console.log(`[UC] req.user?.id value: ${req.user?.id}, typeof req.user?.id: ${typeof req.user?.id}`);

      // The req.user object is what JwtStrategy.validate returns.
      // It should have an 'id' property, not 'sub'.
      if (condition1_isReqUserFalsy || condition2_isReqUserIdUndefined) { 
        console.error('[UC] Failing condition! req.user invalid or req.user.id is missing.');
        throw new HttpException('Invalid authentication token - user data not found in request', HttpStatus.UNAUTHORIZED);
      }
      
      // Get user from database using ID from the validated req.user object
      const userId = req.user.id;
      console.log(`[UsersController] Fetching full profile for user ID: ${userId}`);
      const user = await this.usersService.findOne(userId);
      
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      
      // Return user without password
      const { password, ...result } = user;
      return result;
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      throw new HttpException(
        error.message || 'Failed to get user profile', 
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get user by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    try {
      const user = await this.usersService.findOne(+id);
      
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      
      return user;
    } catch (error: any) {
      console.error(`Error fetching user ${id}:`, error);
      throw new HttpException(
        error.message || 'Failed to fetch user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Create new user
  @Post()
  async create(@Body() createUserDto: Partial<User>): Promise<User> {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new HttpException(
        error.message || 'Failed to create user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Update user
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<User>,
  ): Promise<User> {
    try {
      const updatedUser = await this.usersService.update(+id, updateUserDto);
      
      if (!updatedUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      
      return updatedUser;
    } catch (error: any) {
      console.error(`Error updating user ${id}:`, error);
      throw new HttpException(
        error.message || 'Failed to update user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Delete user
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.usersService.remove(+id);
      return { message: 'User deleted successfully' };
    } catch (error: any) {
      console.error(`Error deleting user ${id}:`, error);
      throw new HttpException(
        error.message || 'Failed to delete user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 