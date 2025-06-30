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
            const { data } = await axios.post<RegisterResponse>(`${API_BASE_URL}/register`, credentials);
            return data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || "Une erreur est survenue lors de l'inscription"
            );
        }
    }
};
