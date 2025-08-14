import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnimeService } from '../anime/anime.service';
import { AddAnimeDto } from './dto/add-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import { GetListQueryDto } from './dto/get-list-query.dto';
import { UserAnimeStatus } from './user-anime-status.enum';

@Injectable()
export class UserAnimeListService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly animeService: AnimeService,
  ) {}

  async addToList(userId: number, addAnimeDto: AddAnimeDto) {
    const { animeApiId, status, watchedEpisodes } = addAnimeDto;

    const existingEntry = await this.prisma.userAnime.findUnique({
      where: { userId_animeId: { userId, animeId: animeApiId } },
    });

    if (existingEntry) {
      throw new ConflictException('This anime is already in your list.');
    }

    const anime = await this.animeService.findOrCreate(animeApiId);

    const newEntry = await this.prisma.userAnime.create({
      data: {
        userId,
        animeId: anime.id,
        userStatus: status,
        watchedEpisodes: watchedEpisodes ?? (status === UserAnimeStatus.COMPLETED ? anime.totalEpisodes : 0),
      },
      include: {
        anime: true, // Include anime details in the response
      }
    });

    return newEntry;
  }

  async getList(userId: number, query: GetListQueryDto) {
    const where: any = {
      userId,
    };
    if (query.status) {
      where.userStatus = query.status;
    }
    if (query.genre) {
      // Use 'has' for array field searching in PostgreSQL
      where.anime = { ...where.anime, genres: { has: query.genre } };
    }
    if (query.year) {
      where.anime = { ...where.anime, releaseYear: query.year };
    }

    const list = await this.prisma.userAnime.findMany({
      where,
      include: {
        anime: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return list;
  }

  async updateEntry(userId: number, userAnimeId: number, updateAnimeDto: UpdateAnimeDto) {
    const entry = await this.prisma.userAnime.findUnique({
      where: { id: userAnimeId },
       include: { anime: true },
    });

    if (!entry || entry.userId !== userId) {
      throw new NotFoundException('Anime list entry not found.');
    }
    
    const { status, watchedEpisodes } = updateAnimeDto;
    const dataToUpdate: { watchedEpisodes?: number; userStatus?: UserAnimeStatus } = {};

    if (status) {
      dataToUpdate.userStatus = status;
    }
    if (watchedEpisodes !== undefined) {
      dataToUpdate.watchedEpisodes = watchedEpisodes;
    }
    
    if (watchedEpisodes !== undefined && status === undefined) {
      if (entry.userStatus === UserAnimeStatus.PLANNED && watchedEpisodes > 0) {
        dataToUpdate.userStatus = UserAnimeStatus.WATCHING;
      }
      if (entry.anime.totalEpisodes > 0 && watchedEpisodes >= entry.anime.totalEpisodes) {
        dataToUpdate.userStatus = UserAnimeStatus.COMPLETED;
        dataToUpdate.watchedEpisodes = entry.anime.totalEpisodes;
      }
    }

    if (status === UserAnimeStatus.COMPLETED && entry.anime.totalEpisodes > 0) {
      dataToUpdate.watchedEpisodes = entry.anime.totalEpisodes;
    }
    
    const updatedEntry = await this.prisma.userAnime.update({
      where: { id: userAnimeId },
      data: dataToUpdate,
      include: {
        anime: true,
      }
    });

    return updatedEntry;
  }

  async incrementProgress(userId: number, userAnimeId: number) {
     const entry = await this.prisma.userAnime.findUnique({
      where: { id: userAnimeId },
      include: { anime: true },
    });

    if (!entry || entry.userId !== userId) {
      throw new NotFoundException('Anime list entry not found.');
    }

    if (entry.userStatus === UserAnimeStatus.COMPLETED && entry.anime.totalEpisodes > 0) {
      return entry; // Already completed
    }
    
    const newEpisodeCount = entry.watchedEpisodes + 1;
    let newStatus = entry.userStatus;
    
    if (entry.userStatus === UserAnimeStatus.PLANNED) {
      newStatus = UserAnimeStatus.WATCHING;
    } else if (entry.anime.totalEpisodes > 0 && newEpisodeCount >= entry.anime.totalEpisodes) {
        newStatus = UserAnimeStatus.COMPLETED;
    }

    const updatedEntry = await this.prisma.userAnime.update({
        where: { id: userAnimeId },
        data: {
            watchedEpisodes: newEpisodeCount,
            userStatus: newStatus,
        },
        include: {
            anime: true,
        }
    });

    return updatedEntry;
  }

  async removeFromList(userId: number, userAnimeId: number) {
    const entry = await this.prisma.userAnime.findUnique({
      where: { id: userAnimeId },
    });

    if (!entry || entry.userId !== userId) {
      throw new NotFoundException('Anime list entry not found.');
    }

    await this.prisma.userAnime.delete({
      where: { id: userAnimeId },
    });

    return { message: 'Successfully removed from list.' };
  }
}
