import React from 'react';
import { UserAnime } from '../types';
import { PlusIcon, CheckIcon, ClockIcon, TrashIcon, BookOpenIcon } from './icons';

interface AnimeCardProps {
  anime: UserAnime;
  onIncrement: (id: number) => void;
  onUpdateStatus: (id: number, status: UserAnime['userStatus']) => void;
  onRemove: (id: number) => void;
}

const getStatusColor = (status: UserAnime['userStatus']) => {
  switch (status) {
    case 'WATCHING': return 'border-blue-500';
    case 'COMPLETED': return 'border-green-500';
    case 'PLANNED': return 'border-yellow-500';
    case 'DROPPED': return 'border-red-500';
    case 'PAUSED': return 'border-gray-500';
    default: return 'border-base-300';
  }
};

const getStatusIcon = (status: UserAnime['userStatus']) => {
    switch (status) {
      case 'WATCHING': return <ClockIcon className="w-4 h-4" />;
      case 'COMPLETED': return <CheckIcon className="w-4 h-4" />;
      case 'PLANNED': return <BookOpenIcon className="w-4 h-4" />;
      default: return <div />;
    }
  };


export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onIncrement, onRemove }) => {
  const progress = anime.totalEpisodes > 0 ? (anime.watchedEpisodes / anime.totalEpisodes) * 100 : 0;

  return (
    <div className="bg-base-200 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 border-l-4" style={{borderColor: getStatusColor(anime.userStatus).replace('border-','')}}>
      <div className="relative">
        <img src={anime.coverImageUrl} alt={anime.title} className="w-full h-64 object-cover" />
        <div className="absolute top-2 right-2 bg-base-100 bg-opacity-80 rounded-full p-2 text-xs font-bold flex items-center gap-1">
            {getStatusIcon(anime.userStatus)}
            {anime.userStatus}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold truncate text-text-primary" title={anime.title}>{anime.title}</h3>
        <div className="mt-2">
          <div className="flex justify-between items-center text-sm text-text-secondary">
            <span>Progress</span>
            <span>{anime.watchedEpisodes} / {anime.totalEpisodes || '?'}</span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-2.5 mt-1">
            <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => onIncrement(anime.id)}
            disabled={anime.watchedEpisodes === anime.totalEpisodes}
            className="flex items-center gap-2 bg-brand-primary text-white px-3 py-2 rounded-md hover:bg-brand-primary/80 transition-colors disabled:bg-base-300 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Ep</span>
          </button>
          <button
            onClick={() => onRemove(anime.id)}
            className="p-2 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
        {anime.airingStatus === 'RELEASING' && anime.nextAiringEpisodeAt && (
          <div className="mt-3 text-xs text-center text-cyan-400 p-2 bg-cyan-900/50 rounded-md">
            Next ep: {new Date(anime.nextAiringEpisodeAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};