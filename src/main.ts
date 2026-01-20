import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for healthcare applications
  app.enableCors();
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🏥 MediCore Server is running on: http://localhost:${port}`);
  console.log(`📋 Health Check: http://localhost:${port}/health`);
}
bootstrap();
