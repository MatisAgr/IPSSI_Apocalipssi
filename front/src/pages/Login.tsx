import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


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
            const { data } = await axios.post("http://localhost:3001/api/login", { email, password });
            localStorage.setItem("token", data.token);
            navigate("/");
        } catch (err: any) {
            setError(
                err.response.data.message || "Une erreur est survenue"
            );
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Connexion</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
                {error &&
                    <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                        {error}
                    </div>
                }
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-gray-300 rounded-md p-2" />
                <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
                <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="border border-gray-300 rounded-md p-2" />
                <button type="submit" disabled={isLoading} className="bg-blue-500 text-white p-2 rounded-md">
                    {isLoading ? "Connexion..." : "Se connecter"}
                </button>
            </form>
        </div>
    );
}