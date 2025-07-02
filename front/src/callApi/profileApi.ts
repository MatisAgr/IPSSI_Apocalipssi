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

export interface UserProfile {
  _id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/me`, {
      withCredentials: true,
    });
    
    if (response.data.success) {
      return response.data.user;
    } else {
      throw new Error(response.data.error || 'Erreur lors de la récupération du profil');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erreur de connexion au serveur');
  }
};

export const getUserHistory = async (): Promise<HistoryItem[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/history`, {
      withCredentials: true,
    });
    
    if (response.data.success) {
      return response.data.history;
    } else {
      throw new Error(response.data.error || 'Erreur lors de la récupération de l\'historique');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Erreur de connexion au serveur');
  }
};
