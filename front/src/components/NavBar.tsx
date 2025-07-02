import { NavLink, useNavigate } from "react-router-dom";
import { FaUser, FaFilePdf, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/logo.svg";
import axios from "axios";

export default function NavBar() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
            await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
                withCredentials: true
            });
            setUser(null);
            navigate("/login");
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
            // Même en cas d'erreur, on déconnecte l'utilisateur côté client
            setUser(null);
            navigate("/login");
        }
    };

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center py-4 px-2">
                        <NavLink 
                            to="/" 
                            className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200 flex items-center gap-2"
                        >
                            <img src={logo} alt="Logo" className="w-40" />
                        </NavLink>
                    </div>
                    <div className="flex items-center space-x-1">
                        <NavLink 
                            to="/" 
                            className={({ isActive }) => 
                                `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' 
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <FaFilePdf className={isActive ? 'text-blue-600' : 'text-blue-500'} />
                                    PDF Summarizer
                                </>
                            )}
                        </NavLink>
                        <NavLink 
                            to="/profil" 
                            className={({ isActive }) => 
                                `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' 
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <FaUser className={isActive ? 'text-blue-600' : 'text-blue-500'} />
                                    {user?.username || 'Utilisateur'}
                                </>
                            )}
                        </NavLink>
                        <div className="ml-4 pl-4 border-l border-gray-200">
                            <button 
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
                                title="Se déconnecter"
                            >
                                <FaSignOutAlt className="text-white" />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}