import { useState, useEffect, useCallback } from "react";

export interface Barbero {
	id_barbero: string;
	nombre: string;
	email: string;
	telefono?: string;
	servicios: string[];
	horario_inicio: string;
	horario_fin: string;
	dias_trabajo: string[];
	tiempo_descanso: number;
	activo: boolean;
	biografia?: string;
	calificacion_promedio: number;
	total_cortes: number;
	avatar_url?: string;
}

const API_BASE = 'https://reserva-mauve.vercel.app/api';

function useBarberos() {
	const [barberos, setBarberos] = useState<Barbero[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchBarberos = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch(`${API_BASE}/consolidated?type=barberos&includeInactive=true`);
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			const result = await response.json();

			if (!result.data || !Array.isArray(result.data)) {
				throw new Error('Formato de datos inválido');
			}

			const barberosTransformados: Barbero[] = result.data.map((item: any) => ({
				id_barbero: item.barberos?.id_barbero || item.id_usuario,
				nombre: item.nombre,
				email: item.email,
				telefono: item.telefono,
				servicios: item.barberos?.servicios || [],
				horario_inicio: item.barberos?.horario_inicio || '09:00',
				horario_fin: item.barberos?.horario_fin || '18:00',
				dias_trabajo: item.barberos?.dias_trabajo || ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
				tiempo_descanso: item.barberos?.tiempo_descanso || 15,
				activo: item.activo,
				biografia: item.barberos?.biografia || '',
				calificacion_promedio: item.barberos?.calificacion_promedio || 0,
				total_cortes: item.barberos?.total_cortes || 0,
				avatar_url: item.avatar_url || ''
			}));

			setBarberos(barberosTransformados);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error desconocido');
			setBarberos([]);
		} finally {
			setLoading(false);
		}
	}, []);

	const getBarberoById = async (id: string): Promise<Barbero | null> => {
		try {
			const response = await fetch(`${API_BASE}/consolidated?type=barberos&id=${id}`);
			const result = await response.json();

			if (!response.ok) {
				if (response.status === 404) return null;
				throw new Error(result.error || "Error obteniendo barbero");
			}

			const item = result.data;
			if (!item) return null;

			return {
				id_barbero: item.barberos?.id_barbero || item.id_usuario,
				nombre: item.nombre,
				email: item.email,
				telefono: item.telefono,
				servicios: item.barberos?.servicios || [],
				horario_inicio: item.barberos?.horario_inicio || '09:00',
				horario_fin: item.barberos?.horario_fin || '18:00',
				dias_trabajo: item.barberos?.dias_trabajo || ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
				tiempo_descanso: item.barberos?.tiempo_descanso || 15,
				activo: item.activo,
				biografia: item.barberos?.biografia || '',
				calificacion_promedio: item.barberos?.calificacion_promedio || 0,
				total_cortes: item.barberos?.total_cortes || 0,
				avatar_url: item.avatar_url || ''
			};
		} catch (err) {
			return null;
		}
	};

	const crearBarbero = async (data: Partial<Barbero>): Promise<Barbero | null> => {
		try {
			const response = await fetch(`${API_BASE}/consolidated?type=barberos`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || 'Error creando barbero');
			}

			if (result.data) {
				await fetchBarberos();
				return result.data;
			}

			return null;
		} catch (err) {
			throw err;
		}
	};

	const actualizarBarbero = async (id: string, data: Partial<Barbero>): Promise<Barbero | null> => {
		try {
			const response = await fetch(`${API_BASE}/consolidated?type=barberos&id=${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || 'Error actualizando barbero');
			}

			if (result.data) {
				await fetchBarberos();
				return result.data;
			}

			return null;
		} catch (err) {
			throw err;
		}
	};

	const eliminarBarbero = async (id: string): Promise<boolean> => {
		try {
			const response = await fetch(`${API_BASE}/consolidated?type=barberos&id=${id}`, {
				method: 'DELETE'
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || 'Error eliminando barbero');
			}

			await fetchBarberos();
			return true;
		} catch (err) {
			throw err;
		}
	};

	const getBarberosByServicio = (servicioId: string): Barbero[] => {
		return barberos.filter(
			(barbero) => barbero.servicios.includes(servicioId) && barbero.activo
		);
	};

	useEffect(() => {
		fetchBarberos();
	}, [fetchBarberos]);

	return {
		barberos,
		loading,
		error,
		refetch: fetchBarberos,
		getBarberoById,
		getBarberosByServicio,
		crearBarbero,
		actualizarBarbero,
		eliminarBarbero,
	};
}

export default useBarberos;
export { useBarberos };
