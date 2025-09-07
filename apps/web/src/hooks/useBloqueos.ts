import { useState, useCallback } from "react";

export interface BloqueoHorarioRaw {
  id_bloqueo: string;
  id_barbero: string | null;
  fecha_inicio: string; // date
  fecha_fin: string; // date
  hora_inicio: string | null; // time or null
  hora_fin: string | null; // time or null
  tipo: string;
  motivo: string | null;
  metadata?: Record<string, any>;
  creado_at: string;
}

export interface BloqueoVista {
  id: string;
  id_barbero: string | null;
  fecha: string; // día expandido
  hora_inicio: string | null;
  hora_fin: string | null;
  tipo: string;
  motivo: string | null;
}

function expandRange(b: BloqueoHorarioRaw): BloqueoVista[] {
  const start = new Date(b.fecha_inicio + "T00:00:00");
  const end = new Date(b.fecha_fin + "T00:00:00");
  const out: BloqueoVista[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    out.push({
      id: b.id_bloqueo,
      id_barbero: b.id_barbero,
      fecha: d.toISOString().slice(0, 10),
      hora_inicio: b.hora_inicio,
      hora_fin: b.hora_fin,
      tipo: b.tipo,
      motivo: b.motivo,
    });
  }
  return out;
}

export function useBloqueos() {
  const [bloqueos, setBloqueos] = useState<BloqueoVista[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBloqueos = useCallback(
    async (params: { from?: string; to?: string; barbero?: string } = {}) => {
      try {
        setLoading(true);
        setError(null);
        const searchParams = new URLSearchParams();
        if (params.from) searchParams.set("from", params.from);
        if (params.to) searchParams.set("to", params.to);
        if (params.barbero) searchParams.set("barbero", params.barbero);
        const qs = searchParams.toString();
        const resp = await fetch(`/api/bloqueos${qs ? `?${qs}` : ""}`);
        const json = await resp.json();
        if (!resp.ok)
          throw new Error(json.error || "Error obteniendo bloqueos");
        const raw: BloqueoHorarioRaw[] = json.data || [];
        const expanded = raw.flatMap(expandRange);
        setBloqueos(expanded);
        return expanded;
      } catch (e: any) {
        setError(e.message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createBloqueo = useCallback(
    async (input: {
      id_barbero?: string | null;
      fecha_inicio: string;
      fecha_fin: string;
      hora_inicio?: string | null;
      hora_fin?: string | null;
      tipo: string;
      motivo?: string;
    }) => {
      const resp = await fetch("/api/bloqueos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Error creando bloqueo");
      // Refresh within same range if possible
      return json.data;
    },
    []
  );

  const deleteBloqueo = useCallback(async (id: string) => {
    const resp = await fetch(`/api/bloqueos?id=${id}`, { method: "DELETE" });
    if (!resp.ok) {
      const json = await resp.json();
      throw new Error(json.error || "Error eliminando bloqueo");
    }
    setBloqueos((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return {
    bloqueos,
    loading,
    error,
    fetchBloqueos,
    createBloqueo,
    deleteBloqueo,
  };
}
