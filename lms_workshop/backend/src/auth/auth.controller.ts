import { Body, Controller, Post, Options, Res, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // CRITICAL: Explicit OPTIONS handler for login endpoint
  @Options('login')
  @HttpCode(204)
  loginOptions(@Res() res: Response) {
    // Include all required domains directly for maximum compatibility
    const allowedOrigins = '*';
    // Alternative approach: Comment out above and uncomment below if wildcard doesn't work
    // const allowedOrigins = 'https://www.drakanksha.co, http://www.drakanksha.co, https://stingray-app-5y46x.ondigitalocean.app';
    
    res.header('Access-Control-Allow-Origin', allowedOrigins);
    res.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.send();
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    // Include all required domains directly for maximum compatibility
    const allowedOrigins = '*';
    // Alternative approach: Comment out above and uncomment below if wildcard doesn't work
    // const allowedOrigins = 'https://www.drakanksha.co, http://www.drakanksha.co, https://stingray-app-5y46x.ondigitalocean.app';
    
    res.header('Access-Control-Allow-Origin', allowedOrigins);
    return this.authService.login(loginDto);
  }

  // CRITICAL: Explicit OPTIONS handler for register endpoint
  @Options('register')
  @HttpCode(204)
  registerOptions(@Res() res: Response) {
    // Include all required domains directly for maximum compatibility
    const allowedOrigins = '*';
    // Alternative approach: Comment out above and uncomment below if wildcard doesn't work
    // const allowedOrigins = 'https://www.drakanksha.co, http://www.drakanksha.co, https://stingray-app-5y46x.ondigitalocean.app';
    
    res.header('Access-Control-Allow-Origin', allowedOrigins);
    res.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.send();
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    // Include all required domains directly for maximum compatibility
    const allowedOrigins = '*';
    // Alternative approach: Comment out above and uncomment below if wildcard doesn't work
    // const allowedOrigins = 'https://www.drakanksha.co, http://www.drakanksha.co, https://stingray-app-5y46x.ondigitalocean.app';
    
    res.header('Access-Control-Allow-Origin', allowedOrigins);
    return this.authService.register(registerDto);
  }
} 