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
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900/50 p-8 backdrop-blur-sm">
        <h2 className="mb-6 text-center text-3xl font-bold text-white">Acceso Admin</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="mb-2 block font-semibold text-white" htmlFor="password">
              <Lock className="mr-2 inline h-5 w-5" />
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-center text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="flex w-full items-center justify-center space-x-2 rounded-xl bg-yellow-500 px-6 py-3 text-lg font-bold text-black transition-colors hover:bg-yellow-400"
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
