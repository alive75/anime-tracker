import React from 'react';
import { JikanAnimeSearchResult, UserAnimeStatus } from '../types';
import { PlusIcon, CheckIcon } from './icons';

interface RecommendationCardProps {
    anime: JikanAnimeSearchResult & { reason: string };
    onAdd: (animeId: number, status: UserAnimeStatus) => void;
    isAdding: boolean;
    isAdded: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ anime, onAdd, isAdding, isAdded }) => {
    return (
        <div className="bg-base-200 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] flex flex-col border border-base-300">
            <div className="relative">
                <img src={anime.images.jpg.large_image_url} alt={anime.title} className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-xl font-bold text-white" title={anime.title}>{anime.title}</h3>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex-grow mb-3">
                    <p className="text-sm text-text-secondary italic border-l-2 border-brand-secondary pl-3">"{anime.reason}"</p>
                </div>
                <div className="mt-auto">
                    <button
                        onClick={() => onAdd(anime.mal_id, UserAnimeStatus.Planned)}
                        disabled={isAdding || isAdded}
                        className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white px-3 py-2.5 rounded-md hover:bg-brand-primary/80 transition-colors disabled:bg-base-300 disabled:text-text-secondary disabled:cursor-not-allowed"
                    >
                        {isAdded ? <CheckIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                        <span>{isAdded ? 'In Your List' : 'Add to Plan to Watch'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
