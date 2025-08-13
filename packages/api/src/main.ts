
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    try {
        console.log('🔄 Criando aplicação NestJS...');
        const app = await NestFactory.create(AppModule);
        console.log('✅ Aplicação criada com sucesso');

        console.log('🔄 Configurando CORS...');
        app.enableCors({
            origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
            credentials: true,
        });
        console.log('✅ CORS configurado');

        console.log('🔄 Configurando ValidationPipe...');
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            transform: true,
        }));
        console.log('✅ ValidationPipe configurado');

        console.log('🔄 Iniciando servidor na porta 3001...');
        await app.listen(3001);
        console.log('🚀 API server is running on http://localhost:3001');
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
    }
}

console.log('📍 Arquivo main.ts foi carregado');

bootstrap().then(() => {
    console.log('✅ Bootstrap concluído');
}).catch(error => {
    console.error('❌ Erro no bootstrap:', error);
});
