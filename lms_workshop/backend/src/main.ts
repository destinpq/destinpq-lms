import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Critical startup logging
  logger.log('=====================================================');
  logger.log('STARTING APPLICATION');
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`Port: ${process.env.PORT || 8080}`);
  logger.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  logger.log('=====================================================');
  
  try {
    // Create the NestJS application with all needed options
    const app = await NestFactory.create(AppModule, {
      // We configure CORS below, so no need to enable it here initially
      // cors: true, 
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      // Abort application startup if it takes too long (60 seconds)
      abortOnError: true,
      bufferLogs: true,
    });
    
    // CORS Configuration: Explicitly allow the frontend origin
    const allowedOrigins = [
      'https://www.drakanksha.co', 
      // Add other origins if needed (e.g., localhost for development)
      'http://localhost:3000', 
      'http://localhost:3001' 
    ];
    
    logger.log(`Configuring CORS for origins: ${allowedOrigins.join(', ')}`);
    
    app.enableCors({
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
          const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
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
    
    // IMPORTANT: Listen on all interfaces (0.0.0.0) with port 8080
    // This is critical for DigitalOcean App Platform
    const port = 8080;
    
    logger.log(`Starting server on port ${port}...`);
    await app.listen(port, '0.0.0.0');
    
    logger.log('=====================================================');
    logger.log(`✅ Server successfully started!`);
    logger.log(`📡 Listening on: http://0.0.0.0:${port}`);
    logger.log(`📚 API docs: http://0.0.0.0:${port}/api`);
    logger.log('=====================================================');
  } catch (error) {
    logger.error('=====================================================');
    logger.error(`❌ FATAL ERROR: Failed to start application!`);
    logger.error(`Error Message: ${error.message}`);
    logger.error(`Stack Trace: ${error.stack}`);
    logger.error('=====================================================');
    
    // Exit immediately when we hit an error - fail fast for DigitalOcean
    process.exit(1);
  }
}

bootstrap().catch(err => {
  console.error('=====================================================');
  console.error('💥 UNHANDLED BOOTSTRAP ERROR');
  console.error(err);
  console.error('=====================================================');
  process.exit(1);
});
