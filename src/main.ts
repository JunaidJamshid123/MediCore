import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { winstonConfig } from './config/winston.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonConfig,
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Global API prefix (exclude health check for load balancers)
  app.setGlobalPrefix('api', { exclude: ['health'] });

  // Security - Helmet
  app.use(helmet());

  // CORS Configuration — restrict origins in production
  const corsOrigin = configService.get<string>('cors.origin', '*');
  app.enableCors({
    origin:
      configService.get<string>('environment') === 'production'
        ? corsOrigin.split(',')
        : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Token'],
  });

  // Global pipes, filters, interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger — only in non-production environments
  if (configService.get<string>('environment') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('MediCore API')
      .setDescription('Healthcare Backend API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Health', 'Health check endpoints')
      .addTag('Users', 'User management endpoints')
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Roles', 'Role management endpoints')
      .addTag('Permissions', 'Permission management endpoints')
      .addTag('Sessions', 'Session management endpoints')
      .addTag('Patients', 'Patient management endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get<number>('port', 3000);
  await app.listen(port);

  logger.log(`🏥 MediCore Server is running on: http://localhost:${port}`);
  logger.log(`📋 Health Check: http://localhost:${port}/health`);
  if (configService.get<string>('environment') !== 'production') {
    logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  }
}
bootstrap();
