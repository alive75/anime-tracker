import { GoogleGenAI, Type } from "@google/genai";
import { Anime, AiringStatus, UserAnimeStatus } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const animeSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.NUMBER, description: "A unique integer ID, e.g., from an anime database like MyAnimeList. Generate a random high integer if not available." },
    title: { type: Type.STRING, description: "The primary title of the anime series." },
    synopsis: { type: Type.STRING, description: "A brief summary of the anime's plot. Should be around 2-3 sentences." },
    totalEpisodes: { type: Type.NUMBER, description: "The total number of episodes. If ongoing, provide the currently known total." },
    airingStatus: { type: Type.STRING, description: "The current airing status.", enum: Object.values(AiringStatus) },
    coverImageUrl: { type: Type.STRING, description: "A placeholder image URL from picsum.photos, e.g., 'https://picsum.photos/400/600'." },
    nextAiringEpisodeAt: { type: Type.STRING, description: "The ISO 8601 timestamp for the next episode's air date, or null if not applicable." },
  },
  required: ["id", "title", "synopsis", "totalEpisodes", "airingStatus", "coverImageUrl"],
};

export const searchAnime = async (query: string): Promise<Anime | null> => {
  try {
    const prompt = `Find information for the anime titled "${query}". Provide details including a synopsis, total episodes, airing status, and a placeholder image URL. If the anime is currently releasing, estimate a plausible air date for the next episode. Return the result as a single JSON object that conforms to the specified schema.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: animeSchema
        }
    });

    const text = response.text.trim();
    const parsed = JSON.parse(text) as Anime;
    // ensure nextAiringEpisodeAt is null if not releasing
    if (parsed.airingStatus !== AiringStatus.Releasing) {
        parsed.nextAiringEpisodeAt = null;
    }
    return parsed;
  } catch (error) {
    console.error("Error searching for anime:", error);
    return null;
  }
};


const CsvParseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "The title of the anime." },
            watchedEpisodes: { type: Type.NUMBER, description: "The number of episodes the user has watched." },
            status: { type: Type.STRING, description: "The user's viewing status for the anime.", enum: Object.values(UserAnimeStatus) },
        },
        required: ["title", "watchedEpisodes", "status"],
    },
};

export const parseAnimeCsv = async (csvText: string): Promise<{ title: string; watchedEpisodes: number; status: UserAnimeStatus; }[]> => {
    try {
        const prompt = `Parse the following CSV data. The expected columns are 'anime_title', 'watched_episodes', and 'status'. Convert the data into a JSON array of objects. Each object should have 'title', 'watchedEpisodes', and 'status' properties. The status must be one of the following: ${Object.values(UserAnimeStatus).join(', ')}.
        
        CSV Data:
        """
        ${csvText}
        """
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: CsvParseSchema
            }
        });
        
        const text = response.text.trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Error parsing CSV data:", error);
        return [];
    }
};