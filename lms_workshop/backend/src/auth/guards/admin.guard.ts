import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub || request.user?.id; // Get ID from either sub claim or user object
    const adminOverride = request.headers['admin-user-override'];
    const isDevelopment = process.env.NODE_ENV !== 'production';

    // If admin override is set in development mode, allow access
    if (isDevelopment && adminOverride) {
      this.logger.warn('Using admin override in development mode');
      return true;
    }

    if (!userId) {
      this.logger.warn('User not authenticated - missing ID');
      throw new UnauthorizedException('User not authenticated');
    }

    // Convert userId to a number and validate it
    const userIdNum = parseInt(userId.toString());
    if (isNaN(userIdNum)) {
      this.logger.error(`Invalid user ID format: ${userId}`);
      throw new UnauthorizedException('Invalid user ID');
    }

    try {
    const user = await this.usersRepository.findOne({
      where: { id: userIdNum },
    });

    if (!user) {
        this.logger.warn(`User with ID ${userIdNum} not found`);
      throw new UnauthorizedException('User not found');
    }

    if (!user.isAdmin) {
        this.logger.warn(`User ${userIdNum} attempted to access admin area without permissions`);
      throw new UnauthorizedException('Access denied: Admin privileges required');
    }

    return true;
    } catch (error) {
      this.logger.error(`Admin guard error: ${error.message}`, error.stack);
      throw new UnauthorizedException('Failed to validate admin access');
    }
  }
} 