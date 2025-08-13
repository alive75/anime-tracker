import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { AxiosError } from 'axios';

export interface JikanSearchResponse {
    data: any[];
}

export interface JikanAnimeResponse {
    data: {
        mal_id: number;
        title: string;
        synopsis: string;
        episodes: number;
        status: string;
        images: {
            jpg: {
                large_image_url: string;
            };
        };
        genres: { name: string }[];
        aired: { from: string | null };
    };
}

@Injectable()
export class AnimeService {
    private readonly JIKAN_API_URL = 'https://api.jikan.moe/v4';

    constructor(
        private readonly httpService: HttpService,
        private readonly prisma: PrismaService,
    ) { }

    async search(query: string) {
        const { data } = await firstValueFrom(
            this.httpService.get<JikanSearchResponse>(`${this.JIKAN_API_URL}/anime`, { params: { q: query, limit: 10 } }).pipe(
                catchError((error: AxiosError) => {
                    console.error(error.response?.data);
                    throw 'An error happened!';
                }),
            ),
        );
        return data;
    }

    async findOrCreate(animeApiId: number) {
        const existingAnime = await this.prisma.anime.findUnique({
            where: { id: animeApiId },
        });

        if (existingAnime) {
            return existingAnime;
        }

        const { data } = await firstValueFrom(
            this.httpService.get<JikanAnimeResponse>(`${this.JIKAN_API_URL}/anime/${animeApiId}`).pipe(
                catchError((error: AxiosError) => {
                    console.error(error.response?.data);
                    throw new NotFoundException(`Anime with ID ${animeApiId} not found on external API.`);
                }),
            ),
        );

        const animeData = data.data;

        const releaseYear = animeData.aired?.from ? new Date(animeData.aired.from).getFullYear() : 0;
        const genres = animeData.genres?.map(g => g.name) ?? [];

        const createdAnime = await this.prisma.anime.create({
            data: {
                id: animeData.mal_id,
                title: animeData.title,
                synopsis: animeData.synopsis ?? 'No synopsis available.',
                totalEpisodes: animeData.episodes ?? 0,
                airingStatus: animeData.status,
                coverImageUrl: animeData.images?.jpg?.large_image_url ?? '',
                releaseYear,
                genres: genres, // Save genres as a native string array
            },
        });

        return createdAnime;
    }
}

