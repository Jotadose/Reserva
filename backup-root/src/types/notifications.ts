export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "booking" | "reminder" | "payment";
  priority: "low" | "medium" | "high" | "urgent";
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  data?: any;
  createdAt: string;
  expiresAt?: string;
  userId?: string;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    newBookings: boolean;
    cancelations: boolean;
    reminders: boolean;
    payments: boolean;
  };
  push: {
    enabled: boolean;
    newBookings: boolean;
    cancelations: boolean;
    reminders: boolean;
    payments: boolean;
  };
  sms: {
    enabled: boolean;
    newBookings: boolean;
    cancelations: boolean;
    reminders: boolean;
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
}

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  createdAt: string;
  isActive: boolean;
}
