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
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-800 bg-black/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <button
                onClick={() => setView("landing")}
                className="text-2xl font-bold text-yellow-500 transition-colors hover:text-yellow-400"
              >
                MICHAEL THE BARBER
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-8 md:flex">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={item.onClick}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-yellow-500 text-black"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
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
                  className="px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"
                >
                  Cerrar Sesión
                </button>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-400 transition-colors hover:text-white focus:text-white focus:outline-none"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-800 bg-black/95 md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      item.onClick();
                      toggleMobileMenu();
                    }}
                    className={`flex w-full items-center space-x-3 rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                      item.active
                        ? "bg-yellow-500 text-black"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
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
                  className="flex w-full items-center space-x-3 px-3 py-3 text-base font-medium text-gray-400 transition-colors hover:text-white"
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
          <div className="mx-4 w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Acceso Admin</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="Ingresa la contraseña"
                  required
                />
                {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-yellow-500 py-2 font-semibold text-black transition-colors hover:bg-yellow-400"
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
                  className="flex-1 rounded-lg bg-gray-700 py-2 font-semibold text-white transition-colors hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>

            <p className="mt-3 text-center text-xs text-gray-400">Pista: admin123</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
