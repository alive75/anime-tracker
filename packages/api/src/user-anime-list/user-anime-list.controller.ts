import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserAnimeListService } from './user-anime-list.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/user.decorator';
import { AddAnimeDto } from './dto/add-anime.dto';
import { UpdateAnimeDto } from './dto/update-anime.dto';
import { GetListQueryDto } from './dto/get-list-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('list')
export class UserAnimeListController {
    constructor(private readonly userAnimeListService: UserAnimeListService) { }

    @Post()
    addToList(@GetUser() user: { userId: number }, @Body() addAnimeDto: AddAnimeDto) {
        return this.userAnimeListService.addToList(user.userId, addAnimeDto);
    }

    @Get()
    async getList(@GetUser() user: { userId: number }, @Query() query: GetListQueryDto) {
        const listData = await this.userAnimeListService.getList(user.userId, query);
        // Wrap the response in a 'data' object for consistency with other API endpoints
        // like anime/search. This resolves frontend errors expecting an object wrapper.
        return { data: listData };
    }

    @Patch(':id')
    updateEntry(
        @GetUser() user: { userId: number },
        @Param('id', ParseIntPipe) userAnimeId: number,
        @Body() updateAnimeDto: UpdateAnimeDto,
    ) {
        return this.userAnimeListService.updateEntry(user.userId, userAnimeId, updateAnimeDto);
    }

    @Patch(':id/increment')
    incrementProgress(
        @GetUser() user: { userId: number },
        @Param('id', ParseIntPipe) userAnimeId: number
    ) {
        return this.userAnimeListService.incrementProgress(user.userId, userAnimeId);
    }

    @Delete(':id')
    removeFromList(@GetUser() user: { userId: number }, @Param('id', ParseIntPipe) userAnimeId: number) {
        return this.userAnimeListService.removeFromList(user.userId, userAnimeId);
    }
}

