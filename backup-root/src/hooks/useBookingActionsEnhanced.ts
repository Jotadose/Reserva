import { useState, useCallback } from "react";
import { Booking } from "../types/booking";
import { useToast } from "../contexts/ToastContext";

export interface BookingUpdateData {
  status?: Booking["status"];
  date?: string;
  time?: string;
  services?: any[];
  client?: Partial<Booking["client"]>;
  cancelReason?: string;
}

export interface UseBookingActionsEnhancedReturn {
  loading: { [key: string]: boolean };
  updateBookingStatus: (
    bookingId: string,
    status: Booking["status"],
    reason?: string,
  ) => Promise<void>;
  rescheduleBooking: (
    bookingId: string,
    newDate: string,
    newTime: string,
    reason: string,
  ) => Promise<void>;
  editBooking: (bookingId: string, updates: BookingUpdateData) => Promise<void>;
  deleteBooking: (bookingId: string, reason: string) => Promise<void>;
  bulkCancelBookings: (bookingIds: string[], reason?: string) => Promise<void>;
  bulkUpdateStatus: (bookingIds: string[], status: Booking["status"]) => Promise<void>;
  exportBookings: (bookings: Booking[], format: "csv" | "pdf" | "excel") => void;
  sendReminder: (bookingId: string, type: "sms" | "email") => Promise<void>;
  duplicateBooking: (bookingId: string, newDate: string, newTime: string) => Promise<void>;
}

