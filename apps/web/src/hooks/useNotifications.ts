import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
  ReactNode,
} from "react";
import {
  Notification as AppNotification,
  NotificationSettings,
  PushSubscription,
} from "../types/notifications";
import { useAuth } from "./useAuth";
import { useToast } from "../contexts/ToastContext";

interface NotificationContextType {
  notifications: AppNotification[];
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
    notification: Omit<AppNotification, "id" | "createdAt" | "isRead">
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
    newBookings: true,
    cancelations: true,
    reminders: true,
  },
  inApp: {
    enabled: true,
    sound: true,
    desktop: true,
  },
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const { user } = useAuth();
  const { showToast } = useToast();

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Check if notifications are supported
  useEffect(() => {
    const supported = "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(window.Notification.permission);
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) return "denied" as NotificationPermission;

    try {
      const result = await window.Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied" as NotificationPermission;
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    if (!isSupported || permission !== "granted") {
      return null;
    }

    try {
      // This is a placeholder for actual push subscription logic
      // In a real app, you would use the Push API here
      console.log("Subscribing to push notifications...");
      return null; // Return the subscription object in a real implementation
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      return null;
    }
  }, [isSupported, permission]);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async () => {
    try {
      // This is a placeholder for actual push unsubscription logic
      console.log("Unsubscribing from push notifications...");
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(
    (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    },
    []
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        isRead: true,
      }))
    );
  }, []);

  // Delete a notification
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Update notification settings
  const updateSettings = useCallback(
    (newSettings: Partial<NotificationSettings>) => {
      setSettings((prev) => ({
        ...prev,
        ...newSettings,
      }));

      // If push notifications are enabled, request permission
      if (newSettings.push?.enabled && permission !== "granted") {
        requestPermission();
      }
    },
    [permission, requestPermission]
  );

  // Send a notification
  const sendNotification = useCallback(
    (notification: Omit<AppNotification, "id" | "createdAt" | "isRead">) => {
      const newNotification: AppNotification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        isRead: false,
        priority: notification.priority || "medium",
        ...notification,
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Show toast for new notification
      showToast({
        title: notification.title,
        message: notification.message,
        type: notification.type === "error" ? "error" : "info",
        duration: 5000,
      });

      // If browser notifications are supported and enabled, show a browser notification
      if (
        isSupported &&
        permission === "granted" &&
        settings.push.enabled &&
        settings.push.newBookings && // Using a specific notification type
        (notification.type === "booking" || notification.type === "reminder")
      ) {
        try {
          new window.Notification(notification.title, {
            body: notification.message,
            icon: "/icons/icon-192x192.png",
          });
        } catch (error) {
          console.error("Error showing browser notification:", error);
        }
      }
    },
    [isSupported, permission, settings.push, showToast]
  );

  // Load notifications from API or local storage
  useEffect(() => {
    if (user) {
      // In a real app, you would fetch notifications from an API
      // This is just a placeholder
      const mockNotifications: AppNotification[] = [
        {
          id: "1",
          title: "Reserva confirmada",
          message: "Tu reserva para el corte de cabello ha sido confirmada.",
          type: "booking",
          priority: "high",
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          isRead: false,
          data: {
            bookingId: "123",
            service: "Corte de cabello",
            date: "2023-06-15T14:00:00",
          },
        },
        {
          id: "2",
          title: "Recordatorio de cita",
          message: "Tienes una cita mañana a las 2:00 PM.",
          type: "reminder",
          priority: "medium",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          isRead: true,
          data: {
            bookingId: "123",
            service: "Corte de cabello",
            date: "2023-06-15T14:00:00",
          },
        },
        {
          id: "3",
          title: "Oferta especial",
          message: "¡50% de descuento en tu próximo servicio de barba!",
          type: "info",
          priority: "low",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          isRead: false,
          data: {
            promoCode: "BARBA50",
            validUntil: "2023-06-30",
          },
        },
      ];

      setNotifications(mockNotifications);
    }
  }, [user]);

  // Demo: Add random notifications periodically (for testing only)
  useEffect(() => {
    if (!user) return;

    const randomNotifications = [
      {
        title: "Nuevo servicio disponible",
        message: "Prueba nuestro nuevo servicio de masaje facial.",
        type: "info" as AppNotification["type"],
        priority: "low" as AppNotification["priority"],
        data: {
          serviceId: "new-facial",
        },
      },
      {
        title: "Recordatorio de pago",
        message: "Tienes un pago pendiente de tu última visita.",
        type: "payment" as AppNotification["type"],
        priority: "high" as AppNotification["priority"],
        data: {
          amount: 25.99,
          dueDate: "2023-06-20",
        },
      },
      {
        title: "Encuesta de satisfacción",
        message: "¿Cómo calificarías tu última visita?",
        type: "info" as AppNotification["type"],
        priority: "medium" as AppNotification["priority"],
        data: {
          surveyId: "sat-123",
        },
      },
    ];

    const interval = setInterval(() => {
      // 10% chance of sending a notification
      if (Math.random() < 0.1) {
        const randomNotif =
          randomNotifications[
            Math.floor(Math.random() * randomNotifications.length)
          ];
        sendNotification(randomNotif);
      }
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [sendNotification, user]);

  const contextValue = {
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
  };

  return React.createElement(
    NotificationContext.Provider,
    { value: contextValue },
    children
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
