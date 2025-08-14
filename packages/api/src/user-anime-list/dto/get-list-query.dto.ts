import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { UserAnimeStatus } from '../user-anime-status.enum';

export class GetListQueryDto {
    @IsEnum(UserAnimeStatus)
    @IsOptional()
    status?: UserAnimeStatus;

    @IsString()
    @IsOptional()
    genre?: string;

    @IsInt()
    @Type(() => Number)
    @IsOptional()
    year?: number;
}
