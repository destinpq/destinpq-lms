import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // Set up allowed origins with environment variable
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:22000';
  const allowedOrigins = [
    'http://localhost:23000', 
    'http://127.0.0.1:23000', 
    'http://localhost:22000', 
    'http://127.0.0.1:22000', 
    'https://www.drakanksha.co', 
    'http://www.drakanksha.co',
    frontendUrl
  ];
  
  console.log('CORS: Allowing origins:', allowedOrigins);
  
  // Enable CORS
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
  });
  
  // Setup global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  // Add global prefix to match frontend expectations
  // Note: Health check endpoints will still be accessible at the root
  app.setGlobalPrefix('lms', {
    exclude: ['health', 'healthz'],
  });
  
  // Get port from environment variable or use default 15001
  const port = process.env.PORT || 15001;
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Frontend URL: ${frontendUrl}`);
}
bootstrap();
