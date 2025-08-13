import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { UserAnimeStatus } from '@prisma/client';

export class UpdateAnimeDto {
    @IsInt()
    @IsOptional()
    watchedEpisodes?: number;

    @IsEnum(UserAnimeStatus)
    @IsOptional()
    status?: UserAnimeStatus;
}

