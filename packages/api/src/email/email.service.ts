import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private readonly resend: Resend;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        if (!apiKey) {
            throw new InternalServerErrorException('RESEND_API_KEY is not configured.');
        }
        this.resend = new Resend(apiKey);
    }

    async sendMagicLink(to: string, link: string): Promise<void> {
        try {
            console.log('Attempting to send magic link email to:', to);
            console.log('Magic link:', link);

            const result = await this.resend.emails.send({
                from: 'Anime Tracker <onboarding@anime.ts75.uk>', // IMPORTANT: Change this to your verified Resend domain
                to: [to],
                subject: 'Your Magic Link to Sign In to Anime Tracker',
                html: `
          <div style="font-family: sans-serif; text-align: center; padding: 20px;">
            <h2>Anime Tracker Sign-In</h2>
            <p>Click the button below to sign in to your account.</p>
            <a href="${link}" style="background-color: #4f46e5; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">
              Sign In
            </a>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">
              This link will expire in 15 minutes. If you did not request this, you can safely ignore this email.
            </p>
          </div>
        `,
            });

            console.log('Email sent successfully. Resend response:', result);
        } catch (error) {
            console.error('Failed to send magic link email:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            // We don't re-throw the error to the user to prevent leaking information,
            // but we log it for debugging purposes.
            throw new InternalServerErrorException('Could not send the magic link email.');
        }
    }
}
