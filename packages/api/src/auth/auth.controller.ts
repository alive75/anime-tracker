import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MagicLinkDto } from './dto/magic-link.dto';
import { MagicLinkCallbackDto } from './dto/magic-link-callback.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('magic-link')
  @HttpCode(HttpStatus.OK)
  async sendMagicLink(@Body() magicLinkDto: MagicLinkDto) {
    console.log('🔥 AuthController: Magic link endpoint called with email:', magicLinkDto.email);
    await this.authService.sendMagicLink(magicLinkDto.email);
    console.log('🔥 AuthController: Magic link sent successfully');
    return { message: 'Magic link sent. Please check your email.' };
  }

  @Post('magic-link/callback')
  @HttpCode(HttpStatus.OK)
  loginWithMagicLink(@Body() magicLinkCallbackDto: MagicLinkCallbackDto) {
    return this.authService.loginWithMagicLink(magicLinkCallbackDto.token);
  }
}