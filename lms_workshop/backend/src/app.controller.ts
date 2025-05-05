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

  // CRITICAL: Handle OPTIONS requests for all routes with explicit CORS headers
  @Options('*')
  @HttpCode(204)
  handleOptions(@Res() res: Response) {
    // Include all required domains directly for maximum compatibility
    const allowedOrigins = '*';
    // Alternative approach: Comment out above and uncomment below if wildcard doesn't work
    // const allowedOrigins = 'https://www.drakanksha.co, http://www.drakanksha.co, https://stingray-app-5y46x.ondigitalocean.app';
    
    res.header('Access-Control-Allow-Origin', allowedOrigins);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.send();
  }
  
  // Specific OPTIONS handler for auth endpoints
  @Options('auth/*')
  @HttpCode(204)
  handleAuthOptions(@Res() res: Response) {
    // Include all required domains directly for maximum compatibility
    const allowedOrigins = '*';
    // Alternative approach: Comment out above and uncomment below if wildcard doesn't work
    // const allowedOrigins = 'https://www.drakanksha.co, http://www.drakanksha.co, https://stingray-app-5y46x.ondigitalocean.app';
    
    res.header('Access-Control-Allow-Origin', allowedOrigins);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.send();
  }
}
