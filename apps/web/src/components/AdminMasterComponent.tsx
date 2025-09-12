import React from "react";
import { AdminPanelModernized } from "./AdminPanelModernized";
import { AdminProvider } from "./admin/AdminContext";
import { AdminPanelAdvanced } from "./AdminPanelAdvanced";

/**
 * Componente principal para administración
 *
 * Proporciona:
 * - Panel modernizado unificado
 * - Contexto de administración
 * - Gestión completa del sistema
 */
export const AdminMasterComponent: React.FC = () => {
  return (
    <AdminProvider>
      <AdminPanelModernized />
    </AdminProvider>
  );
};

export default AdminMasterComponent;
