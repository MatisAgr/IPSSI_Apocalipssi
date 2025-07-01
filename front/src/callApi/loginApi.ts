import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user?: {
        id: string;
        email: string;
        name?: string;
    };
}

export const loginApi = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        try {
            const { data } = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, credentials);
            return data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || "Une erreur est survenue lors de la connexion"
            );
        }
    }
};
