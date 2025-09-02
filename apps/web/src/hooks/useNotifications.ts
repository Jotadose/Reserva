import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
  ReactNode,
} from "react";
import {
  Notification,
  NotificationSettings,
  PushSubscription,
} from "../types/notifications";
import { useAuth } from "./useAuth";
import { useToast } from "../contexts/ToastContext";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  isSupported: boolean;
  permission: NotificationPermission;

  // Actions
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;

  // Settings
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;

  // Push notifications
  requestPermission: () => Promise<NotificationPermission>;
  subscribeToPush: () => Promise<PushSubscription | null>;
  unsubscribeFromPush: () => Promise<void>;

  // Manual notifications
  sendNotification: (
    notification: Omit<Notification, "id" | "createdAt" | "isRead">
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const defaultSettings: NotificationSettings = {
  email: {
    enabled: true,
    newBookings: true,
    cancelations: true,
    reminders: true,
    payments: true,
  },
  push: {
    enabled: true,
    newBookings: true,
    cancelations: true,
    reminders: true,
    payments: true,
  },
  sms: {
    enabled: false,
    newBookings: false,
    cancelations: true,
    reminders: true,
  },
  inApp: {
    enabled: true,
    sound: true,
    desktop: true,
  },
};

// Notificaciones mock para desarrollo
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Nueva Reserva",
    message: "Juan Pérez ha agendado una cita para mañana a las 14:00",
    type: "booking",
    priority: "medium",
    isRead: false,
    actionUrl: "/admin/bookings/new-booking-123",
    actionText: "Ver Reserva",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutos atrás
  },
  {
    id: "2",
    title: "Recordatorio de Cita",
    message: "Carlos López tiene una cita en 1 hora (15:30)",
    type: "reminder",
    priority: "high",
    isRead: false,
    actionUrl: "/admin/bookings/booking-456",
    actionText: "Ver Detalles",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutos atrás
  },
  {
    id: "3",
    title: "Pago Recibido",
    message: "Se ha procesado el pago de $25.000 de Ana García",
    type: "payment",
    priority: "medium",
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
  },
  {
    id: "4",
    title: "Cancelación",
    message: "Roberto Silva ha cancelado su cita del viernes",
    type: "warning",
    priority: "medium",
    isRead: false,
    actionUrl: "/admin/bookings/cancelled",
    actionText: "Ver Cancelaciones",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 horas atrás
  },
];

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [settings, setSettings] =
    useState<NotificationSettings>(defaultSettings);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  const { user, addAuditLog } = useAuth();
  const { addToast } = useToast();

  // Verificar soporte de notificaciones
  const isSupported = "Notification" in window && "serviceWorker" in navigator;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Inicializar estado de permisos
  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  // Solicitar permisos de notificación
  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!isSupported) {
        throw new Error(
          "Las notificaciones no son soportadas en este navegador"
        );
      }

      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        addToast({
          type: "success",
          title: "Notificaciones Habilitadas",
          message: "Ahora recibirás notificaciones en tiempo real",
        });

        addAuditLog("enable_notifications", "settings", "notifications", []);
      }

      return result;
    }, [isSupported, addToast, addAuditLog]);

  // Enviar notificación
  const sendNotification = useCallback(
    (notificationData: Omit<Notification, "id" | "createdAt" | "isRead">) => {
      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        isRead: false,
        ...notificationData,
      };

      setNotifications((prev) => [notification, ...prev]);

      // Mostrar notificación del navegador si está habilitado
      if (settings.inApp.enabled && permission === "granted") {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
          tag: notification.id,
          data: notification.data,
          requireInteraction: notification.priority === "urgent",
        });

        // Reproducir sonido si está habilitado
        if (settings.inApp.sound) {
          const audio = new Audio("/sounds/notification.mp3");
          audio.play().catch(() => {}); // Ignorar errores de audio
        }

        // Auto-cerrar notificación después de 5 segundos (excepto urgentes)
        if (notification.priority !== "urgent") {
          setTimeout(() => {
            browserNotification.close();
          }, 5000);
        }

        // Manejar click en notificación
        browserNotification.onclick = () => {
          window.focus();
          if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
          }
          browserNotification.close();
        };
      }

      // También mostrar toast in-app
      addToast({
        type:
          notification.type === "error"
            ? "error"
            : notification.type === "warning"
            ? "warning"
            : notification.type === "success"
            ? "success"
            : "info",
        title: notification.title,
        message: notification.message,
      });

      addAuditLog("send_notification", "notifications", notification.id, [
        { field: "type", oldValue: null, newValue: notification.type },
        { field: "priority", oldValue: null, newValue: notification.priority },
      ]);
    },
    [settings, permission, addToast, addAuditLog]
  );

  // Marcar como leída
  const markAsRead = useCallback(
    (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );

      addAuditLog(
        "mark_notification_read",
        "notifications",
        notificationId,
        []
      );
    },
    [addAuditLog]
  );

  // Marcar todas como leídas
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addAuditLog("mark_all_notifications_read", "notifications", "all", []);
  }, [addAuditLog]);

  // Eliminar notificación
  const deleteNotification = useCallback(
    (notificationId: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      addAuditLog("delete_notification", "notifications", notificationId, []);
    },
    [addAuditLog]
  );

  // Limpiar todas
  const clearAll = useCallback(() => {
    setNotifications([]);
    addAuditLog("clear_all_notifications", "notifications", "all", []);
  }, [addAuditLog]);

  // Actualizar configuración
  const updateSettings = useCallback(
    (newSettings: Partial<NotificationSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
      addAuditLog("update_notification_settings", "settings", "notifications", [
        {
          field: "settings",
          oldValue: settings,
          newValue: { ...settings, ...newSettings },
        },
      ]);
    },
    [settings, addAuditLog]
  );

  // Suscribirse a push notifications
  const subscribeToPush =
    useCallback(async (): Promise<PushSubscription | null> => {
      if (!isSupported || !("serviceWorker" in navigator)) {
        throw new Error("Push notifications no son soportadas");
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY, // Configurar en .env
        });

        // Aquí enviarías la suscripción al servidor
        const pushSub: PushSubscription = {
          id: `push_${Date.now()}`,
          userId: user?.id || "",
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(
              String.fromCharCode(
                ...new Uint8Array(subscription.getKey("p256dh")!)
              )
            ),
            auth: btoa(
              String.fromCharCode(
                ...new Uint8Array(subscription.getKey("auth")!)
              )
            ),
          },
          userAgent: navigator.userAgent,
          createdAt: new Date().toISOString(),
          isActive: true,
        };

        addToast({
          type: "success",
          title: "Push Notifications Habilitadas",
          message:
            "Recibirás notificaciones incluso cuando el sitio esté cerrado",
        });

        return pushSub;
      } catch (error) {
        console.error("Error subscribing to push notifications:", error);
        addToast({
          type: "error",
          title: "Error",
          message: "No se pudieron habilitar las push notifications",
        });
        return null;
      }
    }, [isSupported, user, addToast]);

  // Desuscribirse de push notifications
  const unsubscribeFromPush = useCallback(async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        addToast({
          type: "info",
          title: "Push Notifications Deshabilitadas",
          message: "Ya no recibirás notificaciones push",
        });
      }
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
    }
  }, [isSupported, addToast]);

  // Simular notificaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        // 10% de probabilidad cada 30 segundos
        const randomNotifications = [
          {
            title: "Nueva Reserva Online",
            message: `${
              ["María González", "Pedro Ruiz", "Sofia Martín"][
                Math.floor(Math.random() * 3)
              ]
            } ha agendado una cita`,
            type: "booking" as const,
            priority: "medium" as const,
          },
          {
            title: "Recordatorio de Cita",
            message: "Tienes una cita en 30 minutos",
            type: "reminder" as const,
            priority: "high" as const,
          },
          {
            title: "Meta Diaria Alcanzada",
            message:
              "¡Felicitaciones! Has alcanzado tu meta de ingresos del día",
            type: "success" as const,
            priority: "low" as const,
          },
        ];

        const randomNotif =
          randomNotifications[
            Math.floor(Math.random() * randomNotifications.length)
          ];
        sendNotification(randomNotif);
      }
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [sendNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        settings,
        isSupported,
        permission,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        updateSettings,
        requestPermission,
        subscribeToPush,
        unsubscribeFromPush,
        sendNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
