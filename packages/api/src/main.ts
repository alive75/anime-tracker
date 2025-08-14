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

    // Set a global prefix for all routes to make the API endpoints more explicit
    app.setGlobalPrefix('api');

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

    // Listen on 0.0.0.0 to be accessible from outside the Docker container
    await app.listen(3001, '0.0.0.0');
    console.log(`🚀 API server is running on http://localhost:3001/api`);
}
bootstrap();
