import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    message: string;
    user?: {
        id: string;
        email: string;
    };
}

export const registerApi = {
    register: async (credentials: RegisterRequest): Promise<RegisterResponse> => {
        try {
            console.log('Envoi de la requête d\'inscription:', { ...credentials, password: '[MASQUÉ]' });
            const { data } = await axios.post<RegisterResponse>(`${API_BASE_URL}/auth/register`, credentials);
            console.log('Réponse reçue:', data);
            return data;
        } catch (error: any) {
            console.error('Erreur complète:', error);
            console.error('Réponse d\'erreur:', error.response?.data);
            console.error('Status:', error.response?.status);
            console.error('Headers:', error.response?.headers);
            
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.message || 
                                "Une erreur est survenue lors de l'inscription";
            
            throw new Error(errorMessage);
        }
    }
};
