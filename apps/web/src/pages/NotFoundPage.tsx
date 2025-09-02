// QUÉ HACE: Muestra una página de error 404 amigable cuando una URL no existe.
// BENEFICIO: Mejora la experiencia del usuario en caso de enlaces rotos o errores de tipeo.

import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => (
  <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
    <div className="text-center">
      <h1 className="mb-4 text-6xl font-bold text-yellow-500">404</h1>
      <p className="mb-8 text-xl text-white">Página no encontrada</p>
      <Link
        to="/"
        className="rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black transition-colors hover:bg-yellow-400"
      >
        Volver al Inicio
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
