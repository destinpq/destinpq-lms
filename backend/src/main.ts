import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:23000', 'http://127.0.0.1:23000', 'http://localhost:22000', 'http://127.0.0.1:22000', 'https://www.drakanksha.co', 'http://www.drakanksha.co', 'https://destinpq-lms-63d26b382b63.herokuapp.com'],
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
}
bootstrap();
