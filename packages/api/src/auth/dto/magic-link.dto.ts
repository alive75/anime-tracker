import { IsEmail, IsNotEmpty } from 'class-validator';

export class MagicLinkDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
