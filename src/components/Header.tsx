// src/components/layout/Header.tsx
// QUÉ HACE: Header navigation component que se conecta al store
// BENEFICIO: Navigation consistente, responsive, integrado con el estado global

import React, { useState } from "react";
import { Menu, X, Calendar, Settings, Home } from "lucide-react";
import { useAppStore } from "../../store/appStore";

const Header: React.FC = () => {
  const {
    currentView,
    setView,
    startBookingProcess,
    mobileMenuOpen,
    toggleMobileMenu,
    isAuthenticated,
    logout,
  } = useAppStore();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAppStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (success) {
      setShowLoginModal(false);
      setPassword("");
      setError("");
    } else {
      setError("Contraseña incorrecta");
    }
  };

  const handleAdminClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setView("admin");
    }
  };

  const navigation = [
    {
      name: "Inicio",
      onClick: () => setView("landing"),
      icon: Home,
      active: currentView === "landing",
    },
    {
      name: "Reservar",
      onClick: startBookingProcess,
      icon: Calendar,
      active: currentView === "booking",
    },
    {
      name: "Admin",
      onClick: handleAdminClick,
      icon: Settings,
      active: currentView === "admin",
    },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <button
                onClick={() => setView("landing")}
                className="text-2xl font-bold text-yellow-500 hover:text-yellow-400 transition-colors"
              >
                MICHAEL THE BARBER
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={item.onClick}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-yellow-500 text-black"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}

              {isAuthenticated && (
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-white text-sm font-medium transition-colors px-3 py-2"
                >
                  Cerrar Sesión
                </button>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-400 hover:text-white focus:outline-none focus:text-white transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      item.onClick();
                      toggleMobileMenu();
                    }}
                    className={`flex items-center space-x-3 w-full px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                      item.active
                        ? "bg-yellow-500 text-black"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}

              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    toggleMobileMenu();
                  }}
                  className="flex items-center space-x-3 w-full px-3 py-3 text-gray-400 hover:text-white text-base font-medium transition-colors"
                >
                  <span>Cerrar Sesión</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Acceso Admin</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Ingresa la contraseña"
                  required
                />
                {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-500 text-black font-semibold py-2 rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setPassword("");
                    setError("");
                  }}
                  className="flex-1 bg-gray-700 text-white font-semibold py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-400 mt-3 text-center">
              Pista: admin123
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
