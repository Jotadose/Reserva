import React, { useState } from "react";
import useBarberos from "../hooks/useBarberos";
import { useServicios } from "../hooks/useServicios";
import { useReservasMVP } from "../hooks/useReservasMVP";
import { useUsuarios } from "../hooks/useUsuarios";

export function BookingSystemMVP() {
  const [selectedBarbero, setSelectedBarbero] = useState<string>("");
  const [selectedServicios, setSelectedServicios] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [clientData, setClientData] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });

  const { barberos, loading: barberosLoading } = useBarberos();
  const {
    servicios,
    loading: serviciosLoading,
    formatearPrecio,
  } = useServicios();
  const { reservas, crearReserva, loading: reservasLoading } = useReservasMVP();
  const { usuarios, crearUsuario } = useUsuarios();

  const handleCreateReservation = async () => {
    try {
      // 1. Crear usuario cliente si no existe
      const clienteData = {
        nombre: clientData.nombre,
        email: clientData.email,
        telefono: clientData.telefono,
        rol: "cliente" as const,
      };

      const nuevoCliente = await crearUsuario(clienteData);

      // 2. Calcular duración total y precio
      const serviciosSeleccionados = servicios.filter((s) =>
        selectedServicios.includes(s.id_servicio)
      );
      const duracionTotal = serviciosSeleccionados.reduce(
        (acc, s) => acc + s.duracion,
        0
      );
      const precioTotal = serviciosSeleccionados.reduce(
        (acc, s) => acc + s.precio,
        0
      );

      // 3. Crear reserva
      const reservaData = {
        id_cliente: nuevoCliente.id_usuario,
        id_barbero: selectedBarbero,
        id_servicio: selectedServicios[0], // Por ahora solo el primer servicio
        fecha_hora: new Date(`${selectedDate}T09:00:00`).toISOString(),
        duracion_minutos: duracionTotal,
        precio_total: precioTotal,
        estado: "confirmada" as const,
        notas: `Servicios: ${serviciosSeleccionados
          .map((s) => s.nombre)
          .join(", ")}`,
      };

      await crearReserva(reservaData);

      // Reset form
      setSelectedBarbero("");
      setSelectedServicios([]);
      setSelectedDate("");
      setClientData({ nombre: "", email: "", telefono: "" });

      alert("¡Reserva creada exitosamente!");
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert("Error al crear la reserva");
    }
  };

  if (barberosLoading || serviciosLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Sistema de Reservas MVP</h1>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4">Cargando sistema de reservas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Sistema de Reservas MVP</h1>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-600">Barberos</h3>
            <p className="text-2xl font-bold text-blue-600">
              {barberos?.length || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-600">Servicios</h3>
            <p className="text-2xl font-bold text-green-600">
              {servicios?.length || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-600">Reservas</h3>
            <p className="text-2xl font-bold text-purple-600">
              {reservas?.length || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-600">Usuarios</h3>
            <p className="text-2xl font-bold text-orange-600">
              {usuarios?.length || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de Nueva Reserva */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-6">Nueva Reserva</h2>

            {/* Datos del Cliente */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Datos del Cliente</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={clientData.nombre}
                  onChange={(e) =>
                    setClientData({ ...clientData, nombre: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={clientData.email}
                  onChange={(e) =>
                    setClientData({ ...clientData, email: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={clientData.telefono}
                  onChange={(e) =>
                    setClientData({ ...clientData, telefono: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Selección de Barbero */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Seleccionar Barbero</h3>
              <select
                value={selectedBarbero}
                onChange={(e) => setSelectedBarbero(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Selecciona un barbero</option>
                {barberos?.map((barbero) => (
                  <option key={barbero.id_barbero} value={barbero.id_barbero}>
                    {barbero.nombre} - {barbero.servicios?.join(", ")} {/* 🔄 CAMBIO: especialidades -> servicios */}
                  </option>
                ))}
              </select>
            </div>

            {/* Selección de Servicios */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Seleccionar Servicios</h3>
              <div className="space-y-2">
                {servicios?.map((servicio) => (
                  <label
                    key={servicio.id_servicio}
                    className="flex items-center"
                  >
                    <input
                      type="checkbox"
                      checked={selectedServicios.includes(servicio.id_servicio)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedServicios([
                            ...selectedServicios,
                            servicio.id_servicio,
                          ]);
                        } else {
                          setSelectedServicios(
                            selectedServicios.filter(
                              (id) => id !== servicio.id_servicio
                            )
                          );
                        }
                      }}
                      className="mr-2"
                    />
                    <span>
                      {servicio.nombre} -{" "}
                      {formatearPrecio
                        ? formatearPrecio(servicio.precio)
                        : `$${servicio.precio}`}{" "}
                      ({servicio.duracion} min)
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fecha */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Fecha</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <button
              onClick={handleCreateReservation}
              disabled={
                !selectedBarbero ||
                selectedServicios.length === 0 ||
                !selectedDate ||
                !clientData.nombre ||
                reservasLoading
              }
              className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {reservasLoading ? "Creando..." : "Crear Reserva"}
            </button>
          </div>

          {/* Lista de Reservas */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-6">Reservas Recientes</h2>
            <div className="space-y-3">
              {reservas && reservas.length > 0 ? (
                reservas.slice(0, 5).map((reserva) => (
                  <div
                    key={reserva.id_reserva}
                    className="p-3 bg-gray-50 rounded border"
                  >
                    <p className="font-medium">
                      {reserva.cliente_nombre || "Cliente"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {reserva.barbero_nombre || "Barbero"} -{" "}
                      {reserva.servicio_nombre || "Servicio"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(reserva.fecha_hora).toLocaleDateString()} a las{" "}
                      {new Date(reserva.fecha_hora).toLocaleTimeString()}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        reserva.estado === "confirmada"
                          ? "bg-green-100 text-green-800"
                          : reserva.estado === "pendiente"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {reserva.estado}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No hay reservas recientes</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
