/**
 * ===================================================================
 * SISTEMA DE NOTIFICACIONES PROFESIONAL
 * ===================================================================
 *
 * Sistema completo de notificaciones en tiempo real para el panel admin
 * con soporte para diferentes tipos de alertas y gestión de estados
 */

import React, { useState, useEffect, createContext, useContext } from "react";
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Badge, Button, Card } from "./ui";

// ===================================================================
// TIPOS Y INTERFACES
// ===================================================================

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority?: "low" | "medium" | "high";
  category?: "reserva" | "cliente" | "sistema" | "general";
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

// ===================================================================
// CONTEXTO DE NOTIFICACIONES
// ===================================================================

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};

// ===================================================================
// PROVIDER DE NOTIFICACIONES
// ===================================================================

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "info",
      title: "Nueva reserva",
      message: "Juan Pérez ha reservado un corte para mañana a las 14:00",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      category: "reserva",
      priority: "medium",
    },
    {
      id: "2",
      type: "warning",
      title: "Recordatorio",
      message: "Tienes 3 citas pendientes de confirmación",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      category: "reserva",
      priority: "high",
    },
    {
      id: "3",
      type: "success",
      title: "Pago recibido",
      message: "Se ha registrado un pago de $25.000 de Carlos Mendoza",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
      category: "general",
      priority: "low",
    },
  ]);

  const addNotification = (
    notificationData: Omit<Notification, "id" | "timestamp" | "read">
  ) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// ===================================================================
// COMPONENTE BOTÓN DE NOTIFICACIONES
// ===================================================================

export const NotificationButton: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return CheckCircle;
      case "error":
        return AlertCircle;
      case "warning":
        return AlertTriangle;
      case "info":
        return Info;
      default:
        return Info;
    }
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "info":
        return "text-blue-400";
      default:
        return "text-slate-400";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - timestamp.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <div className="relative">
      {/* Botón principal */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="danger"
            size="sm"
            className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </button>

      {/* Panel de notificaciones */}
      {showPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 z-50">
            <Card padding="none" variant="elevated">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div>
                  <h3 className="font-semibold text-white">Notificaciones</h3>
                  <p className="text-sm text-slate-400">
                    {unreadCount > 0
                      ? `${unreadCount} sin leer`
                      : "Todas leídas"}
                  </p>
                </div>

                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Marcar todas
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    onClick={() => setShowPanel(false)}
                  />
                </div>
              </div>

              {/* Lista de notificaciones */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-slate-700">
                    {notifications.map((notification) => {
                      const Icon = getIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-slate-700/30 transition-colors cursor-pointer ${
                            !notification.read ? "bg-slate-700/20" : ""
                          }`}
                          onClick={() =>
                            !notification.read && markAsRead(notification.id)
                          }
                        >
                          <div className="flex items-start gap-3">
                            {/* Icono */}
                            <div
                              className={`flex-shrink-0 mt-0.5 ${getTypeColor(
                                notification.type
                              )}`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>

                            {/* Contenido */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p
                                    className={`text-sm font-medium ${
                                      !notification.read
                                        ? "text-white"
                                        : "text-slate-300"
                                    }`}
                                  >
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1">
                                    {notification.message}
                                  </p>

                                  {/* Categoría y prioridad */}
                                  <div className="flex items-center gap-2 mt-2">
                                    {notification.category && (
                                      <Badge variant="secondary" size="sm">
                                        {notification.category}
                                      </Badge>
                                    )}
                                    {notification.priority === "high" && (
                                      <Badge variant="danger" size="sm">
                                        Alta
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Acción */}
                                  {notification.action && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-2"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        notification.action!.onClick();
                                      }}
                                    >
                                      {notification.action.label}
                                    </Button>
                                  )}
                                </div>

                                {/* Timestamp y acciones */}
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-xs text-slate-500">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeNotification(notification.id);
                                    }}
                                    className="text-slate-500 hover:text-slate-300 transition-colors"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>

                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400">No hay notificaciones</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => setShowPanel(false)}
                  >
                    Ver todas las notificaciones
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

// ===================================================================
// HOOK PARA SIMULAR NOTIFICACIONES EN TIEMPO REAL
// ===================================================================

export const useRealtimeNotifications = () => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Simular notificaciones automáticas
    const interval = setInterval(() => {
      const randomNotifications = [
        {
          type: "info" as const,
          title: "Nueva reserva",
          message: "Cliente ha realizado una nueva reserva",
          category: "reserva" as const,
          priority: "medium" as const,
        },
        {
          type: "success" as const,
          title: "Pago confirmado",
          message: "Se ha confirmado un pago pendiente",
          category: "general" as const,
          priority: "low" as const,
        },
        {
          type: "warning" as const,
          title: "Recordatorio",
          message: "Próxima cita en 15 minutos",
          category: "reserva" as const,
          priority: "high" as const,
        },
      ];

      if (Math.random() > 0.9) {
        // 10% de probabilidad cada 30 segundos
        const notification =
          randomNotifications[
            Math.floor(Math.random() * randomNotifications.length)
          ];
        addNotification(notification);
      }
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [addNotification]);
};
