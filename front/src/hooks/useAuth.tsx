import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
    id: string;
    email: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

    useEffect(() => {
        // Ne vérifier l'auth que si on n'a pas déjà un utilisateur et qu'on n'a pas encore vérifié
        if (!user && !hasCheckedAuth) {
            const checkAuth = async () => {
                try {
                    const { data } = await axios.get(`${API_BASE_URL}/auth/me`, {
                        withCredentials: true
                    });
                    if (data.success && data.user) {
                        setUser(data.user);
                    }
                } catch (error) {
                    // Utilisateur non connecté
                    setUser(null);
                } finally {
                    setIsLoading(false);
                    setHasCheckedAuth(true);
                }
            };

            checkAuth();
        } else if (user) {
            // Si on a déjà un utilisateur (défini manuellement), arrêter le loading
            setIsLoading(false);
            setHasCheckedAuth(true);
        }
    }, [user, hasCheckedAuth]);

    const customSetUser = (newUser: User | null) => {
        setUser(newUser);
        setIsLoading(false);
        setHasCheckedAuth(true);
    };

    return (
        <AuthContext.Provider value={{ user, setUser: customSetUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
