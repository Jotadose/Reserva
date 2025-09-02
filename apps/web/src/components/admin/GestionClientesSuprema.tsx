/**
 * ===================================================================
 * SISTEMA DE GESTIÓN DE CLIENTES SUPREMO - CONTROL TOTAL
 * ===================================================================
 *
 * Panel de administración supremo para clientes con funcionalidades avanzadas:
 * - Perfiles completos con historial
 * - Análisis de comportamiento y preferencias
 * - Sistema de fidelización y puntos
 * - Comunicación directa y marketing
 * - Predicciones y recomendaciones
 */

import React, { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Star,
  Trophy,
  TrendingUp,
  Gift,
  MessageCircle,
  Send,
  Download,
  Upload,
  Heart,
  Clock,
  DollarSign,
  BarChart3,
} from "lucide-react";

import { Button, Card, Badge, Input, Select, EmptyState } from "../ui";

import { useToast } from "../../contexts/ToastContext";

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface Cliente {
  id: string;
  informacionPersonal: {
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    fechaNacimiento?: string;
    direccion?: string;
    instagram?: string;
  };
  estadisticas: {
    totalVisitas: number;
    totalGastado: number;
    promedioGasto: number;
    ultimaVisita: string;
    primeraVisita: string;
    frecuenciaVisitas: "alta" | "media" | "baja";
    puntosFidelidad: number;
  };
  preferencias: {
    barberoPreferido?: string;
    serviciosPreferidos: string[];
    horarioPreferido: "mañana" | "tarde" | "noche";
    diasPreferidos: string[];
    notificaciones: {
      sms: boolean;
      email: boolean;
      whatsapp: boolean;
      promociones: boolean;
    };
  };
  historial: {
    servicios: HistorialServicio[];
    notas: NotaCliente[];
    fotografias: string[];
  };
  clasificacion: {
    tipo: "vip" | "frecuente" | "ocasional" | "nuevo";
    nivel: number;
    descuentos: number[];
    privilegios: string[];
  };
  comportamiento: {
    puntualidad: "excelente" | "buena" | "regular" | "mala";
    cancelaciones: number;
    noShows: number;
    satisfaccionPromedio: number;
    probabilidadRetorno: number;
  };
}

interface HistorialServicio {
  id: string;
  fecha: string;
  servicios: string[];
  barbero: string;
  duracion: number;
  precio: number;
  satisfaccion: number;
  notas?: string;
  fotografias?: string[];
}

interface NotaCliente {
  id: string;
  fecha: string;
  autor: string;
  tipo: "general" | "preferencia" | "alerta" | "feedback";
  contenido: string;
  privada: boolean;
}

type VistaClientes =
  | "lista"
  | "perfil"
  | "analiticas"
  | "comunicacion"
  | "fidelizacion";
type FiltroClientes = "todos" | "vip" | "frecuentes" | "nuevos" | "inactivos";

// ===================================================================
// DATOS SIMULADOS
// ===================================================================

