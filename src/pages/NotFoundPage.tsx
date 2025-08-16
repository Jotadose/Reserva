// QUÉ HACE: Muestra una página de error 404 amigable cuando una URL no existe.
// BENEFICIO: Mejora la experiencia del usuario en caso de enlaces rotos o errores de tipeo.

import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => (
  <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-yellow-500 mb-4">404</h1>
      <p className="text-white text-xl mb-8">Página no encontrada</p>
      <Link
        to="/"
        className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
      >
        Volver al Inicio
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
