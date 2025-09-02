import React, {
  useState,
  useCallback,
  useContext,
  createContext,
  ReactNode,
} from "react";
import { User, UserRole, Permission, ROLES, AuditLog } from "../types/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  hasPermission: (permissionId: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  auditLogs: AuditLog[];
  addAuditLog: (
    action: string,
    resource: string,
    resourceId: string,
    changes?: any[]
  ) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user para desarrollo
const MOCK_USER: User = {
  id: "1",
  name: "Michael García",
  email: "michael@barberstudio.com",
  phone: "+56 9 1234 5678",
  role: "super-admin",
  isActive: true,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  avatar: "/avatars/michael.jpg",
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(MOCK_USER); // En desarrollo, iniciar logueado
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const isAuthenticated = user !== null;

  const hasPermission = useCallback(
    (permissionId: string): boolean => {
      if (!user) return false;

      const userRole = ROLES.find((role) => role.id === user.role);
      if (!userRole) return false;

      return userRole.permissions.some(
        (permission) => permission.id === permissionId
      );
    },
    [user]
  );

  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return user?.role === role;
    },
    [user]
  );

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      // Simular autenticación
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email === "admin@barberstudio.com" && password === "admin123") {
        const loggedUser = { ...MOCK_USER };
        setUser(loggedUser);

        addAuditLog("login", "auth", "session", []);

        return loggedUser;
      }

      throw new Error("Credenciales inválidas");
    },
    []
  );

  const logout = useCallback(() => {
    if (user) {
      addAuditLog("logout", "auth", "session", []);
    }
    setUser(null);
  }, [user]);

  const updateUserRole = useCallback(
    async (userId: string, newRole: UserRole): Promise<void> => {
      if (!hasPermission("users.manage")) {
        throw new Error("No tienes permisos para modificar roles de usuario");
      }

      // Simular API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (user && user.id === userId) {
        const oldRole = user.role;
        setUser((prev) => (prev ? { ...prev, role: newRole } : null));

        addAuditLog("update_role", "users", userId, [
          { field: "role", oldValue: oldRole, newValue: newRole },
        ]);
      }
    },
    [user, hasPermission]
  );

  const addAuditLog = useCallback(
    (
      action: string,
      resource: string,
      resourceId: string,
      changes: any[] = []
    ) => {
      if (!user) return;

      const logEntry: AuditLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        userName: user.name,
        action,
        resource,
        resourceId,
        changes,
        timestamp: new Date().toISOString(),
        ipAddress: "192.168.1.100", // Mock IP
        userAgent: navigator.userAgent,
      };

      setAuditLogs((prev) => [logEntry, ...prev].slice(0, 1000)); // Mantener últimas 1000 entradas
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        hasPermission,
        hasRole,
        login,
        logout,
        updateUserRole,
        auditLogs,
        addAuditLog,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
