// Hook simple para determinar si una fecha es laborable según reglas actuales.
// Por ahora: domingo (getDay() === 0) es no laborable. Se puede extender para feriados.
export function useWorkingDays() {
  const isWorkingDay = (date: Date) => {
    const day = date.getDay();
    // 0 = domingo
    return day !== 0;
  };
  return { isWorkingDay };
}

export type UseWorkingDaysReturn = ReturnType<typeof useWorkingDays>;
