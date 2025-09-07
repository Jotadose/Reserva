/**
 * reservationStateMachine
 * Máquina de estados mínima para validar transiciones de reservas.
 */

export type ReservaEstado =
  | "pendiente"
  | "confirmada"
  | "en_progreso"
  | "completada"
  | "cancelada"
  | "no_show";

interface TransitionMap {
  [K: string]: ReservaEstado[];
}

const transitions: TransitionMap = {
  pendiente: ["confirmada", "cancelada"],
  confirmada: ["en_progreso", "cancelada", "no_show"],
  en_progreso: ["completada", "cancelada"],
  completada: [],
  cancelada: [],
  no_show: [],
};

export function canTransition(from: ReservaEstado, to: ReservaEstado): boolean {
  return transitions[from]?.includes(to) || false;
}

export function assertTransition(
  from: ReservaEstado,
  to: ReservaEstado
): asserts to is ReservaEstado {
  if (!canTransition(from, to)) {
    throw new Error(`Transición inválida de '${from}' a '${to}'`);
  }
}

export const reservationStateMachine = {
  canTransition,
  assertTransition,
  transitions,
  finalStates: new Set<ReservaEstado>(["completada", "cancelada", "no_show"]),
};
