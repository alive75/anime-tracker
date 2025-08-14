export enum UserAnimeStatus {
  WATCHING = 'WATCHING',
  COMPLETED = 'COMPLETED',
  PLANNED = 'PLANNED',
  DROPPED = 'DROPPED',
  PAUSED = 'PAUSED',
}

export enum AiringStatus {
  Releasing = 'Currently Airing',
  Finished = 'Finished Airing',
  NotYetReleased = 'Not yet aired',
  Cancelled = 'Cancelled'
}

export interface Anime {
  id: number;
  title: string;
  synopsis: string;
  totalEpisodes: number;
  airingStatus: AiringStatus;
  coverImageUrl: string;
  genres: string[];
  releaseYear: number;
}

export interface UserAnime {
  id: number; // This is the ID of the UserAnime record itself
  userStatus: UserAnimeStatus;
  watchedEpisodes: number;
  updatedAt: string; // timestamp
  anime: Anime; // The nested anime details from the backend
}

// Type for search results from Jikan API via our backend
export interface JikanAnimeSearchResult {
    mal_id: number;
    title: string;
    synopsis: string;
    images: {
        jpg: {
            large_image_url: string;
        }
    }
}
