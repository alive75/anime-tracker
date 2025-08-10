import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserAnime, UserAnimeStatus, Anime } from '../types';

interface AnimeContextType {
  animeList: UserAnime[];
  addAnime: (anime: Anime, status: UserAnimeStatus, watchedEpisodes?: number) => boolean;
  removeAnime: (animeId: number) => void;
  updateAnimeProgress: (animeId: number, newEpisodeCount: number) => void;
  incrementAnimeProgress: (animeId: number) => void;
  getAnimeById: (animeId: number) => UserAnime | undefined;
  isLoading: boolean;
}

const AnimeContext = createContext<AnimeContextType | undefined>(undefined);

export const useAnime = (): AnimeContextType => {
  const context = useContext(AnimeContext);
  if (!context) {
    throw new Error('useAnime must be used within an AnimeProvider');
  }
  return context;
};

export const AnimeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [animeList, setAnimeList] = useState<UserAnime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedList = localStorage.getItem('animeList');
      if (storedList) {
        setAnimeList(JSON.parse(storedList));
      }
    } catch (error) {
      console.error("Failed to load anime list from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if(!isLoading) {
        try {
            localStorage.setItem('animeList', JSON.stringify(animeList));
        } catch (error) {
            console.error("Failed to save anime list to localStorage", error);
        }
    }
  }, [animeList, isLoading]);

  const addAnime = useCallback((anime: Anime, status: UserAnimeStatus, watchedEpisodes = 0): boolean => {
    if (animeList.some(a => a.id === anime.id)) {
      alert("This anime is already in your list.");
      return false;
    }

    const newUserAnime: UserAnime = {
      ...anime,
      userStatus: status,
      watchedEpisodes: status === UserAnimeStatus.Completed ? anime.totalEpisodes : watchedEpisodes,
      updatedAt: Date.now(),
    };

    setAnimeList(prevList => [...prevList, newUserAnime].sort((a,b) => b.updatedAt - a.updatedAt));
    return true;
  }, [animeList]);

  const removeAnime = useCallback((animeId: number) => {
    setAnimeList(prevList => prevList.filter(anime => anime.id !== animeId));
  }, []);

  const updateAnimeProgress = useCallback((animeId: number, newEpisodeCount: number) => {
    setAnimeList(prevList =>
      prevList.map(anime => {
        if (anime.id === animeId) {
          const isCompleted = anime.totalEpisodes > 0 && newEpisodeCount >= anime.totalEpisodes;
          return {
            ...anime,
            watchedEpisodes: newEpisodeCount,
            userStatus: isCompleted ? UserAnimeStatus.Completed : anime.userStatus,
            updatedAt: Date.now(),
          };
        }
        return anime;
      }).sort((a,b) => b.updatedAt - a.updatedAt)
    );
  }, []);

  const incrementAnimeProgress = useCallback((animeId: number) => {
    setAnimeList(prevList =>
      prevList.map(anime => {
        if (anime.id === animeId && anime.watchedEpisodes < anime.totalEpisodes) {
          const newEpisodeCount = anime.watchedEpisodes + 1;
          const isCompleted = anime.totalEpisodes > 0 && newEpisodeCount >= anime.totalEpisodes;
          return {
            ...anime,
            watchedEpisodes: newEpisodeCount,
            userStatus: isCompleted ? UserAnimeStatus.Completed : anime.userStatus,
            updatedAt: Date.now(),
          };
        }
        return anime;
      }).sort((a,b) => b.updatedAt - a.updatedAt)
    );
  }, []);

  const getAnimeById = useCallback((animeId: number) => {
    return animeList.find(a => a.id === animeId);
  },[animeList]);


  const value = {
    animeList,
    addAnime,
    removeAnime,
    updateAnimeProgress,
    incrementAnimeProgress,
    getAnimeById,
    isLoading,
  };

  return <AnimeContext.Provider value={value}>{children}</AnimeContext.Provider>;
};