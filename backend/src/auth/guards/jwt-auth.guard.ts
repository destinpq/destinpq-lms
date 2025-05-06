import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }

  // Override to add better error handling and token extraction
  canActivate(context: ExecutionContext) {
    // Get the request object
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      console.log('JWT Auth Guard: No authorization header');
      throw new UnauthorizedException('No authorization header found');
    }

    try {
      // Extract the token
      const token = authHeader.split(' ')[1];
      console.log('JWT Auth Guard: Token extracted');

      if (!token) {
        console.log('JWT Auth Guard: Token is empty');
        throw new UnauthorizedException('Invalid token format');
      }

      // Verify the token
      const payload = this.jwtService.verify(token);
      console.log('JWT Auth Guard: Token verified, payload:', payload);

      // Add user to request
      request.user = payload;

      // FORCE ADMIN for specific user
      if (payload.email === 'drakanksha@destinpq.com') {
        console.log('JWT Auth Guard: FORCING ADMIN for drakanksha@destinpq.com');
        request.user.isAdmin = true;
      }

      return true;
    } catch (error) {
      console.log('JWT Auth Guard error:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
} 