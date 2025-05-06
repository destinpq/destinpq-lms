import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

// Define a type for the JWT payload
interface JwtPayload {
  sub: number;
  email: string;
  isAdmin: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: JwtPayload) {
    console.log('Validating JWT payload:', payload);
    
    // Fetch user from database based on JWT sub claim
    const user = await this.usersService.findOne(payload.sub);
    
    if (!user) {
      console.log('User not found in database with id:', payload.sub);
      throw new UnauthorizedException();
    }
    
    // Remove sensitive data
    const { password, ...result } = user;
    
    return result;
  }
} 