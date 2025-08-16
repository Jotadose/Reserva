// QUÉ HACE: Define la estructura visual principal de la página (Header, contenido, Footer).
// BENEFICIO: Centraliza el layout, evitando duplicación y facilitando cambios globales.

import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header"; // Asumiendo que Header.tsx está en la misma carpeta
import Footer from "./Footer"; // Asumiendo que Footer.tsx está en la misma carpeta

const Layout: React.FC = () => {
  const location = useLocation();
  // El footer solo se mostrará en la página de inicio.
  const showFooter = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* El 'pt-20' compensa la altura del header que es 'h-20' y 'fixed' */}
      <main className="flex-grow pt-20">
        {/* 'Outlet' es el marcador de posición donde React Router renderizará la ruta activa */}
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
