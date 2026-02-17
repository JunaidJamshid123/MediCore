import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { winstonConfig } from './config/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonConfig,
  });

  // Security - Helmet
  app.use(helmet());

  // Enable CORS for healthcare applications
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('MediCore API')
    .setDescription('Healthcare Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Health', 'Health check endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Roles', 'Role management endpoints (Phase 2)')
    .addTag('Permissions', 'Permission management endpoints (Phase 2)')
    .addTag('Sessions', 'Session management endpoints (Phase 2)')
    .addTag('Patients', 'Patient management endpoints (Phase 3)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🏥 MediCore Server is running on: http://localhost:${port}`);
  console.log(`📋 Health Check: http://localhost:${port}/health`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
