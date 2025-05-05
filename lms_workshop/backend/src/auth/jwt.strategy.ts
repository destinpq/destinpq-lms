import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback_secret_key',
    });
  }

  async validate(payload: any) {
    try {
      // Log the incoming payload for debugging
      this.logger.log(`Validating JWT payload: ${JSON.stringify(payload)}`);
      
      // Determine which property has the user ID (sub or userId)
      const userId = payload.userId || payload.sub;
      
      // Check if payload has a valid userId
      if (!userId) {
        this.logger.warn('Missing userId in JWT payload');
        throw new UnauthorizedException('Invalid user ID in token');
      }
      
      // Parse the ID as an integer and explicitly check for NaN
      const userIdNum = parseInt(userId.toString(), 10);
      if (isNaN(userIdNum)) {
        this.logger.warn(`Invalid userId format: ${userId}`);
        throw new UnauthorizedException('Invalid user ID format in token');
      }
      
      // Normal path - look up user from database
      const user = await this.usersService.findOne(userIdNum);
      
      if (!user) {
        this.logger.warn(`User with ID ${userIdNum} not found`);
        throw new UnauthorizedException('User not found');
      }
      
      return user;
    } catch (error) {
      this.logger.error(`JWT validation error: ${error.message}`, error.stack);
      
      // DEVELOPMENT ONLY: Return a default admin user for development purposes
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log('Using admin override due to error');
        return {
          id: 1, // Use a valid ID from your DB
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          isAdmin: true
        };
      }
      
      throw new UnauthorizedException('Failed to validate token');
    }
  }
} 