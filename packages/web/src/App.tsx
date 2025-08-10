import React, { useState, useMemo } from 'react';
import { AnimeProvider, useAnime } from './context/AnimeContext';
import { AnimeCard } from './components/AnimeCard';
import { StatCard } from './components/StatCard';
import { searchAnime } from './services/geminiService';
import { Anime, UserAnimeStatus } from './types';
import { Modal } from './components/Modal';
import { ImportModal } from './components/ImportModal';
import { PlusIcon, CheckIcon, TvIcon, BookOpenIcon, SearchIcon, UploadIcon } from './components/icons';

type View = 'dashboard' | 'add_anime' | 'full_list';

const App: React.FC = () => {
  return (
    <AnimeProvider>
      <MainApp />
    </AnimeProvider>
  );
};

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  return (
    <div className="min-h-screen bg-base-100 text-text-primary">
      <Header onNavigate={setCurrentView} currentView={currentView} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'add_anime' && <AddAnimeView onAnimeAdded={() => setCurrentView('dashboard')} />}
        {currentView === 'full_list' && <FullListView />}
      </main>
    </div>
  );
};

const Header: React.FC<{ onNavigate: (view: View) => void; currentView: View }> = ({ onNavigate, currentView }) => {
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const { addAnime } = useAnime();

  const handleImport = async (parsedAnimes: { title: string; watchedEpisodes: number; status: UserAnimeStatus; }[]) => {
    for (const pa of parsedAnimes) {
        const animeDetails = await searchAnime(pa.title);
        if(animeDetails) {
            addAnime(animeDetails, pa.status, pa.watchedEpisodes);
        } else {
            console.warn(`Could not find details for anime: ${pa.title}`);
        }
    }
    setImportModalOpen(false);
  };
    
  const NavLink: React.FC<{ view: View, children: React.ReactNode }> = ({ view, children }) => {
    const isActive = currentView === view;
    return (
        <button 
            onClick={() => onNavigate(view)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-text-secondary hover:bg-base-300 hover:text-white'}`}
        >
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
            <div className="hidden md:flex items-center space-x-4">
                <NavLink view="dashboard">Dashboard</NavLink>
                <NavLink view="full_list">My List</NavLink>
                <NavLink view="add_anime">Add Anime</NavLink>
            </div>
            <div className="flex items-center">
               <button onClick={() => setImportModalOpen(true)} className="flex items-center gap-2 bg-base-300 text-white px-3 py-2 rounded-md hover:bg-brand-secondary transition-colors text-sm font-medium">
                <UploadIcon className="w-4 h-4" />
                <span>Import</span>
               </button>
            </div>
          </div>
          {/* Mobile Nav */}
          <div className="md:hidden flex items-center justify-around py-2 border-t border-base-300">
             <NavLink view="dashboard">Dashboard</NavLink>
             <NavLink view="full_list">My List</NavLink>
             <NavLink view="add_anime">Add</NavLink>
          </div>
        </nav>
      </header>
      <ImportModal isOpen={isImportModalOpen} onClose={() => setImportModalOpen(false)} onImport={handleImport} />
    </>
  );
};

const Dashboard: React.FC = () => {
    const { animeList, isLoading, incrementAnimeProgress, removeAnime } = useAnime();

    const stats = useMemo(() => {
        const totalEpisodes = animeList.reduce((sum, anime) => sum + anime.watchedEpisodes, 0);
        const completedCount = animeList.filter(a => a.userStatus === UserAnimeStatus.Completed).length;
        return { totalEpisodes, completedCount };
    }, [animeList]);

    const watchingList = animeList.filter(a => a.userStatus === UserAnimeStatus.Watching);

    if (isLoading) return <div className="text-center p-10">Loading your list...</div>;

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
                        {watchingList.map(anime => (
                            <AnimeCard 
                                key={anime.id} 
                                anime={anime} 
                                onIncrement={incrementAnimeProgress}
                                onRemove={removeAnime}
                                onUpdateStatus={() => {}} // Not used on this card type
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
  const [results, setResults] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);

  const { addAnime, animeList } = useAnime();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsLoading(true);
    setError('');
    setResults([]);
    const result = await searchAnime(query);
    setIsLoading(false);
    if (result) {
      setResults([result]);
    } else {
      setError('Could not find an anime matching that title. Try being more specific.');
    }
  };
  
  const handleAddClick = (anime: Anime) => {
    setSelectedAnime(anime);
    setIsModalOpen(true);
  };
  
  const handleConfirmAdd = (status: UserAnimeStatus) => {
    if (selectedAnime) {
      const success = addAnime(selectedAnime, status);
      if (success) {
          onAnimeAdded();
      }
    }
    setIsModalOpen(false);
    setSelectedAnime(null);
  };
  
  const isAnimeInList = (animeId: number) => animeList.some(a => a.id === animeId);

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
            <button type="submit" className="bg-brand-primary text-white px-6 py-3 rounded-lg hover:bg-brand-primary/80 transition-colors flex items-center justify-center" disabled={isLoading}>
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <SearchIcon className="w-6 h-6" />}
            </button>
        </form>

        {error && <p className="text-center text-red-400">{error}</p>}
        
        <div className="space-y-4">
            {results.map(anime => (
                <div key={anime.id} className="bg-base-200 p-4 rounded-lg flex items-start sm:items-center gap-4 flex-col sm:flex-row">
                    <img src={anime.coverImageUrl} alt={anime.title} className="w-24 h-36 object-cover rounded-md flex-shrink-0"/>
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold">{anime.title}</h3>
                        <p className="text-sm text-text-secondary mt-1 line-clamp-3">{anime.synopsis}</p>
                    </div>
                    <button 
                        onClick={() => handleAddClick(anime)}
                        disabled={isAnimeInList(anime.id)}
                        className="w-full sm:w-auto flex-shrink-0 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 transition disabled:bg-base-300 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                    >
                       {isAnimeInList(anime.id) ? <CheckIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                       <span>{isAnimeInList(anime.id) ? 'Added' : 'Add to List'}</span>
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
    const { animeList, isLoading, incrementAnimeProgress, removeAnime } = useAnime();
    const [filter, setFilter] = useState<UserAnimeStatus | 'ALL'>('ALL');
    const [sort, setSort] = useState<'updatedAt' | 'title'>('updatedAt');

    const filteredAndSortedList = useMemo(() => {
        return animeList
            .filter(anime => filter === 'ALL' || anime.userStatus === filter)
            .sort((a, b) => {
                if (sort === 'title') {
                    return a.title.localeCompare(b.title);
                }
                return b.updatedAt - a.updatedAt; // 'updatedAt' descending
            });
    }, [animeList, filter, sort]);
    
    const statusOptions: (UserAnimeStatus | 'ALL')[] = ['ALL', UserAnimeStatus.Watching, UserAnimeStatus.Completed, UserAnimeStatus.Planned, UserAnimeStatus.Paused, UserAnimeStatus.Dropped];

    if (isLoading) return <div className="text-center p-10">Loading your list...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-base-200 p-4 rounded-lg flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex flex-wrap gap-2">
                    {statusOptions.map(status => (
                        <button key={status} onClick={() => setFilter(status)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${filter === status ? 'bg-brand-primary text-white' : 'bg-base-300 hover:bg-base-300/70'}`}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
                 <div className="flex gap-2 items-center">
                    <span className="text-sm text-text-secondary">Sort by:</span>
                    <select value={sort} onChange={e => setSort(e.target.value as 'updatedAt' | 'title')} className="bg-base-300 rounded-md p-2 border border-transparent focus:ring-2 focus:ring-brand-primary">
                        <option value="updatedAt">Last Updated</option>
                        <option value="title">Title</option>
                    </select>
                </div>
            </div>
            {filteredAndSortedList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredAndSortedList.map(anime => (
                        <AnimeCard 
                            key={anime.id} 
                            anime={anime} 
                            onIncrement={incrementAnimeProgress}
                            onRemove={removeAnime}
                            onUpdateStatus={() => {}} // Not used here
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

export default App;