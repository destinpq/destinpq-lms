import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:23000', 'http://127.0.0.1:23000', 'http://localhost:22000', 'http://127.0.0.1:22000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
  
  // Setup global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  // Get port from environment variable or use default 23001
  const port = process.env.PORT || 23001;
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
