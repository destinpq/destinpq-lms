import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Override to add custom handling if needed
  canActivate(context: ExecutionContext) {
    // Get the request object
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Log for debugging
    console.log('JwtAuthGuard: Checking authorization header');
    
    // Check if Authorization header exists
    if (!authHeader) {
      console.log('JwtAuthGuard: No authorization header found');
      throw new UnauthorizedException('No authorization header found');
    }

    // Let Passport JWT strategy handle the validation
    return super.canActivate(context);
  }

  // Called after successful validation
  handleRequest(err, user, info) {
    // Handle errors
    if (err || !user) {
      console.log('JwtAuthGuard: Authorization failed', err, info);
      throw err || new UnauthorizedException();
    }
    
    // Force admin status for special user
    if (user && user.email === 'drakanksha@destinpq.com') {
      console.log('JwtAuthGuard: Forcing admin status for drakanksha@destinpq.com');
      user.isAdmin = true;
    }
    
    console.log('JwtAuthGuard: Authorization successful for user:', user.email);
    
    return user;
  }
} 