import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { exit } from 'process';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(
        AppModule,
        new ExpressAdapter(),
    );

    const configService = app.get<ConfigService>(ConfigService);

    // --- Environment Variable Validation on Startup ---
    // This check ensures the application fails fast with a clear error message
    // if critical configuration is missing, preventing cryptic runtime crashes.
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'CLIENT_URL'];
    const missingEnvVars = requiredEnvVars.filter(varName => !configService.get(varName));

    if (missingEnvVars.length > 0) {
        console.error('❌ FATAL ERROR: Missing required environment variables.');
        missingEnvVars.forEach(varName => console.error(`- ${varName} is not defined.`));
        console.error('\nPlease set these variables in your deployment environment (e.g., Coolify).');
        console.error('Refer to the README.md for configuration details.');
        console.error('Application is shutting down.');

        // Using process.exit to ensure the container stops immediately,
        // which is important for "unhealthy" status detection by the orchestrator.
        exit(1);
    }
    // --- End Validation ---

    // Set a global prefix for all routes to make the API endpoints more explicit
    app.setGlobalPrefix('api');

    // --- CORS Configuration ---
    const clientUrl = configService.get<string>('CLIENT_URL');
    const corsOrigin = clientUrl.split(',').map(url => url.trim());

    app.enableCors({
        origin: corsOrigin,
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
    const port = configService.get<number>('PORT', 3001);
    await app.listen(port, '0.0.0.0');

    console.log(`🚀 API server is running on http://localhost:${port}/api`);
    console.log(`✅ CORS enabled for origin(s): ${JSON.stringify(corsOrigin)}`);
}
bootstrap();
