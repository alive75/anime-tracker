import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { UserAnimeStatus } from '../user-anime-status.enum';

export class UpdateAnimeDto {
    @IsInt()
    @IsOptional()
    watchedEpisodes?: number;

    @IsEnum(UserAnimeStatus)
    @IsOptional()
    status?: UserAnimeStatus;
}
