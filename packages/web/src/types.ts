export enum UserAnimeStatus {
  Watching = 'WATCHING',
  Completed = 'COMPLETED',
  Planned = 'PLANNED',
  Dropped = 'DROPPED',
  Paused = 'PAUSED',
}

export enum AiringStatus {
  Releasing = 'RELEASING',
  Finished = 'FINISHED',
  NotYetReleased = 'NOT_YET_RELEASED',
  Cancelled = 'CANCELLED'
}

export interface Anime {
  id: number;
  title: string;
  synopsis: string;
  totalEpisodes: number;
  airingStatus: AiringStatus;
  coverImageUrl: string;
  nextAiringEpisodeAt: string | null;
}

export interface UserAnime extends Anime {
  userStatus: UserAnimeStatus;
  watchedEpisodes: number;
  updatedAt: number; // timestamp
}