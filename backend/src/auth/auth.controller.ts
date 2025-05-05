import { Body, Controller, Post, Options, Res, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // OPTIONS handler for login endpoint
  @Options('login')
  @HttpCode(204)
  loginOptions(@Res() res: Response) {
    res.header('Access-Control-Allow-Origin', 'https://www.drakanksha.co');
    res.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.send();
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // OPTIONS handler for register endpoint
  @Options('register')
  @HttpCode(204)
  registerOptions(@Res() res: Response) {
    res.header('Access-Control-Allow-Origin', 'https://www.drakanksha.co');
    res.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.send();
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
} 