const clientesMock: Cliente[] = [
  {
    id: "1",
    informacionPersonal: {
      nombre: "Carlos",
      apellido: "Rodriguez",
      telefono: "+56912345678",
      email: "carlos.rodriguez@email.com",
      fechaNacimiento: "1985-03-15",
      direccion: "Las Condes, Santiago",
      instagram: "@carlosrod85",
    },
    estadisticas: {
      totalVisitas: 24,
      totalGastado: 420000,
      promedioGasto: 17500,
      ultimaVisita: "2024-01-10",
      primeraVisita: "2022-06-15",
      frecuenciaVisitas: "alta",
      puntosFidelidad: 2100,
    },
    preferencias: {
      barberoPreferido: "1",
      serviciosPreferidos: ["Corte + Barba", "Arreglo de Barba"],
      horarioPreferido: "tarde",
      diasPreferidos: ["viernes", "sabado"],
      notificaciones: {
        sms: true,
        email: true,
        whatsapp: true,
        promociones: true,
      },
    },
    historial: {
      servicios: [
        {
          id: "1",
          fecha: "2024-01-10",
          servicios: ["Corte Premium", "Arreglo de Barba"],
          barbero: "Michael",
          duracion: 60,
          precio: 25000,
          satisfaccion: 5,
          notas: "Cliente muy satisfecho con el resultado",
        },
      ],
      notas: [
        {
          id: "1",
          fecha: "2024-01-10",
          autor: "Michael",
          tipo: "preferencia",
          contenido: "Prefiere corte más corto en los costados",
          privada: false,
        },
      ],
      fotografias: [],
    },
    clasificacion: {
      tipo: "vip",
      nivel: 5,
      descuentos: [10, 15],
      privilegios: ["prioridad-reserva", "servicios-exclusivos"],
    },
    comportamiento: {
      puntualidad: "excelente",
      cancelaciones: 1,
      noShows: 0,
      satisfaccionPromedio: 4.8,
      probabilidadRetorno: 95,
    },
  },
  {
    id: "2",
    informacionPersonal: {
      nombre: "Ana",
      apellido: "Martinez",
      telefono: "+56987654321",
      email: "ana.martinez@email.com",
      fechaNacimiento: "1990-08-22",
      direccion: "Providencia, Santiago",
    },
    estadisticas: {
      totalVisitas: 8,
      totalGastado: 120000,
      promedioGasto: 15000,
      ultimaVisita: "2024-01-05",
      primeraVisita: "2023-09-20",
      frecuenciaVisitas: "media",
      puntosFidelidad: 800,
    },
    preferencias: {
      barberoPreferido: "2",
      serviciosPreferidos: ["Corte Femenino"],
      horarioPreferido: "mañana",
      diasPreferidos: ["sabado"],
      notificaciones: {
        sms: false,
        email: true,
        whatsapp: true,
        promociones: false,
      },
    },
    historial: {
      servicios: [],
      notas: [],
      fotografias: [],
    },
    clasificacion: {
      tipo: "frecuente",
      nivel: 3,
      descuentos: [5],
      privilegios: ["descuentos-especiales"],
    },
    comportamiento: {
      puntualidad: "buena",
      cancelaciones: 2,
      noShows: 1,
      satisfaccionPromedio: 4.3,
      probabilidadRetorno: 75,
    },
  },
];

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export const GestionClientesSuprema: React.FC = () => {
  const [vista, setVista] = useState<VistaClientes>("lista");
  const [clientes, setClientes] = useState<Cliente[]>(clientesMock);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(
    null
  );
  const [filtro, setFiltro] = useState<FiltroClientes>("todos");
  const [busqueda, setBusqueda] = useState("");
  const { showToast } = useToast();

  const clienteActual = useMemo(
    () => clientes.find((c) => c.id === clienteSeleccionado),
    [clientes, clienteSeleccionado]
  );

  const clientesFiltrados = useMemo(() => {
    let resultado = clientes;

    // Filtro por tipo
    if (filtro !== "todos") {
      switch (filtro) {
        case "vip":
          resultado = resultado.filter((c) => c.clasificacion.tipo === "vip");
          break;
        case "frecuentes":
          resultado = resultado.filter(
            (c) => c.clasificacion.tipo === "frecuente"
          );
          break;
        case "nuevos":
          resultado = resultado.filter((c) => c.clasificacion.tipo === "nuevo");
          break;
        case "inactivos":
          resultado = resultado.filter((c) => {
            const ultimaVisita = new Date(c.estadisticas.ultimaVisita);
            const tresMesesAtras = new Date();
            tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
            return ultimaVisita < tresMesesAtras;
          });
          break;
      }
    }

    // Filtro por búsqueda
    if (busqueda) {
      resultado = resultado.filter(
        (c) =>
          c.informacionPersonal.nombre
            .toLowerCase()
            .includes(busqueda.toLowerCase()) ||
          c.informacionPersonal.apellido
            .toLowerCase()
            .includes(busqueda.toLowerCase()) ||
          c.informacionPersonal.telefono.includes(busqueda) ||
          c.informacionPersonal.email
            .toLowerCase()
            .includes(busqueda.toLowerCase())
      );
    }

    return resultado;
  }, [clientes, filtro, busqueda]);

  const getColorClasificacion = (tipo: string) => {
    switch (tipo) {
      case "vip":
        return "bg-gradient-to-r from-yellow-600 to-yellow-400";
      case "frecuente":
        return "bg-gradient-to-r from-blue-600 to-blue-400";
      case "ocasional":
        return "bg-gradient-to-r from-green-600 to-green-400";
      case "nuevo":
        return "bg-gradient-to-r from-purple-600 to-purple-400";
      default:
        return "bg-slate-600";
    }
  };

  const renderListaClientes = () => (
    <div className="space-y-6">
      {/* Header y controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Gestión de Clientes</h3>
          <p className="text-slate-400">
            {clientesFiltrados.length} de {clientes.length} clientes
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Buscar clientes..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select
            value={filtro}
            onChange={(value) => setFiltro(value as FiltroClientes)}
            options={[
              { value: "todos", label: "Todos los clientes" },
              { value: "vip", label: "Clientes VIP" },
              { value: "frecuentes", label: "Clientes Frecuentes" },
              { value: "nuevos", label: "Clientes Nuevos" },
              { value: "inactivos", label: "Clientes Inactivos" },
            ]}
          />
          <Button variant="primary" icon={UserPlus}>
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {clientesFiltrados.map((cliente) => (
          <Card
            key={cliente.id}
            padding="lg"
            className="cursor-pointer hover:ring-2 hover:ring-blue-500/50"
            onClick={() => {
              setClienteSeleccionado(cliente.id);
              setVista("perfil");
            }}
          >
            <div className="space-y-4">
              {/* Header del cliente */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full ${getColorClasificacion(
                      cliente.clasificacion.tipo
                    )} flex items-center justify-center text-white font-bold`}
                  >
                    {cliente.informacionPersonal.nombre.charAt(0)}
                    {cliente.informacionPersonal.apellido.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      {cliente.informacionPersonal.nombre}{" "}
                      {cliente.informacionPersonal.apellido}
                    </h4>
                    <p className="text-slate-400 text-sm">
                      {cliente.informacionPersonal.telefono}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    cliente.clasificacion.tipo === "vip"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {cliente.clasificacion.tipo.toUpperCase()}
                </Badge>
              </div>

              {/* Estadísticas clave */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-lg font-bold text-white">
                    {cliente.estadisticas.totalVisitas}
                  </div>
                  <div className="text-slate-400 text-xs">Visitas</div>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-lg font-bold text-green-400">
                    {new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                      minimumFractionDigits: 0,
                    }).format(cliente.estadisticas.totalGastado)}
                  </div>
                  <div className="text-slate-400 text-xs">Total Gastado</div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Última visita:
                  </span>
                  <span className="text-white">
                    {new Date(
                      cliente.estadisticas.ultimaVisita
                    ).toLocaleDateString("es-CL")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Satisfacción:
                  </span>
                  <span className="text-yellow-400">
                    {cliente.comportamiento.satisfaccionPromedio}/5
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    Puntos:
                  </span>
                  <span className="text-blue-400">
                    {cliente.estadisticas.puntosFidelidad}
                  </span>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="flex gap-2 pt-3 border-t border-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Phone}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`tel:${cliente.informacionPersonal.telefono}`);
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={MessageCircle}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `https://wa.me/${cliente.informacionPersonal.telefono.replace(
                        "+",
                        ""
                      )}`
                    );
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Mail}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`mailto:${cliente.informacionPersonal.email}`);
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Calendar}
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast({
                      title: "Agendar cita",
                      message: `Agendando cita para ${cliente.informacionPersonal.nombre}`,
                      type: "info",
                    });
                  }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {clientesFiltrados.length === 0 && (
        <EmptyState
          icon={Users}
          title="No se encontraron clientes"
          description="No hay clientes que coincidan con los criterios de búsqueda"
        />
      )}
    </div>
  );

  const renderPerfilCliente = () => {
    if (!clienteActual) {
      return (
        <EmptyState
          icon={Users}
          title="Selecciona un cliente"
          description="Selecciona un cliente para ver su perfil completo"
        />
      );
    }

    return (
      <div className="space-y-6">
        {/* Header del perfil */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setVista("lista")}>
            ← Volver a la lista
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" icon={Download}>
              Exportar
            </Button>
            <Button variant="primary" icon={Calendar}>
              Agendar Cita
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-1">
            <Card padding="lg">
              <div className="text-center space-y-4">
                <div
                  className={`w-20 h-20 rounded-full ${getColorClasificacion(
                    clienteActual.clasificacion.tipo
                  )} flex items-center justify-center text-white font-bold text-2xl mx-auto`}
                >
                  {clienteActual.informacionPersonal.nombre.charAt(0)}
                  {clienteActual.informacionPersonal.apellido.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {clienteActual.informacionPersonal.nombre}{" "}
                    {clienteActual.informacionPersonal.apellido}
                  </h3>
                  <Badge
                    variant={
                      clienteActual.clasificacion.tipo === "vip"
                        ? "warning"
                        : "secondary"
                    }
                    className="mt-2"
                  >
                    {clienteActual.clasificacion.tipo.toUpperCase()} - Nivel{" "}
                    {clienteActual.clasificacion.nivel}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="h-4 w-4" />
                    {clienteActual.informacionPersonal.telefono}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="h-4 w-4" />
                    {clienteActual.informacionPersonal.email}
                  </div>
                  {clienteActual.informacionPersonal.direccion && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="h-4 w-4" />
                      {clienteActual.informacionPersonal.direccion}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Métricas de comportamiento */}
            <Card padding="lg" className="mt-6">
              <h4 className="font-semibold text-white mb-4">Comportamiento</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Puntualidad:</span>
                  <Badge
                    variant={
                      clienteActual.comportamiento.puntualidad === "excelente"
                        ? "success"
                        : "secondary"
                    }
                  >
                    {clienteActual.comportamiento.puntualidad}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cancelaciones:</span>
                  <span className="text-white">
                    {clienteActual.comportamiento.cancelaciones}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">No Shows:</span>
                  <span className="text-white">
                    {clienteActual.comportamiento.noShows}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Prob. Retorno:</span>
                  <span className="text-green-400">
                    {clienteActual.comportamiento.probabilidadRetorno}%
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Estadísticas y historial */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estadísticas principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card padding="md">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {clienteActual.estadisticas.totalVisitas}
                  </div>
                  <div className="text-slate-400 text-sm">Total Visitas</div>
                </div>
              </Card>
              <Card padding="md">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                      minimumFractionDigits: 0,
                    }).format(clienteActual.estadisticas.totalGastado)}
                  </div>
                  <div className="text-slate-400 text-sm">Total Gastado</div>
                </div>
              </Card>
              <Card padding="md">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {clienteActual.estadisticas.puntosFidelidad}
                  </div>
                  <div className="text-slate-400 text-sm">Puntos</div>
                </div>
              </Card>
              <Card padding="md">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {clienteActual.comportamiento.satisfaccionPromedio}
                  </div>
                  <div className="text-slate-400 text-sm">Satisfacción</div>
                </div>
              </Card>
            </div>

            {/* Preferencias */}
            <Card padding="lg">
              <h4 className="font-semibold text-white mb-4">Preferencias</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-slate-400 text-sm mb-2">
                    Servicios Preferidos:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {clienteActual.preferencias.serviciosPreferidos.map(
                      (servicio, index) => (
                        <Badge key={index} variant="secondary">
                          {servicio}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <h5 className="text-slate-400 text-sm mb-2">
                    Horario Preferido:
                  </h5>
                  <Badge variant="primary">
                    {clienteActual.preferencias.horarioPreferido}
                  </Badge>
                </div>
                <div>
                  <h5 className="text-slate-400 text-sm mb-2">
                    Días Preferidos:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {clienteActual.preferencias.diasPreferidos.map(
                      (dia, index) => (
                        <Badge key={index} variant="secondary">
                          {dia}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <h5 className="text-slate-400 text-sm mb-2">
                    Notificaciones:
                  </h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">SMS:</span>
                      <span
                        className={
                          clienteActual.preferencias.notificaciones.sms
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {clienteActual.preferencias.notificaciones.sms
                          ? "Sí"
                          : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">WhatsApp:</span>
                      <span
                        className={
                          clienteActual.preferencias.notificaciones.whatsapp
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {clienteActual.preferencias.notificaciones.whatsapp
                          ? "Sí"
                          : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Historial de servicios */}
            <Card padding="lg">
              <h4 className="font-semibold text-white mb-4">
                Historial de Servicios
              </h4>
              {clienteActual.historial.servicios.length > 0 ? (
                <div className="space-y-3">
                  {clienteActual.historial.servicios.map((servicio) => (
                    <div
                      key={servicio.id}
                      className="p-4 bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-white">
                            {servicio.servicios.join(" + ")}
                          </div>
                          <div className="text-slate-400 text-sm">
                            {new Date(servicio.fecha).toLocaleDateString(
                              "es-CL"
                            )}{" "}
                            • {servicio.barbero} • {servicio.duracion} min
                          </div>
                          {servicio.notas && (
                            <div className="text-slate-300 text-sm mt-1">
                              {servicio.notas}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-medium">
                            {new Intl.NumberFormat("es-CL", {
                              style: "currency",
                              currency: "CLP",
                              minimumFractionDigits: 0,
                            }).format(servicio.precio)}
                          </div>
                          <div className="text-yellow-400 text-sm">
                            {servicio.satisfaccion}/5 ⭐
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  No hay servicios registrados
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderAnaliticas = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">Analíticas de Clientes</h3>
        <p className="text-slate-400">
          Análisis detallado del comportamiento de clientes
        </p>
      </div>

      {/* Métricas globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card padding="lg">
          <div className="text-center">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {clientes.length}
            </div>
            <div className="text-slate-400">Total Clientes</div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center">
            <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {clientes.filter((c) => c.clasificacion.tipo === "vip").length}
            </div>
            <div className="text-slate-400">Clientes VIP</div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center">
            <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
                minimumFractionDigits: 0,
              }).format(
                clientes.reduce(
                  (total, c) => total + c.estadisticas.totalGastado,
                  0
                )
              )}
            </div>
            <div className="text-slate-400">Ingresos Totales</div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center">
            <Star className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {(
                clientes.reduce(
                  (total, c) => total + c.comportamiento.satisfaccionPromedio,
                  0
                ) / clientes.length
              ).toFixed(1)}
            </div>
            <div className="text-slate-400">Satisfacción Promedio</div>
          </div>
        </Card>
      </div>

      {/* Distribución por tipo */}
      <Card padding="lg">
        <h4 className="font-semibold text-white mb-4">
          Distribución de Clientes
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["vip", "frecuente", "ocasional", "nuevo"].map((tipo) => {
            const count = clientes.filter(
              (c) => c.clasificacion.tipo === tipo
            ).length;
            const percentage = ((count / clientes.length) * 100).toFixed(1);
            return (
              <div
                key={tipo}
                className="text-center p-4 bg-slate-700/50 rounded-lg"
              >
                <div className="text-lg font-bold text-white">{count}</div>
                <div className="text-slate-400 text-sm capitalize">{tipo}</div>
                <div className="text-blue-400 text-xs">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Top clientes */}
      <Card padding="lg">
        <h4 className="font-semibold text-white mb-4">
          Top Clientes por Valor
        </h4>
        <div className="space-y-3">
          {clientes
            .sort(
              (a, b) =>
                b.estadisticas.totalGastado - a.estadisticas.totalGastado
            )
            .slice(0, 5)
            .map((cliente, index) => (
              <div
                key={cliente.id}
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h5 className="font-medium text-white">
                      {cliente.informacionPersonal.nombre}{" "}
                      {cliente.informacionPersonal.apellido}
                    </h5>
                    <p className="text-slate-400 text-sm">
                      {cliente.estadisticas.totalVisitas} visitas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-medium">
                    {new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                      minimumFractionDigits: 0,
                    }).format(cliente.estadisticas.totalGastado)}
                  </div>
                  <Badge
                    variant={
                      cliente.clasificacion.tipo === "vip"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {cliente.clasificacion.tipo}
                  </Badge>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );

  // Navegación principal
  const tabs = [
    { id: "lista", label: "Lista de Clientes", icon: Users },
    { id: "perfil", label: "Perfil Cliente", icon: UserPlus },
    { id: "analiticas", label: "Analíticas", icon: BarChart3 },
    { id: "comunicacion", label: "Comunicación", icon: MessageCircle },
    { id: "fidelizacion", label: "Fidelización", icon: Heart },
  ];

  return (
    <div className="space-y-6">
      {/* Navegación */}
      <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setVista(tab.id as VistaClientes)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md transition-all
              ${
                vista === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-700 hover:text-white"
              }
            `}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {vista === "lista" && renderListaClientes()}
      {vista === "perfil" && renderPerfilCliente()}
      {vista === "analiticas" && renderAnaliticas()}

      {(vista === "comunicacion" || vista === "fidelizacion") && (
        <div className="p-6">
          <EmptyState
            icon={vista === "comunicacion" ? MessageCircle : Heart}
            title={`${
              vista === "comunicacion"
                ? "Sistema de Comunicación"
                : "Programa de Fidelización"
            }`}
            description={`Panel de ${vista} en desarrollo...`}
          />
        </div>
      )}
    </div>
  );
};

export default GestionClientesSuprema;
