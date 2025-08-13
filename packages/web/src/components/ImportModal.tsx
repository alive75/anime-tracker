import React, { useState } from 'react';
import { Modal } from './Modal';
import { parseAnimeCsv } from '../services/geminiService';
import { UserAnimeStatus, JikanAnimeSearchResult } from '../types';
import api from '../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ParsedAnime {
  title: string;
  watchedEpisodes: number;
  status: UserAnimeStatus;
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onImport is no longer needed as the component handles its own mutations
}

const templateCsv = `anime_title,watched_episodes,status\n"Solo Leveling",12,COMPLETED\n"Frieren: Beyond Journey's End",28,COMPLETED\n"One Piece",100,WATCHING`;

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const [csvText, setCsvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedAnimes, setParsedAnimes] = useState<ParsedAnime[]>([]);
  const [error, setError] = useState('');
  
  const queryClient = useQueryClient();

  const addAnimeMutation = useMutation({
    mutationFn: (data: { animeApiId: number, status: UserAnimeStatus, watchedEpisodes: number }) => api.post('/list', data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['anime-list'] });
    },
    onError: (error) => {
        // Individual errors could be logged here
        console.error("Failed to import an anime:", error);
    }
  });

  const handleProcess = async () => {
    if (!csvText.trim()) {
      setError('Please paste your CSV data.');
      return;
    }
    setError('');
    setIsProcessing(true);
    const result = await parseAnimeCsv(csvText);
    setIsProcessing(false);
    if (result.length > 0) {
      setParsedAnimes(result);
    } else {
      setError('Failed to parse CSV data. Please check the format and try again.');
    }
  };

  const handleConfirmImport = async () => {
    setIsImporting(true);
    for (const pa of parsedAnimes) {
        try {
            const searchRes = await api.get<{ data: JikanAnimeSearchResult[] }>(`/anime/search?q=${encodeURIComponent(pa.title)}`);
            const animeResult = searchRes.data.data?.[0];
            if (animeResult) {
                await addAnimeMutation.mutateAsync({
                    animeApiId: animeResult.mal_id,
                    status: pa.status,
                    watchedEpisodes: pa.watchedEpisodes,
                });
            } else {
                 console.warn(`Could not find API details for anime: ${pa.title}`);
            }
        } catch(e) {
            console.error(`Error processing ${pa.title}:`, e);
        }
    }
    setIsImporting(false);
    handleClose();
  };
  
  const handleClose = () => {
    setCsvText('');
    setParsedAnimes([]);
    setError('');
    setIsProcessing(false);
    setIsImporting(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Anime from CSV">
      {parsedAnimes.length === 0 ? (
        <>
          <p className="text-text-secondary mb-2">Paste your data below. It should have columns: <code className="bg-base-300 p-1 rounded">anime_title</code>, <code className="bg-base-300 p-1 rounded">watched_episodes</code>, <code className="bg-base-300 p-1 rounded">status</code>.</p>
          <p className="text-text-secondary mb-4">Status can be: WATCHING, COMPLETED, PLANNED, DROPPED, PAUSED.</p>
          
          <button onClick={() => setCsvText(templateCsv)} className="text-sm text-brand-primary hover:underline mb-2">Use template</button>

          <textarea
            className="w-full h-40 p-2 bg-base-100 border border-base-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder='anime_title,watched_episodes,status\n"Your Anime",10,WATCHING'
            aria-label="CSV data input"
          />
          {error && <p className="text-red-400 mt-2">{error}</p>}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/80 transition disabled:bg-base-300"
            >
              {isProcessing ? 'Processing...' : 'Process Data'}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-text-secondary mb-4">We found {parsedAnimes.length} animes. Please confirm to import.</p>
          <div className="max-h-60 overflow-y-auto bg-base-100 p-2 rounded-md border border-base-300">
            {parsedAnimes.map((anime, index) => (
              <div key={index} className="flex justify-between items-center p-2 border-b border-base-300 last:border-b-0">
                <span className="font-semibold">{anime.title}</span>
                <span className="text-sm text-text-secondary">Eps: {anime.watchedEpisodes} | {anime.status}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-4">
             <button
              onClick={() => setParsedAnimes([])}
              className="bg-base-300 text-white px-4 py-2 rounded-md hover:bg-base-300/80 transition"
              disabled={isImporting}
            >
              Back
            </button>
            <button
              onClick={handleConfirmImport}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-600/80 transition"
              disabled={isImporting}
            >
              {isImporting ? 'Importing...' : 'Confirm Import'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};
