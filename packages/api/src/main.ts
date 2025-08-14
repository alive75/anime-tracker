import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(
        AppModule,
        new ExpressAdapter(),
    );

    const configService = app.get(ConfigService);
    const clientUrl = configService.get<string>('CLIENT_URL');

    // Set a global prefix for all routes to make the API endpoints more explicit
    app.setGlobalPrefix('api');

    // Configure CORS to dynamically use the CLIENT_URL from environment variables.
    // This is crucial for production deployments.
    app.enableCors({
        origin: clientUrl || 'http://localhost:5173',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Accept, Authorization',
    });

    // Enable global validation pipe to use class-validator DTOs.
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true, // Strip away properties that do not have any decorators
        transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
    }));

    // Listen on 0.0.0.0 to be accessible from outside the Docker container
    await app.listen(3001, '0.0.0.0');
    console.log(`🚀 API server is running on http://localhost:3001/api`);
    console.log(`✅ CORS enabled for origin: ${clientUrl || 'http://localhost:5173'}`);
}
bootstrap();
