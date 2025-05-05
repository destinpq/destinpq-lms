import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('Starting application...');
  
  try {
    const app = await NestFactory.create(AppModule, {
      cors: true,
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    app.enableCors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    
    // Setup global validation pipe
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    
    // Setup Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('LMS Workshop API')
      .setDescription('API documentation for the LMS Workshop system')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    
    // For DigitalOcean health checks - hardcode port 8080 no matter what
    await app.listen(8080, '0.0.0.0');
    
    logger.log(`⚡️ Application is running on: http://0.0.0.0:8080`);
    logger.log(`⚡️ App is also available at: http://localhost:8080`);
    logger.log(`📚 Swagger documentation available at: http://localhost:8080/api`);
    logger.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`💾 Database host: ${process.env.DB_HOST}`);
  } catch (error) {
    logger.error(`❌ Failed to start application: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap().catch(err => {
  console.error('💥 Unhandled bootstrap error:', err);
  process.exit(1);
});
