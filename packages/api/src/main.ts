import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Configure CORS to allow specific origins.
    // Using a static array can be more reliable with some reverse proxies.
    app.enableCors({
        origin: [
            'http://localhost:5173', // For local development
            'https://anime.ts75.uk',   // For production
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Accept, Authorization',
    });

    // Enable global validation pipe to use class-validator DTOs.
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true, // Strip away properties that do not have any decorators
        transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
    }));

    // Add a global prefix to all routes
    app.setGlobalPrefix('api');

    // Enable shutdown hooks for graceful shutdown (e.g., for Prisma)
    app.enableShutdownHooks();

    await app.listen(3001);
    console.log(`🚀 API server is running on http://localhost:3001/api`);
}
bootstrap();

