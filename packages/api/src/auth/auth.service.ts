import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  private async _generateSessionToken(user: { id: number; email: string }) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password_hash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return user;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return this._generateSessionToken(user);
  }

  async sendMagicLink(email: string) {
    const payload = { email };
    const token = await this.jwtService.signAsync(payload, { expiresIn: '15m' });

    const clientUrl = this.configService.get<string>('CLIENT_URL');
    if (!clientUrl) {
      console.error('FATAL: CLIENT_URL environment variable is not set. Cannot generate magic link.');
      throw new InternalServerErrorException('Server configuration error.');
    }

    const magicLink = `${clientUrl}/magic-link-callback?token=${token}`;
    
    // Replace console.log with the actual email service call
    await this.emailService.sendMagicLink(email, magicLink);

    // We don't throw an error if the user doesn't exist to prevent email enumeration.
  }
  
  async loginWithMagicLink(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const email = payload.email;

      if (!email) {
        throw new UnauthorizedException('Invalid magic link token.');
      }
      
      let user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        // If the user doesn't exist, create a new one.
        // The password hash is set to a long, random, unusable string.
        // This effectively creates a "passwordless" account.
        const placeholderHash = await bcrypt.hash(`magic-link-${Date.now()}-${Math.random()}`, 10);

        user = await this.prisma.user.create({
          data: {
            email,
            password_hash: placeholderHash,
          },
        });
      }
      
      return this._generateSessionToken(user);
    } catch (error) {
      // Catches JWT errors like token expiration
      throw new UnauthorizedException('Magic link is invalid or has expired.');
    }
  }
}