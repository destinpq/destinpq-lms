import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private logger = new Logger('HealthCheck');

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    this.logger.log('Health check endpoint hit');
    return { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      env: process.env.NODE_ENV,
      port: process.env.PORT || 8080
    };
  }
  
  // Add a simple alternative health check endpoint
  @Get('healthz')
  simpleHealthCheck() {
    this.logger.log('Simple health check endpoint hit');
    return "OK";
  }
}
