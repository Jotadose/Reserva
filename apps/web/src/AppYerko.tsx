/**
 * APLICACIÓN PRINCIPAL YERKO - Sistema de Reservas Individual
 *
 * Este es el componente raíz personalizado para Yerko que maneja:
 * - Autenticación con Supabase Auth
 * - Sistema de reservas simplificado (sin selección de barbero)
 * - Panel de administración personalizado
 * - Branding específico de Barbería Yerko
 *
 * Diseñado específicamente para el plan individual
 */

import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import {
  Scissors,
  Menu,
  X,
  Instagram,
  MessageCircle,
  Phone,
  Mail
} from 'lucide-react'

// Providers
import { ToastProvider } from './contexts/ToastContext'
import { AuthProvider } from './hooks/useAuthIndividual'

// Components
import { LoginIndividual } from './components/auth/LoginIndividual'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import AdminPanelYerko from './components/AdminPanelYerko'
import BookingSystemYerko from './components/BookingSystemYerko'
import LandingPageYerko from './components/LandingPageYerko'

// Data
import { YERKO_CONTACT } from './data/yerkoServices'

function AppYerko() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Routes>
              {/* Ruta de login */}
              <Route path="/login" element={<LoginIndividual />} />
              
              {/* Ruta del admin protegida */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute>
                    <AdminPanelYerko />
                  </ProtectedRoute>
                } 
              />
              
              {/* Ruta de reservas */}
              <Route path="/reservar" element={<BookingSystemYerko />} />
              
              {/* Landing page */}
              <Route path="/" element={<LandingPageYerko />} />
              
              {/* Redirect por defecto */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  )
}

export default AppYerko