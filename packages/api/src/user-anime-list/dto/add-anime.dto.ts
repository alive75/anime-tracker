import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { UserAnimeStatus } from '../user-anime-status.enum';

export class AddAnimeDto {
    @IsInt()
    @IsNotEmpty()
    animeApiId: number;

    @IsEnum(UserAnimeStatus)
    @IsNotEmpty()
    status: UserAnimeStatus;

    @IsNumber()
    @IsOptional()
    watchedEpisodes?: number;
}
