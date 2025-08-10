import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // CORS can be enabled here later, e.g., app.enableCors();
  await app.listen(3001); // Using port 3001 for the api
}
bootstrap();