import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimeCard } from '../components/AnimeCard';
import { StatCard } from '../components/StatCard';
import { JikanAnimeSearchResult, UserAnime, UserAnimeStatus } from '../types';
import { Modal } from '../components/Modal';
import { ImportModal } from '../components/ImportModal';
import { PlusIcon, CheckIcon, TvIcon, BookOpenIcon, SearchIcon, UploadIcon, LogOutIcon, SparklesIcon } from '../components/icons';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { getAnimeRecommendations } from '../services/geminiService';
import { RecommendationCard } from '../components/RecommendationCard';

type View = 'dashboard' | 'add_anime' | 'full_list' | 'recommendations';

const TrackerPage: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');

    return (
        <>
            <Header onNavigate={setCurrentView} currentView={currentView} />
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {currentView === 'dashboard' && <Dashboard />}
                {currentView === 'add_anime' && <AddAnimeView onAnimeAdded={() => setCurrentView('full_list')} />}
                {currentView === 'full_list' && <FullListView />}
                {currentView === 'recommendations' && <RecommendationsView />}
            </main>
        </>
    );
};

const Header: React.FC<{ onNavigate: (view: View) => void; currentView: View }> = ({ onNavigate, currentView }) => {
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const { logout } = useAuth();

    const NavLink: React.FC<{ view: View, children: React.ReactNode, icon?: React.ReactNode }> = ({ view, children, icon }) => {
        const isActive = currentView === view;
        return (
            <button
                onClick={() => onNavigate(view)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${isActive ? 'bg-brand-primary text-white' : 'text-text-secondary hover:bg-base-300 hover:text-white'}`}
            >
                {icon}
                {children}
            </button>
        );
    };

    return (
        <>
            <header className="bg-base-200/80 backdrop-blur-sm sticky top-0 z-40 shadow-md">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <TvIcon className="h-8 w-8 text-brand-primary" />
                            <h1 className="text-xl font-bold ml-3">Anime Tracker</h1>
                        </div>
                        <div className="hidden md:flex items-center space-x-2">
                            <NavLink view="dashboard">Dashboard</NavLink>
                            <NavLink view="full_list">My List</NavLink>
                            <NavLink view="add_anime">Add Anime</NavLink>
                            <NavLink view="recommendations" icon={<SparklesIcon className="w-4 h-4 mr-1.5" />}>Recommendations</NavLink>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setImportModalOpen(true)} className="flex items-center gap-2 bg-base-300 text-white px-3 py-2 rounded-md hover:bg-brand-secondary transition-colors text-sm font-medium">
                                <UploadIcon className="w-4 h-4" />
                                <span className='hidden sm:inline'>Import</span>
                            </button>
                            <button onClick={logout} className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors p-2 rounded-full" title="Logout">
                                <LogOutIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    {/* Mobile Nav */}
                    <div className="md:hidden flex items-center justify-around py-2 border-t border-base-300">
                        <NavLink view="dashboard">Dashboard</NavLink>
                        <NavLink view="full_list">My List</NavLink>
                        <NavLink view="add_anime">Add</NavLink>
                        <NavLink view="recommendations">Recommend</NavLink>
                    </div>
                </nav>
            </header>
            <ImportModal isOpen={isImportModalOpen} onClose={() => setImportModalOpen(false)} />
        </>
    );
};

const Dashboard: React.FC = () => {
    const { data: animeList = [], isLoading: isListLoading } = useQuery<UserAnime[]>({
        queryKey: ['anime-list', 'ALL'],
        queryFn: () => api.get('/list').then(res => res.data),
    });

    const { data: watchingList = [], isLoading: isWatchingLoading } = useQuery<UserAnime[]>({
        queryKey: ['anime-list', UserAnimeStatus.Watching],
        queryFn: () => api.get(`/list?status=${UserAnimeStatus.Watching}`).then(res => res.data),
    });

    const stats = useMemo(() => {
        const totalEpisodes = animeList.reduce((sum, item) => sum + item.watchedEpisodes, 0);
        const completedCount = animeList.filter(a => a.userStatus === UserAnimeStatus.Completed).length;
        return { totalEpisodes, completedCount };
    }, [animeList]);


    if (isListLoading || isWatchingLoading) return <div className="text-center p-10">Loading your list...</div>;

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-bold mb-4">Stats</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Anime" value={animeList.length} icon={<BookOpenIcon className="w-8 h-8 text-white" />} />
                    <StatCard title="Completed" value={stats.completedCount} icon={<CheckIcon className="w-8 h-8 text-white" />} />
                    <StatCard title="Episodes Watched" value={stats.totalEpisodes} icon={<TvIcon className="w-8 h-8 text-white" />} />
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4">Currently Watching</h2>
                {watchingList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {watchingList.map(userAnime => (
                            <AnimeCard
                                key={userAnime.id}
                                userAnime={userAnime}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-base-200 rounded-lg">
                        <p className="text-text-secondary">You're not watching anything right now.</p>
                        <p className="text-sm text-base-300">Add an anime to get started!</p>
                    </div>
                )}
            </section>
        </div>
    );
};

const AddAnimeView: React.FC<{ onAnimeAdded: () => void }> = ({ onAnimeAdded }) => {
    const [query, setQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAnime, setSelectedAnime] = useState<JikanAnimeSearchResult | null>(null);

    const queryClient = useQueryClient();

    const { data: searchResults, isLoading: isSearchLoading, refetch: search, isError } = useQuery({
        queryKey: ['anime-search', query],
        queryFn: () => api.get<{ data: JikanAnimeSearchResult[] }>(`/anime/search?q=${query}`).then(res => res.data.data),
        enabled: false,
    });

    const { data: fullList = [] } = useQuery<UserAnime[]>({
        queryKey: ['anime-list', 'ALL'],
        queryFn: () => api.get('/list').then(res => res.data),
    });

    const addMutation = useMutation({
        mutationFn: (data: { animeApiId: number; status: UserAnimeStatus; }) => api.post('/list', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anime-list'] });
            onAnimeAdded();
        }
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;
        search();
    };

    const handleAddClick = (anime: JikanAnimeSearchResult) => {
        setSelectedAnime(anime);
        setIsModalOpen(true);
    };

    const handleConfirmAdd = (status: UserAnimeStatus) => {
        if (selectedAnime) {
            addMutation.mutate({ animeApiId: selectedAnime.mal_id, status });
        }
        setIsModalOpen(false);
        setSelectedAnime(null);
    };

    const isAnimeInList = (animeId: number) => fullList.some(item => item.anime.id === animeId);

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Add a New Anime</h2>
            <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search for an anime title..."
                    className="w-full px-4 py-3 bg-base-200 border-2 border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                />
                <button type="submit" className="bg-brand-primary text-white px-6 py-3 rounded-lg hover:bg-brand-primary/80 transition-colors flex items-center justify-center" disabled={isSearchLoading}>
                    {isSearchLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <SearchIcon className="w-6 h-6" />}
                </button>
            </form>

            {isError && <p className="text-center text-red-400">Could not find an anime matching that title. Try being more specific.</p>}

            <div className="space-y-4">
                {searchResults?.map(anime => (
                    <div key={anime.mal_id} className="bg-base-200 p-4 rounded-lg flex items-start sm:items-center gap-4 flex-col sm:flex-row">
                        <img src={anime.images.jpg.large_image_url} alt={anime.title} className="w-24 h-36 object-cover rounded-md flex-shrink-0" />
                        <div className="flex-grow">
                            <h3 className="text-xl font-bold">{anime.title}</h3>
                            <p className="text-sm text-text-secondary mt-1 line-clamp-3">{anime.synopsis}</p>
                        </div>
                        <button
                            onClick={() => handleAddClick(anime)}
                            disabled={isAnimeInList(anime.mal_id) || addMutation.isPending}
                            className="w-full sm:w-auto flex-shrink-0 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 transition disabled:bg-base-300 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                        >
                            {isAnimeInList(anime.mal_id) ? <CheckIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                            <span>{isAnimeInList(anime.mal_id) ? 'Added' : 'Add to List'}</span>
                        </button>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add "${selectedAnime?.title}"`}>
                <div>
                    <p className="text-text-secondary mb-4">Set an initial status for this anime.</p>
                    <div className="grid grid-cols-1 gap-3">
                        <button onClick={() => handleConfirmAdd(UserAnimeStatus.Watching)} className="w-full text-left p-3 rounded-md bg-base-300 hover:bg-brand-primary transition">Watching</button>
                        <button onClick={() => handleConfirmAdd(UserAnimeStatus.Planned)} className="w-full text-left p-3 rounded-md bg-base-300 hover:bg-brand-primary transition">Plan to Watch</button>
                        <button onClick={() => handleConfirmAdd(UserAnimeStatus.Completed)} className="w-full text-left p-3 rounded-md bg-base-300 hover:bg-brand-primary transition">Completed</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const FullListView: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState<UserAnimeStatus | 'ALL'>('ALL');
    const [genreFilter, setGenreFilter] = useState<string>('ALL');
    const [yearFilter, setYearFilter] = useState<number | 'ALL'>('ALL');
    const [sort, setSort] = useState<'updatedAt' | 'title'>('updatedAt');

    const { data: fullAnimeList = [] } = useQuery<UserAnime[]>({
        queryKey: ['anime-list', 'ALL_FOR_FILTERS'],
        queryFn: () => api.get('/list').then(res => res.data),
    });

    const { availableGenres, availableYears } = useMemo(() => {
        const genres = new Set<string>();
        const years = new Set<number>();
        fullAnimeList.forEach(item => {
            item.anime.genres?.forEach(g => genres.add(g));
            if (item.anime.releaseYear > 0) {
                years.add(item.anime.releaseYear);
            }
        });
        return {
            availableGenres: Array.from(genres).sort(),
            availableYears: Array.from(years).sort((a, b) => b - a)
        };
    }, [fullAnimeList]);

    const queryParams = new URLSearchParams();
    if (statusFilter !== 'ALL') queryParams.append('status', statusFilter);
    if (genreFilter !== 'ALL') queryParams.append('genre', genreFilter);
    if (yearFilter !== 'ALL') queryParams.append('year', String(yearFilter));

    const queryKey = ['anime-list', statusFilter, genreFilter, yearFilter];
    const { data: animeList = [], isLoading } = useQuery<UserAnime[]>({
        queryKey,
        queryFn: () => api.get(`/list?${queryParams.toString()}`).then(res => res.data),
    });

    const sortedList = useMemo(() => {
        return [...animeList].sort((a, b) => {
            if (sort === 'title') {
                return a.anime.title.localeCompare(b.anime.title);
            }
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
    }, [animeList, sort]);

    const statusOptions: (UserAnimeStatus | 'ALL')[] = ['ALL', UserAnimeStatus.Watching, UserAnimeStatus.Completed, UserAnimeStatus.Planned, UserAnimeStatus.Paused, UserAnimeStatus.Dropped];

    if (isLoading) return <div className="text-center p-10">Loading your list...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-base-200 p-4 rounded-lg flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                    {statusOptions.map(status => (
                        <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${statusFilter === status ? 'bg-brand-primary text-white' : 'bg-base-300 hover:bg-base-300/70'}`}>
                            {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
                        </button>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)} className="w-full sm:w-auto bg-base-300 rounded-md p-2 border border-transparent focus:ring-2 focus:ring-brand-primary">
                        <option value="ALL">All Genres</option>
                        {availableGenres.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <select value={yearFilter} onChange={e => setYearFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))} className="w-full sm:w-auto bg-base-300 rounded-md p-2 border border-transparent focus:ring-2 focus:ring-brand-primary">
                        <option value="ALL">All Years</option>
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select value={sort} onChange={e => setSort(e.target.value as 'updatedAt' | 'title')} className="w-full sm:w-auto bg-base-300 rounded-md p-2 border border-transparent focus:ring-2 focus:ring-brand-primary">
                        <option value="updatedAt">Last Updated</option>
                        <option value="title">Title</option>
                    </select>
                </div>
            </div>
            {sortedList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {sortedList.map(userAnime => (
                        <AnimeCard
                            key={userAnime.id}
                            userAnime={userAnime}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-base-200 rounded-lg">
                    <p className="text-xl text-text-secondary">No anime found for this filter.</p>
                </div>
            )}
        </div>
    );
};

const RecommendationsView: React.FC = () => {
    const [recommendations, setRecommendations] = useState<(JikanAnimeSearchResult & { reason: string })[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { data: animeList = [] } = useQuery<UserAnime[]>({
        queryKey: ['anime-list', 'ALL'],
        queryFn: () => api.get('/list').then(res => res.data),
    });

    const addMutation = useMutation({
        mutationFn: (data: { animeApiId: number; status: UserAnimeStatus; }) => api.post('/list', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anime-list'] });
        }
    });

    const generateRecommendations = async () => {
        setIsLoading(true);
        setError(null);
        setRecommendations([]);

        const watchedTitles = animeList
            .filter(item => item.userStatus === 'COMPLETED' || item.userStatus === 'WATCHING')
            .map(item => item.anime.title);

        if (watchedTitles.length < 3) {
            setError("Please add at least 3 anime to your 'Watching' or 'Completed' lists for better recommendations.");
            setIsLoading(false);
            return;
        }

        const geminiRecs = await getAnimeRecommendations(watchedTitles);
        if (!geminiRecs || geminiRecs.length === 0) {
            setError("Could not generate recommendations at this time. Please try again later.");
            setIsLoading(false);
            return;
        }

        const searchPromises = geminiRecs.map(async (rec) => {
            try {
                const searchRes = await api.get<{ data: JikanAnimeSearchResult[] }>(`/anime/search?q=${encodeURIComponent(rec.title)}&limit=1`);
                const animeDetails = searchRes.data.data?.[0];
                return animeDetails ? { ...animeDetails, reason: rec.reason } : null;
            } catch (e) {
                console.error(`Could not find details for ${rec.title}`, e);
                return null;
            }
        });

        const detailedRecs = (await Promise.all(searchPromises)).filter(Boolean) as (JikanAnimeSearchResult & { reason: string })[];
        setRecommendations(detailedRecs);
        setIsLoading(false);
    };

    const isAnimeInList = (animeId: number) => animeList.some(item => item.anime.id === animeId);

    const SkeletonCard = () => (
        <div className="bg-base-200 rounded-lg shadow-lg h-[28rem] animate-pulse">
            <div className="w-full h-64 bg-base-300"></div>
            <div className="p-4 space-y-4">
                <div className="h-4 bg-base-300 rounded w-3/4"></div>
                <div className="h-3 bg-base-300 rounded w-full"></div>
                <div className="h-10 bg-base-300 rounded w-full mt-4"></div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold">Finding Your Next Watch...</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    if (recommendations.length > 0) {
        return (
            <div className="space-y-6">
                <div className='flex justify-between items-center'>
                    <h2 className="text-3xl font-bold">Here Are Your Recommendations</h2>
                    <button
                        onClick={generateRecommendations}
                        className="flex items-center gap-2 bg-brand-secondary text-white px-4 py-2 rounded-md hover:bg-brand-secondary/80 transition-colors"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Regenerate
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map(rec => (
                        <RecommendationCard
                            key={rec.mal_id}
                            anime={rec}
                            onAdd={() => addMutation.mutate({ animeApiId: rec.mal_id, status: UserAnimeStatus.Planned })}
                            isAdding={addMutation.isPending && addMutation.variables?.animeApiId === rec.mal_id}
                            isAdded={isAnimeInList(rec.mal_id)}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="text-center py-12 sm:py-20 px-4">
            <div className="bg-base-200 max-w-3xl mx-auto p-8 rounded-2xl shadow-2xl border border-base-300">
                <SparklesIcon className="w-16 h-16 mx-auto text-brand-secondary" />
                <h2 className="text-3xl font-bold mt-4">Discover Your Next Favorite Anime</h2>
                <p className="text-text-secondary mt-2 max-w-2xl mx-auto">
                    Get personalized anime recommendations based on your watching history. Our AI will analyze your list to find shows you'll love.
                </p>
                <div className="mt-8">
                    <button
                        onClick={generateRecommendations}
                        disabled={isLoading}
                        className="bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-primary/80 transition-transform hover:scale-105 disabled:bg-base-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Analyzing Your List...' : 'Generate Recommendations'}
                    </button>
                    {animeList.length < 3 && <p className="text-yellow-400 text-sm mt-4">Tip: Add at least 3 anime to your 'Watching' or 'Completed' lists for the best results.</p>}
                    {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default TrackerPage;
