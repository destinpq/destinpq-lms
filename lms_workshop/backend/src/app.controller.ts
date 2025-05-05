import { Controller, Get, Post, Options, Req, Res, All, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV,
      port: process.env.PORT || 8080
    };
  }
  
  @Get('healthz')
  simpleHealthCheck() {
    return "OK";
  }

  // Handle OPTIONS requests for all routes with explicit CORS headers
  // Use wildcard pattern to match any route
  @Options('*')
  @HttpCode(204)
  handleOptions(@Res() res: Response) {
    // Include all required domains directly for maximum compatibility
    const allowedOrigins = '*';
    
    res.header('Access-Control-Allow-Origin', allowedOrigins);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.send();
  }
  
  // Handle OPTIONS requests specifically for auth endpoints - using updated route syntax with named parameter
  // This will match /lms/auth/xxx routes due to global prefix
  @Options('auth/*path')
  @HttpCode(204)
  handleAuthOptions(@Res() res: Response) {
    // Include all required domains directly for maximum compatibility
    const allowedOrigins = '*';
    
    res.header('Access-Control-Allow-Origin', allowedOrigins);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.send();
  }
}