export const useBookingActionsEnhanced = (): UseBookingActionsEnhancedReturn => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const { addToast } = useToast();

  const setLoadingState = useCallback((key: string, isLoading: boolean) => {
    setLoading((prev) => ({ ...prev, [key]: isLoading }));
  }, []);

  const updateBookingStatus = useCallback(
    async (bookingId: string, status: Booking["status"], reason?: string) => {
      const loadingKey = `update-${bookingId}`;
      setLoadingState(loadingKey, true);

      try {
        // Simular API call (reemplazar con llamada real)
        await new Promise((resolve) => setTimeout(resolve, 800));

        addToast({
          type: "success",
          title: "Estado Actualizado",
          message: `La reserva ha sido marcada como ${status}`,
        });
      } catch (error) {
        console.error("Error updating booking status:", error);
        addToast({
          type: "error",
          title: "Error",
          message: "No se pudo actualizar el estado de la reserva",
        });
      } finally {
        setLoadingState(loadingKey, false);
      }
    },
    [addToast, setLoadingState],
  );

  const rescheduleBooking = useCallback(
    async (bookingId: string, newDate: string, newTime: string, reason: string) => {
      const loadingKey = `reschedule-${bookingId}`;
      setLoadingState(loadingKey, true);

      try {
        // Simular API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        addToast({
          type: "success",
          title: "Reserva Reagendada",
          message: `La cita ha sido reagendada para ${newDate} a las ${newTime}`,
        });
      } catch (error) {
        console.error("Error rescheduling booking:", error);
        addToast({
          type: "error",
          title: "Error",
          message: "No se pudo reagendar la reserva",
        });
      } finally {
        setLoadingState(loadingKey, false);
      }
    },
    [addToast, setLoadingState],
  );

  const editBooking = useCallback(
    async (bookingId: string, updates: BookingUpdateData) => {
      const loadingKey = `edit-${bookingId}`;
      setLoadingState(loadingKey, true);

      try {
        // Simular API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        addToast({
          type: "success",
          title: "Reserva Actualizada",
          message: "Los cambios se han guardado correctamente",
        });
      } catch (error) {
        console.error("Error editing booking:", error);
        addToast({
          type: "error",
          title: "Error",
          message: "No se pudo actualizar la reserva",
        });
      } finally {
        setLoadingState(loadingKey, false);
      }
    },
    [addToast, setLoadingState],
  );

  const deleteBooking = useCallback(
    async (bookingId: string, reason: string) => {
      const loadingKey = `delete-${bookingId}`;
      setLoadingState(loadingKey, true);

      try {
        // Simular API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        addToast({
          type: "success",
          title: "Reserva Eliminada",
          message: "La reserva ha sido eliminada exitosamente",
        });
      } catch (error) {
        console.error("Error deleting booking:", error);
        addToast({
          type: "error",
          title: "Error",
          message: "No se pudo eliminar la reserva",
        });
      } finally {
        setLoadingState(loadingKey, false);
      }
    },
    [addToast, setLoadingState],
  );

  const bulkCancelBookings = useCallback(
    async (bookingIds: string[], reason = "Cancelación administrativa") => {
      const loadingKey = "bulk-cancel";
      setLoadingState(loadingKey, true);

      try {
        // Simular API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        addToast({
          type: "success",
          title: "Cancelación Masiva",
          message: `${bookingIds.length} reservas han sido canceladas`,
        });
      } catch (error) {
        console.error("Error bulk canceling bookings:", error);
        addToast({
          type: "error",
          title: "Error",
          message: "No se pudieron cancelar las reservas seleccionadas",
        });
      } finally {
        setLoadingState(loadingKey, false);
      }
    },
    [addToast, setLoadingState],
  );

  const bulkUpdateStatus = useCallback(
    async (bookingIds: string[], status: Booking["status"]) => {
      const loadingKey = "bulk-update";
      setLoadingState(loadingKey, true);

      try {
        // Simular API call
        await new Promise((resolve) => setTimeout(resolve, 1200));

        addToast({
          type: "success",
          title: "Actualización Masiva",
          message: `${bookingIds.length} reservas actualizadas a ${status}`,
        });
      } catch (error) {
        console.error("Error bulk updating bookings:", error);
        addToast({
          type: "error",
          title: "Error",
          message: "No se pudieron actualizar las reservas seleccionadas",
        });
      } finally {
        setLoadingState(loadingKey, false);
      }
    },
    [addToast, setLoadingState],
  );

  const exportBookings = useCallback(
    (bookings: Booking[], format: "csv" | "pdf" | "excel") => {
      try {
        if (format === "csv") {
          const csvContent = [
            // Header
            [
              "ID",
              "Cliente",
              "Teléfono",
              "Email",
              "Fecha",
              "Hora",
              "Servicios",
              "Total",
              "Estado",
            ].join(","),
            // Data rows
            ...bookings.map((booking) =>
              [
                booking.id,
                `"${booking.client.name}"`,
                booking.client.phone,
                booking.client.email,
                booking.date,
                booking.time,
                `"${booking.services.map((s) => s.name).join(", ")}"`,
                booking.totalPrice,
                booking.status,
              ].join(","),
            ),
          ].join("\n");

          const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", `reservas_${new Date().toISOString().split("T")[0]}.csv`);
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        addToast({
          type: "success",
          title: "Exportación Exitosa",
          message: `Archivo ${format.toUpperCase()} descargado correctamente`,
        });
      } catch (error) {
        console.error("Error exporting bookings:", error);
        addToast({
          type: "error",
          title: "Error de Exportación",
          message: "No se pudo exportar el archivo",
        });
      }
    },
    [addToast],
  );

  const sendReminder = useCallback(
    async (bookingId: string, type: "sms" | "email") => {
      const loadingKey = `reminder-${bookingId}`;
      setLoadingState(loadingKey, true);

      try {
        // Simular API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        addToast({
          type: "success",
          title: "Recordatorio Enviado",
          message: `Recordatorio por ${type} enviado exitosamente`,
        });
      } catch (error) {
        console.error("Error sending reminder:", error);
        addToast({
          type: "error",
          title: "Error",
          message: "No se pudo enviar el recordatorio",
        });
      } finally {
        setLoadingState(loadingKey, false);
      }
    },
    [addToast, setLoadingState],
  );

  const duplicateBooking = useCallback(
    async (bookingId: string, newDate: string, newTime: string) => {
      const loadingKey = `duplicate-${bookingId}`;
      setLoadingState(loadingKey, true);

      try {
        // Simular API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        addToast({
          type: "success",
          title: "Reserva Duplicada",
          message: `Nueva reserva creada para ${newDate} a las ${newTime}`,
        });
      } catch (error) {
        console.error("Error duplicating booking:", error);
        addToast({
          type: "error",
          title: "Error",
          message: "No se pudo duplicar la reserva",
        });
      } finally {
        setLoadingState(loadingKey, false);
      }
    },
    [addToast, setLoadingState],
  );

  return {
    loading,
    updateBookingStatus,
    rescheduleBooking,
    editBooking,
    deleteBooking,
    bulkCancelBookings,
    bulkUpdateStatus,
    exportBookings,
    sendReminder,
    duplicateBooking,
  };
};
