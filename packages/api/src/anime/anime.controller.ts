import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SearchAnimeQueryDto } from './dto/search-anime-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('anime')
export class AnimeController {
    constructor(private readonly animeService: AnimeService) { }

    @Get('search')
    async searchAnime(@Query() query: SearchAnimeQueryDto) {
        const jikanResponse = await this.animeService.search(query.q);
        // The Jikan API response is an object containing a 'data' array and 'pagination' info.
        // The frontend expects the response body to be an object with a 'data' property that is the array of anime.
        // We transform the response to match the frontend's expectation, which then extracts the array via `response.data.data`.
        return { data: jikanResponse.data };
    }
}
