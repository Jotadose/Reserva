/**
 * ===================================================================
 * SHARED PACKAGE - PUNTO DE ENTRADA
 * ===================================================================
 */

// Exportar todos los tipos
export * from "./types";

// Exportar todas las utilidades
export * from "./utils";

// Exportar lógica de booking (reglas y servicios de slots)
export * from "./booking/rules";
export * from "./booking/slotService";

// Exportar máquina de estados de reserva
export * from "./state/reservationStateMachine";
