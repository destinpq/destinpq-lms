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
    console.log('[JwtStrategy] Validating JWT payload:', payload);
    
    if (!payload || typeof payload.sub !== 'number') {
      console.error('[JwtStrategy] Invalid JWT payload structure or missing sub (userID).');
      throw new UnauthorizedException('Invalid token: payload structure error.');
    }

    const user = await this.usersService.findByEmail(payload.email);
    
    if (!user) {
      console.log(`[JwtStrategy] User with email ${payload.email} from token not found in database.`);
      throw new UnauthorizedException('Invalid token: user not found.');
    }

    // CRITICAL CHECK: Ensure the user ID from the token (payload.sub) 
    // matches the ID of the user found in the database by email.
    if (user.id !== payload.sub) {
      console.warn(`[JwtStrategy] Token/DB User ID mismatch! Token sub: ${payload.sub}, DB User ID: ${user.id} for email: ${payload.email}. Rejecting token.`);
      throw new UnauthorizedException('Invalid token: user ID mismatch.');
    }
    
    console.log(`[JwtStrategy] User validated successfully: ${user.email} (ID: ${user.id})`);
    
    // Optionally, ensure isAdmin from token matches DB, though this can be complex
    // if admin rights can change and tokens are long-lived.
    // For now, primarily trust the DB's isAdmin status after validating the user.
    // However, we pass along the isAdmin from the validated DB user record.

    // Remove sensitive data and return the user object from DB
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;
    return result; // Return the validated user from the database
  }
} 