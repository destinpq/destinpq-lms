import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  
  canActivate(context: ExecutionContext) {
    // For development purposes only, allow bypass of JWT verification
    if (process.env.NODE_ENV !== 'production') {
      const req = context.switchToHttp().getRequest();
      const authHeader = req.headers.authorization;
      
      // If there's a development bypass token, allow the request through
      if (authHeader === 'Bearer development-bypass') {
        this.logger.log('Using development auth bypass');
        
        // Set user data on the request to simulate authentication
        req.user = {
          id: 1,
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          isAdmin: true
        };
        
        return true;
      }
      
      // If authorization header is completely missing, provide auto-login for development
      if (!authHeader && process.env.AUTO_ADMIN_LOGIN === 'true') {
        this.logger.log('Auto-admin login enabled, bypassing authentication');
        
        req.user = {
          id: 1,
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          isAdmin: true
        };
        
        return true;
      }
    }
    
    // Normal JWT validation for production or if bypass isn't used
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context) {
    // Standard error handling
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    
    return user;
  }
} 