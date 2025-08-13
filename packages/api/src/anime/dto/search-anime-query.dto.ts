import { IsNotEmpty, IsString } from 'class-validator';

export class SearchAnimeQueryDto {
  @IsString()
  @IsNotEmpty()
  q: string;
}
