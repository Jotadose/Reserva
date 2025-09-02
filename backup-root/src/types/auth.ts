export type UserRole = "super-admin" | "admin" | "staff" | "readonly";

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: "create" | "read" | "update" | "delete" | "export" | "manage";
}

export interface Role {
  id: UserRole;
  name: string;
  description: string;
  permissions: Permission[];
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

// Definición de permisos por defecto
export const PERMISSIONS: Permission[] = [
  // Reservas
  {
    id: "bookings.create",
    name: "Crear Reservas",
    description: "Crear nuevas reservas",
    resource: "bookings",
    action: "create",
  },
  {
    id: "bookings.read",
    name: "Ver Reservas",
    description: "Ver lista de reservas",
    resource: "bookings",
    action: "read",
  },
  {
    id: "bookings.update",
    name: "Editar Reservas",
    description: "Modificar reservas existentes",
    resource: "bookings",
    action: "update",
  },
  {
    id: "bookings.delete",
    name: "Eliminar Reservas",
    description: "Cancelar/eliminar reservas",
    resource: "bookings",
    action: "delete",
  },
  {
    id: "bookings.export",
    name: "Exportar Reservas",
    description: "Exportar datos de reservas",
    resource: "bookings",
    action: "export",
  },

  // Clientes
  {
    id: "clients.create",
    name: "Crear Clientes",
    description: "Agregar nuevos clientes",
    resource: "clients",
    action: "create",
  },
  {
    id: "clients.read",
    name: "Ver Clientes",
    description: "Ver información de clientes",
    resource: "clients",
    action: "read",
  },
  {
    id: "clients.update",
    name: "Editar Clientes",
    description: "Modificar información de clientes",
    resource: "clients",
    action: "update",
  },
  {
    id: "clients.delete",
    name: "Eliminar Clientes",
    description: "Eliminar clientes del sistema",
    resource: "clients",
    action: "delete",
  },

  // Servicios
  {
    id: "services.create",
    name: "Crear Servicios",
    description: "Agregar nuevos servicios",
    resource: "services",
    action: "create",
  },
  {
    id: "services.read",
    name: "Ver Servicios",
    description: "Ver lista de servicios",
    resource: "services",
    action: "read",
  },
  {
    id: "services.update",
    name: "Editar Servicios",
    description: "Modificar servicios existentes",
    resource: "services",
    action: "update",
  },
  {
    id: "services.delete",
    name: "Eliminar Servicios",
    description: "Eliminar servicios del catálogo",
    resource: "services",
    action: "delete",
  },

  // Analytics
  {
    id: "analytics.read",
    name: "Ver Analytics",
    description: "Acceder a reportes y estadísticas",
    resource: "analytics",
    action: "read",
  },
  {
    id: "analytics.export",
    name: "Exportar Reportes",
    description: "Exportar reportes avanzados",
    resource: "analytics",
    action: "export",
  },

  // Configuración
  {
    id: "settings.read",
    name: "Ver Configuración",
    description: "Ver configuración del sistema",
    resource: "settings",
    action: "read",
  },
  {
    id: "settings.update",
    name: "Editar Configuración",
    description: "Modificar configuración del sistema",
    resource: "settings",
    action: "update",
  },

  // Usuarios
  {
    id: "users.create",
    name: "Crear Usuarios",
    description: "Agregar nuevos usuarios al sistema",
    resource: "users",
    action: "create",
  },
  {
    id: "users.read",
    name: "Ver Usuarios",
    description: "Ver lista de usuarios",
    resource: "users",
    action: "read",
  },
  {
    id: "users.update",
    name: "Editar Usuarios",
    description: "Modificar usuarios existentes",
    resource: "users",
    action: "update",
  },
  {
    id: "users.delete",
    name: "Eliminar Usuarios",
    description: "Eliminar usuarios del sistema",
    resource: "users",
    action: "delete",
  },
  {
    id: "users.manage",
    name: "Gestionar Usuarios",
    description: "Administración completa de usuarios",
    resource: "users",
    action: "manage",
  },
];

// Definición de roles por defecto
export const ROLES: Role[] = [
  {
    id: "super-admin",
    name: "Super Administrador",
    description: "Acceso completo a todas las funcionalidades",
    color: "bg-red-500",
    permissions: PERMISSIONS, // Todos los permisos
  },
  {
    id: "admin",
    name: "Administrador",
    description: "Gestión completa del negocio excepto usuarios",
    color: "bg-blue-500",
    permissions: PERMISSIONS.filter((p) => !p.id.startsWith("users.") || p.id === "users.read"),
  },
  {
    id: "staff",
    name: "Personal",
    description: "Gestión básica de reservas y clientes",
    color: "bg-green-500",
    permissions: PERMISSIONS.filter(
      (p) =>
        p.resource === "bookings" ||
        p.resource === "clients" ||
        (p.resource === "services" && p.action === "read") ||
        (p.resource === "analytics" && p.action === "read"),
    ),
  },
  {
    id: "readonly",
    name: "Solo Lectura",
    description: "Solo puede ver información, sin modificar",
    color: "bg-gray-500",
    permissions: PERMISSIONS.filter((p) => p.action === "read"),
  },
];
