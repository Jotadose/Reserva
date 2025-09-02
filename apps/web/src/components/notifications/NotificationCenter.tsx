import React from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const NotificationCenter: React.FC = () => {
  const {
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
  } = useNotifications();

  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"notifications" | "settings">("notifications");

  // Helper functions to reduce complexity
  const getPermissionStatusStyles = (permission: NotificationPermission) => {
    if (permission === "granted") return "bg-green-50 border border-green-200";
    if (permission === "denied") return "bg-red-50 border border-red-200";
    return "bg-yellow-50 border border-yellow-200";
  };

  const getPermissionStatusText = (permission: NotificationPermission) => {
    if (permission === "granted") return "✅ Notificaciones habilitadas";
    if (permission === "denied") return "❌ Notificaciones denegadas";
    return "⚠️ Permisos pendientes";
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return (
          <div className="rounded-full bg-blue-100 p-2">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        );
      case "payment":
        return (
          <div className="rounded-full bg-green-100 p-2">
            <svg
              className="h-5 w-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
        );
      case "reminder":
        return (
          <div className="rounded-full bg-yellow-100 p-2">
            <svg
              className="h-5 w-5 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className="rounded-full bg-orange-100 p-2">
            <svg
              className="h-5 w-5 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="rounded-full bg-red-100 p-2">
            <svg
              className="h-5 w-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="rounded-full bg-gray-100 p-2">
            <svg
              className="h-5 w-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500";
      case "high":
        return "border-l-orange-500";
      case "medium":
        return "border-l-blue-500";
      case "low":
        return "border-l-gray-500";
      default:
        return "border-l-gray-300";
    }
  };

  return (
    <div className="relative">
      {/* Botón de Notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5 5v-5zM4 7h16l-7-4L4 7zm0 6h16v6H4v-6z"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de Notificaciones */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-96 rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-3 flex space-x-4">
              <button
                onClick={() => setActiveTab("notifications")}
                className={`border-b-2 pb-2 text-sm font-medium ${
                  activeTab === "notifications"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Notificaciones ({unreadCount})
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`border-b-2 pb-2 text-sm font-medium ${
                  activeTab === "settings"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Configuración
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === "notifications" ? (
              <div>
                {/* Actions */}
                {notifications.length > 0 && (
                  <div className="flex space-x-2 border-b border-gray-100 p-3">
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Marcar todas como leídas
                    </button>
                    <span className="text-gray-300">|</span>
                    <button onClick={clearAll} className="text-sm text-red-600 hover:text-red-800">
                      Limpiar todas
                    </button>
                  </div>
                )}

                {/* Notifications List */}
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <svg
                      className="mx-auto mb-3 h-12 w-12 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-5 5v-5zM4 7h16l-7-4L4 7zm0 6h16v6H4v-6z"
                      />
                    </svg>
                    <p>No tienes notificaciones</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        className={`w-full border-l-4 p-4 text-left hover:bg-gray-50 ${getPriorityColor(notification.priority)} ${
                          !notification.isRead ? "bg-blue-50" : ""
                        }`}
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsRead(notification.id);
                          }
                          if (notification.actionUrl) {
                            window.open(notification.actionUrl, "_blank");
                          }
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p
                                className={`text-sm font-medium ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}
                              >
                                {notification.title}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: es,
                                })}
                              </p>
                              {notification.actionText && (
                                <span className="text-xs font-medium text-blue-600">
                                  {notification.actionText}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
                {/* Permission Status */}
                {isSupported && (
                  <div className="mb-6">
                    <h4 className="mb-3 text-sm font-medium text-gray-900">Estado de Permisos</h4>
                    <div className={`rounded-lg p-3 ${getPermissionStatusStyles(permission)}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{getPermissionStatusText(permission)}</span>
                        {permission !== "granted" && (
                          <button
                            onClick={requestPermission}
                            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                          >
                            Habilitar
                          </button>
                        )}
                      </div>
                    </div>

                    {permission === "granted" && (
                      <button
                        onClick={subscribeToPush}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        🔔 Habilitar Push Notifications
                      </button>
                    )}
                  </div>
                )}

                {/* Email Settings */}
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-medium text-gray-900">
                    Notificaciones por Email
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.email.enabled}
                        onChange={(e) =>
                          updateSettings({
                            email: { ...settings.email, enabled: e.target.checked },
                          })
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        Habilitar notificaciones por email
                      </span>
                    </label>

                    {settings.email.enabled && (
                      <div className="ml-6 space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.email.newBookings}
                            onChange={(e) =>
                              updateSettings({
                                email: { ...settings.email, newBookings: e.target.checked },
                              })
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-600">Nuevas reservas</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.email.cancelations}
                            onChange={(e) =>
                              updateSettings({
                                email: { ...settings.email, cancelations: e.target.checked },
                              })
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-600">Cancelaciones</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.email.reminders}
                            onChange={(e) =>
                              updateSettings({
                                email: { ...settings.email, reminders: e.target.checked },
                              })
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-600">Recordatorios</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.email.payments}
                            onChange={(e) =>
                              updateSettings({
                                email: { ...settings.email, payments: e.target.checked },
                              })
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-600">Pagos</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* In-App Settings */}
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-medium text-gray-900">
                    Notificaciones en la App
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.inApp.enabled}
                        onChange={(e) =>
                          updateSettings({
                            inApp: { ...settings.inApp, enabled: e.target.checked },
                          })
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        Habilitar notificaciones en la app
                      </span>
                    </label>

                    {settings.inApp.enabled && (
                      <div className="ml-6 space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.inApp.sound}
                            onChange={(e) =>
                              updateSettings({
                                inApp: { ...settings.inApp, sound: e.target.checked },
                              })
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-600">Sonidos</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.inApp.desktop}
                            onChange={(e) =>
                              updateSettings({
                                inApp: { ...settings.inApp, desktop: e.target.checked },
                              })
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm text-gray-600">
                            Notificaciones de escritorio
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
