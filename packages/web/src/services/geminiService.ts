import { GoogleGenAI, Type } from "@google/genai";
import { UserAnimeStatus } from '../types';

// Use the Vite environment variable for the API key
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!geminiApiKey) {
    // This check is mostly for development; in production, Coolify will provide the variable.
    console.error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: geminiApiKey || '' });

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

        const text = response.text;
        if (!text) {
            console.error("Gemini response was empty for CSV parsing.");
            return [];
        }
        return JSON.parse(text.trim());
    } catch (error) {
        console.error("Error parsing CSV data:", error);
        return [];
    }
};

const RecommendationParseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "The exact title of the recommended anime." },
            reason: { type: Type.STRING, description: "A brief, one-sentence reason for the recommendation based on the user's list." },
        },
        required: ["title", "reason"],
    },
};

export interface AnimeRecommendation {
    title: string;
    reason: string;
}

export const getAnimeRecommendations = async (watchedTitles: string[]): Promise<AnimeRecommendation[]> => {
    if (watchedTitles.length === 0) {
        return [];
    }

    try {
        const prompt = `Based on this list of anime I have watched, please recommend 5 new anime for me.
        Provide the exact anime title and a brief, one-sentence reason for the recommendation.
        My watched list: ${watchedTitles.join(', ')}.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: RecommendationParseSchema,
                temperature: 0.8,
            }
        });

        const text = response.text;
        if (!text) {
            console.error("Gemini response was empty for recommendations.");
            return [];
        }
        return JSON.parse(text.trim());
    } catch (error) {
        console.error("Error getting anime recommendations:", error);
        return [];
    }
};
