// QUÉ HACE: Provee una interfaz para que el administrador inicie sesión.
// BENEFICIO: Protege el acceso al panel de administración.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { Lock, LogIn } from "lucide-react";

const LoginPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAppStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = login(password);
    if (success) {
      navigate("/admin"); // Redirige al panel de admin si el login es exitoso
    } else {
      setError("Contraseña incorrecta. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Acceso Admin
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              className="block text-white font-semibold mb-2"
              htmlFor="password"
            >
              <Lock className="inline h-5 w-5 mr-2" />
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-yellow-500 focus:ring-yellow-500/20"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors"
          >
            <LogIn className="h-5 w-5" />
            <span>Ingresar</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
