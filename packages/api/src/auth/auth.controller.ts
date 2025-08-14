import { Body, Controller, HttpCode, HttpStatus, Options, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Handles preflight OPTIONS requests for CORS.
     * This is sometimes necessary to make reverse proxies and browsers happy.
     * The `enableCors` in `main.ts` will attach the correct headers.
     */
    @Options('*')
    @HttpCode(HttpStatus.NO_CONTENT)
    handleOptions() { }

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}

