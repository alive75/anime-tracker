import { IsNotEmpty, IsString } from 'class-validator';

export class MagicLinkCallbackDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
