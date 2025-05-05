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
      // CORS will be configured separately
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      abortOnError: true,
      bufferLogs: true,
    });
    
    // ===== CORS CONFIGURATION =====
    // Read CORS settings from environment variables
    const corsOrigins = process.env.APP_CORS_ALLOW_ORIGINS || '*';
    const corsMethods = process.env.APP_CORS_ALLOW_METHODS || 'GET,POST,PUT,DELETE,PATCH,OPTIONS';
    const corsHeaders = process.env.APP_CORS_ALLOW_HEADERS || 'Content-Type,Authorization,X-Requested-With';
    
    logger.log('=====================================================');
    logger.log('CORS CONFIGURATION');
    logger.log(`Origins: ${corsOrigins}`);
    logger.log(`Methods: ${corsMethods}`);
    logger.log(`Headers: ${corsHeaders}`);
    logger.log('=====================================================');
    
    // Apply CORS configuration - special handling for wildcard vs. specific origins
    if (corsOrigins.trim() === '*') {
      logger.log('Using wildcard CORS configuration');
      app.enableCors({
        origin: '*',
        methods: corsMethods.split(',').map(method => method.trim()),
        allowedHeaders: corsHeaders.split(',').map(header => header.trim()),
        credentials: false // Must be false when using wildcard
      });
    } else {
      logger.log('Using specific origins CORS configuration');
      const originList = corsOrigins.split(',').map(origin => origin.trim());
      logger.log(`Allowed origins: ${JSON.stringify(originList)}`);
      
      app.enableCors({
        origin: originList,
        methods: corsMethods.split(',').map(method => method.trim()),
        allowedHeaders: corsHeaders.split(',').map(header => header.trim()),
        credentials: true // Can be true with specific origins
      });
    }
    
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
  } catch (error: unknown) {
    logger.error('=====================================================');
    logger.error(`❌ FATAL ERROR: Failed to start application!`);
    if (error instanceof Error) {
      logger.error(`Error Message: ${error.message}`);
      logger.error(`Stack Trace: ${error.stack}`);
    } else {
      logger.error(`Unknown Error: ${String(error)}`);
    }
    logger.error('=====================================================');
    
    // Exit immediately when we hit an error - fail fast for DigitalOcean
    process.exit(1);
  }
}

bootstrap().catch((err: unknown) => {
  console.error('=====================================================');
  console.error('💥 UNHANDLED BOOTSTRAP ERROR');
  console.error(err instanceof Error ? err.stack : String(err));
  console.error('=====================================================');
  process.exit(1);
});
