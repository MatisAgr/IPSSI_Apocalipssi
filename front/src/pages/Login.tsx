import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiMail, HiLockClosed, HiExclamationCircle, HiUserAdd } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";


import APP_NAME from "../constants/AppName";
import { FadeIn } from "../components/animations/FadeIn";
import { authApi } from "../callApi/authApi";

// TODO: Mettre le cookie en backend
import Cookies from "js-cookie";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Veuillez remplir tous les champs");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const data = await authApi.login({ email, password });
            Cookies.set("token", data.token);
            navigate("/");
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <FadeIn className="w-full max-w-md">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
                    <FadeIn delay={0.2}>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Connexion</h1>
                            <p className="text-gray-600">Connectez-vous à votre compte <br/><b>{APP_NAME}</b></p>
                        </div>
                    </FadeIn>
                    
                    <FadeIn delay={0.4}>
                        <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <HiExclamationCircle className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    {error}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Adresse email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <HiMail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                id="email"
                                type="email" 
                                placeholder="votre@email.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 outline-none"
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <HiLockClosed className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                id="password"
                                type="password" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 outline-none"
                                required
                            />
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <AiOutlineLoading3Quarters className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                Connexion en cours...
                            </>
                        ) : (
                            "Se connecter"
                        )}
                    </button>
                </form>
            </FadeIn>
                
                <FadeIn delay={0.6}>
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Pas encore de compte ? 
                            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium ml-1 inline-flex items-center">
                                <HiUserAdd className="h-4 w-4 mr-1" />
                                Créer un compte
                            </Link>
                        </p>
                    </div>
                </FadeIn>
            </div>
        </FadeIn>
        </div>
    );
}