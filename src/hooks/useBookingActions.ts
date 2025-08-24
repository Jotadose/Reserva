import { useState } from "react";
import { useToast } from "../contexts/ToastContext";

export type BookingStatus =
  | "confirmed"
  | "pending"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "no-show"
  | "rescheduled";

export interface BookingAction {
  id: string;
  type: "cancel" | "reschedule" | "complete" | "mark-no-show" | "edit";
  data?: any;
}

export interface UseBookingActionsReturn {
  loading: Record<string, boolean>;
  cancelBooking: (bookingId: string) => Promise<void>;
  rescheduleBooking: (
    bookingId: string,
    newDate: string,
    newTime: string,
    reason?: string,
  ) => Promise<void>;
  markAsCompleted: (bookingId: string) => Promise<void>;
  markAsNoShow: (bookingId: string) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  bulkCancelBookings: (bookingIds: string[]) => Promise<void>;
  exportBookings: (bookings: any[], format: "csv" | "pdf") => void;
}

export const useBookingActions = (
  onBookingChange?: () => Promise<void>,
): UseBookingActionsReturn => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const setActionLoading = (id: string, isLoading: boolean) => {
    setLoading((prev) => ({ ...prev, [id]: isLoading }));
  };

  const handleApiCall = async (
    id: string,
    apiCall: () => Promise<Response>,
    successMessage: string,
    errorMessage: string,
  ) => {
    setActionLoading(id, true);
    try {
      const response = await apiCall();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      addToast({
        type: "success",
        title: "Éxito",
        message: successMessage,
      });

      if (onBookingChange) {
        await onBookingChange();
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
      throw error;
    } finally {
      setActionLoading(id, false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    await handleApiCall(
      bookingId,
      () => fetch(`/api/crud?action=delete&id=${bookingId}`, { method: "POST" }),
      "Reserva cancelada exitosamente",
      "No se pudo cancelar la reserva",
    );
  };

  const rescheduleBooking = async (
    bookingId: string,
    newDate: string,
    newTime: string,
    reason?: string,
  ) => {
    await handleApiCall(
      bookingId,
      () =>
        fetch(`/api/crud?action=update&id=${bookingId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: newDate,
            time: newTime,
            status: "rescheduled",
            rescheduleHistory: {
              originalDate: new Date().toISOString().split("T")[0],
              originalTime: new Date().toLocaleTimeString("es-CO", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
              }),
              reason: reason || "Reagendado por administrador",
              timestamp: new Date().toISOString(),
            },
          }),
        }),
      "Reserva reagendada exitosamente",
      "No se pudo reagendar la reserva",
    );
  };

  const markAsCompleted = async (bookingId: string) => {
    await handleApiCall(
      bookingId,
      () =>
        fetch(`/api/crud?action=status&id=${bookingId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" }),
        }),
      "Reserva marcada como completada",
      "No se pudo marcar la reserva como completada",
    );
  };

  const markAsNoShow = async (bookingId: string) => {
    await handleApiCall(
      bookingId,
      () =>
        fetch(`/api/crud?action=status&id=${bookingId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "no-show" }),
        }),
      "Reserva marcada como no-show",
      "No se pudo marcar la reserva como no-show",
    );
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    await handleApiCall(
      bookingId,
      () =>
        fetch(`/api/crud?action=status&id=${bookingId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }),
      `Estado actualizado a ${status}`,
      "No se pudo actualizar el estado",
    );
  };

  const bulkCancelBookings = async (bookingIds: string[]) => {
    setActionLoading("bulk-cancel", true);
    try {
      const promises = bookingIds.map((id) =>
        fetch(`/api/crud?action=delete&id=${id}`, { method: "POST" }),
      );

      const results = await Promise.allSettled(promises);
      const failed = results.filter((result) => result.status === "rejected").length;
      const succeeded = results.length - failed;

      if (succeeded > 0) {
        const failMessage = failed > 0 ? `, ${failed} falló(s)` : "";
        addToast({
          type: "success",
          title: "Cancelación masiva exitosa",
          message: `${succeeded} reserva(s) cancelada(s)${failMessage}`,
        });
      }

      if (failed > 0 && succeeded === 0) {
        addToast({
          type: "error",
          title: "Error en cancelación masiva",
          message: `No se pudieron cancelar ${failed} reserva(s)`,
        });
      }

      if (onBookingChange) {
        await onBookingChange();
      }
    } catch (error) {
      console.error("Bulk cancel error:", error);
      addToast({
        type: "error",
        title: "Error",
        message: "Error en la cancelación masiva",
      });
    } finally {
      setActionLoading("bulk-cancel", false);
    }
  };

  const exportBookings = (bookings: any[], format: "csv" | "pdf") => {
    if (format === "csv") {
      const csvContent = [
        ["ID", "Cliente", "Teléfono", "Email", "Fecha", "Hora", "Servicios", "Total", "Estado"],
        ...bookings.map((booking) => [
          booking.id || "",
          booking.client.name,
          booking.client.phone,
          booking.client.email,
          booking.date,
          booking.time,
          booking.services?.map((s: any) => s.name).join(", ") || "",
          booking.services?.reduce((sum: number, s: any) => sum + s.price, 0).toString() || "0",
          "Confirmada", // Por ahora todas son confirmadas
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `reservas_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast({
        type: "success",
        title: "Exportación exitosa",
        message: "Archivo CSV descargado correctamente",
      });
    } else {
      addToast({
        type: "info",
        title: "Próximamente",
        message: "Exportación PDF estará disponible pronto",
      });
    }
  };

  return {
    loading,
    cancelBooking,
    rescheduleBooking,
    markAsCompleted,
    markAsNoShow,
    updateBookingStatus,
    bulkCancelBookings,
    exportBookings,
  };
};
