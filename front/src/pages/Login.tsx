import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "/vite.svg"; // même logo que la page d'accueil

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // si tu utilises les cookies
      });

      if (res.ok) {
        alert("Connexion réussie !");
        navigate("/"); // redirige vers la page principale
      } else {
        const err = await res.json();
        alert(err.message || "Erreur");
      }
    } catch (err) {
      alert("Erreur réseau");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 flex flex-col items-center">
      {/* En-tête */}
      <div className="flex items-center gap-2 mt-8 mb-4">
        <img src={logo} alt="logo" className="w-8 h-8" />
        <h1 className="text-2xl font-bold text-gray-800">
          Apocalipssi PDF Summarizer
        </h1>
      </div>

      {/* Formulaire de connexion */}
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Connexion
        </h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
