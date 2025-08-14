import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { UserAnime, UserAnimeStatus } from '../types';
import { PlusIcon, CheckIcon, TrashIcon, BookOpenIcon, ClockIcon, PencilIcon, ChevronDownIcon } from './icons';

interface AnimeCardProps {
  userAnime: UserAnime;
}

const statusConfig: Record<UserAnimeStatus, { color: string; icon: React.ReactNode; label: string }> = {
  [UserAnimeStatus.WATCHING]: { color: 'border-blue-500', icon: <ClockIcon className="w-4 h-4" />, label: 'Watching' },
  [UserAnimeStatus.COMPLETED]: { color: 'border-green-500', icon: <CheckIcon className="w-4 h-4" />, label: 'Completed' },
  [UserAnimeStatus.PLANNED]: { color: 'border-yellow-500', icon: <BookOpenIcon className="w-4 h-4" />, label: 'Planned' },
  [UserAnimeStatus.DROPPED]: { color: 'border-red-500', icon: <TrashIcon className="w-4 h-4" />, label: 'Dropped' },
  [UserAnimeStatus.PAUSED]: { color: 'border-gray-500', icon: <ClockIcon className="w-4 h-4" />, label: 'Paused' }
};

export const AnimeCard: React.FC<AnimeCardProps> = ({ userAnime }) => {
  const { anime } = userAnime;
  const progress = anime.totalEpisodes > 0 ? (userAnime.watchedEpisodes / anime.totalEpisodes) * 100 : 0;

  const [isEditingEpisodes, setIsEditingEpisodes] = useState(false);
  const [localEpisodes, setLocalEpisodes] = useState(userAnime.watchedEpisodes);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['anime-list'] });
  };
  
  const updateMutation = useMutation({
    mutationFn: (payload: { watchedEpisodes?: number; status?: UserAnimeStatus }) => api.patch(`/list/${userAnime.id}`, payload),
    onSuccess: invalidateQueries,
  });

  const incrementMutation = useMutation({
    mutationFn: () => api.patch(`/list/${userAnime.id}/increment`),
    onSuccess: invalidateQueries,
  });

  const removeMutation = useMutation({
    mutationFn: () => api.delete(`/list/${userAnime.id}`),
    onSuccess: invalidateQueries,
  });

  const handleEpisodesUpdate = () => {
    setIsEditingEpisodes(false);
    if (localEpisodes !== userAnime.watchedEpisodes) {
      updateMutation.mutate({ watchedEpisodes: Number(localEpisodes) });
    }
  };

  const handleStatusUpdate = (newStatus: UserAnimeStatus) => {
    setIsStatusDropdownOpen(false);
    if (newStatus !== userAnime.userStatus) {
      updateMutation.mutate({ status: newStatus });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`bg-base-200 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 border-l-4 ${statusConfig[userAnime.userStatus].color}`}>
      <div className="relative">
        <img src={anime.coverImageUrl} alt={anime.title} className="w-full h-64 object-cover" />
        <div className="absolute top-2 right-2">
            <div ref={dropdownRef} className="relative">
                <button onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)} className="bg-base-100 bg-opacity-80 rounded-full p-2 text-xs font-bold flex items-center gap-1.5 hover:bg-opacity-100 transition">
                    {statusConfig[userAnime.userStatus].icon}
                    {statusConfig[userAnime.userStatus].label}
                    <ChevronDownIcon className="w-3 h-3"/>
                </button>
                {isStatusDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-36 bg-base-300 rounded-md shadow-lg z-10">
                        {Object.values(UserAnimeStatus).map(status => (
                            <button key={status} onClick={() => handleStatusUpdate(status)} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-brand-primary">
                                {statusConfig[status].label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold truncate text-text-primary" title={anime.title}>{anime.title}</h3>
        <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
          <span>{anime.releaseYear > 0 ? anime.releaseYear : 'TBA'}</span>
          <span>&bull;</span>
          <span className="truncate">{anime.genres?.slice(0, 2).join(', ')}</span>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center text-sm text-text-secondary">
            <span className="font-medium">Progress</span>
            <div className="flex items-center gap-1">
              {isEditingEpisodes ? (
                <input
                  type="number"
                  value={localEpisodes}
                  onChange={(e) => setLocalEpisodes(Number(e.target.value))}
                  onBlur={handleEpisodesUpdate}
                  onKeyDown={(e) => e.key === 'Enter' && handleEpisodesUpdate()}
                  className="w-14 text-right bg-base-300 rounded px-1"
                  autoFocus
                />
              ) : (
                <span onClick={() => setIsEditingEpisodes(true)} className="cursor-pointer">
                  {userAnime.watchedEpisodes} / {anime.totalEpisodes || '?'}
                </span>
              )}
               <button onClick={() => setIsEditingEpisodes(true)} className="text-text-secondary hover:text-white"><PencilIcon className="w-3.5 h-3.5"/></button>
            </div>
          </div>
          <div className="w-full bg-base-300 rounded-full h-2.5 mt-1">
            <div className="bg-brand-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-base-300/50 flex justify-between items-center">
          <button
            onClick={() => incrementMutation.mutate()}
            disabled={incrementMutation.isPending || (anime.totalEpisodes > 0 && userAnime.watchedEpisodes >= anime.totalEpisodes)}
            className="flex items-center gap-2 bg-brand-primary text-white px-3 py-2 rounded-md hover:bg-brand-primary/80 transition-colors disabled:bg-base-300 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Ep</span>
          </button>
          <button
            onClick={() => removeMutation.mutate()}
            disabled={removeMutation.isPending}
            className="p-2 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
