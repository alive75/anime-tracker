import { Module } from '@nestjs/common';
import { UserAnimeListService } from './user-anime-list.service';
import { UserAnimeListController } from './user-anime-list.controller';
import { AuthModule } from '../auth/auth.module';
import { AnimeModule } from '../anime/anime.module';

@Module({
  imports: [AuthModule, AnimeModule],
  controllers: [UserAnimeListController],
  providers: [UserAnimeListService],
})
export class UserAnimeListModule {}
