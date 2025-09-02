import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
    reason?: string
  ) => Promise<void>;
  markAsCompleted: (bookingId: string) => Promise<void>;
  markAsNoShow: (bookingId: string) => Promise<void>;
  updateBookingStatus: (
    bookingId: string,
    status: BookingStatus
  ) => Promise<void>;
  bulkCancelBookings: (bookingIds: string[]) => Promise<void>;
  exportBookings: (bookings: any[], format: "csv" | "pdf") => void;
}

export const useBookingActions = (
  onBookingChange?: () => Promise<void>
): UseBookingActionsReturn => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const setActionLoading = (id: string, isLoading: boolean) => {
    setLoading((prev) => ({ ...prev, [id]: isLoading }));
  };

  const handleApiCall = async (
    id: string,
    apiCall: () => Promise<Response>,
    successMessage: string,
    errorMessage: string
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
    try {
      setLoading(true);

      // ✅ USAR SERVICIO SUPABASE DIRECTAMENTE
      const { bookingsService } = await import("../lib/supabaseNormalized");
      await bookingsService.cancel(bookingId, "Cancelado por administrador");

      // 🔄 INVALIDAR CACHÉ PARA ACTUALIZACIÓN INMEDIATA
      await queryClient.invalidateQueries({ queryKey: ["bookings_new"] });

      addToast({
        type: "success",
        title: "Cancelada",
        message: "Reserva cancelada exitosamente",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      addToast({
        type: "error",
        title: "Error",
        message: "No se pudo cancelar la reserva",
      });
    } finally {
      setLoading(false);
    }
  };
  const rescheduleBooking = async (
    bookingId: string,
    newDate: string,
    newTime: string,
    reason?: string
  ) => {
    await handleApiCall(
      bookingId,
      () =>
        fetch(`/api/bookings/${bookingId}`, {
          method: "PATCH",
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
      "No se pudo reagendar la reserva"
    );
  };

  const markAsCompleted = async (bookingId: string) => {
    try {
      setLoading(true);

      // ✅ USAR SERVICIO SUPABASE DIRECTAMENTE
      const { bookingsService } = await import("../lib/supabaseNormalized");
      await bookingsService.updateStatus(bookingId, "completed");

      // 🔄 INVALIDAR CACHÉ PARA ACTUALIZACIÓN INMEDIATA
      await queryClient.invalidateQueries({ queryKey: ["bookings_new"] });

      addToast({
        type: "success",
        title: "Completada",
        message: "Reserva marcada como completada",
      });
    } catch (error) {
      console.error("Error marking booking as completed:", error);
      addToast({
        type: "error",
        title: "Error",
        message: "No se pudo marcar la reserva como completada",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsNoShow = async (bookingId: string) => {
    try {
      setLoading(true);

      // ✅ USAR SERVICIO SUPABASE DIRECTAMENTE
      const { bookingsService } = await import("../lib/supabaseNormalized");
      await bookingsService.updateStatus(bookingId, "no_show");

      // 🔄 INVALIDAR CACHÉ PARA ACTUALIZACIÓN INMEDIATA
      await queryClient.invalidateQueries({ queryKey: ["bookings_new"] });

      addToast({
        type: "success",
        title: "No-Show",
        message: "Reserva marcada como no-show",
      });
    } catch (error) {
      console.error("Error marking booking as no-show:", error);
      addToast({
        type: "error",
        title: "Error",
        message: "No se pudo marcar la reserva como no-show",
      });
    } finally {
      setLoading(false);
    }
  };
  const updateBookingStatus = async (
    bookingId: string,
    status: BookingStatus
  ) => {
    await handleApiCall(
      bookingId,
      () =>
        fetch(`/api/bookings/${bookingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }),
      `Estado actualizado a ${status}`,
      "No se pudo actualizar el estado"
    );
  };

  const bulkCancelBookings = async (bookingIds: string[]) => {
    setActionLoading("bulk-cancel", true);
    try {
      const promises = bookingIds.map((id) =>
        fetch(`/api/bookings/${id}`, { method: "DELETE" })
      );

      const results = await Promise.allSettled(promises);
      const failed = results.filter(
        (result) => result.status === "rejected"
      ).length;
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
        ],
        ...bookings.map((booking) => [
          booking.id || "",
          booking.client.name,
          booking.client.phone,
          booking.client.email,
          booking.date,
          booking.time,
          booking.services?.map((s: any) => s.name).join(", ") || "",
          booking.services
            ?.reduce((sum: number, s: any) => sum + s.price, 0)
            .toString() || "0",
          "Confirmada", // Por ahora todas son confirmadas
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `reservas_${new Date().toISOString().split("T")[0]}.csv`
      );
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

  const editBooking = async (bookingId: string, updates: Partial<Booking>) => {
    try {
      setLoading(true);

      // ✅ USAR SERVICIO SUPABASE DIRECTAMENTE
      const { bookingsService } = await import("../lib/supabaseNormalized");
      await bookingsService.update(bookingId, updates);

      // 🔄 INVALIDAR CACHÉ PARA ACTUALIZACIÓN INMEDIATA
      await queryClient.invalidateQueries({ queryKey: ["bookings_new"] });

      addToast({
        type: "success",
        title: "Actualizada",
        message: "Reserva actualizada exitosamente",
      });
    } catch (error) {
      console.error("Error updating booking:", error);
      addToast({
        type: "error",
        title: "Error",
        message: "No se pudo actualizar la reserva",
      });
      throw error;
    } finally {
      setLoading(false);
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
    editBooking,
  };
};
