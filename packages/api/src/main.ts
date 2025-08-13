import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(
        AppModule,
        new ExpressAdapter(),
    );

    // Configure CORS to explicitly allow the frontend origin and required methods/headers.
    // This is a more secure and standard approach.
    app.enableCors({
        origin: 'http://localhost:5173',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Accept, Authorization',
    });

    // Enable global validation pipe to use class-validator DTOs.
    // The `forbidNonWhitelisted` option is removed as it can cause issues with
    // preflight OPTIONS requests by throwing errors on empty bodies, which
    // interferes with the CORS middleware.
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true, // Strip away properties that do not have any decorators
        transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
    }));

    // Add a global prefix to all routes
    app.setGlobalPrefix('api');

    // Enable shutdown hooks for graceful shutdown (e.g., for Prisma)
    app.enableShutdownHooks();

    await app.listen(3001); // Using port 3001 for the api
    console.log(`🚀 API server is running on http://localhost:3001/api`);
}
bootstrap();
