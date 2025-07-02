import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export interface HistoryItem {
    _id: string;
    userId: string;
    action: string;
    resume?: string;
    metadata?: any;
    createdAt: string;
}

export const getHistory = async (): Promise<HistoryItem[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/history`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data.history || [];
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique:', error);
        throw error;
    }
};
