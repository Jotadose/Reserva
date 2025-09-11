import React from 'react';
import { Calendar, Users, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { StatCard } from './StatCard';
import { SummaryCard } from './SummaryCard';
import { SystemStatus } from './SystemStatus';

// Tipos
interface Stats {
  reservasHoy: number;
  reservasSemana: number;
  reservasMes: number;
  ingresosHoy: number;
  ingresosSemana: number;
  ingresosMes: number;
  totalClientes: number;
  tasaAsistencia: number;
}

interface DashboardProps {
  stats: Stats;
  barberosCount: number;
  serviciosCount: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, barberosCount, serviciosCount }) => {
  return (
    <div className="space-y-6">
      {/* Estadísticas principales - Mobile Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Hoy" value={stats.reservasHoy} icon={Calendar} iconColor="text-yellow-500" />
        <StatCard title="Ingresos" value={`$${stats.ingresosHoy.toLocaleString('es-CL')}`} icon={DollarSign} iconColor="text-green-400" />
        <StatCard title="Clientes" value={stats.totalClientes} icon={Users} iconColor="text-purple-400" />
        <StatCard title="Asistencia" value={`${stats.tasaAsistencia}%`} icon={TrendingUp} iconColor="text-yellow-400" />
      </div>

      {/* Resúmenes semanales y mensuales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <SummaryCard 
          title="Resumen Semanal"
          items={[
            { label: "Reservas", value: stats.reservasSemana },
            { label: "Ingresos", value: `$${stats.ingresosSemana.toLocaleString('es-CL')}` }
          ]}
        />
        <SummaryCard 
          title="Resumen Mensual"
          items={[
            { label: "Reservas", value: stats.reservasMes },
            { label: "Ingresos", value: `$${stats.ingresosMes.toLocaleString('es-CL')}` }
          ]}
        />
      </div>

      {/* Estado del sistema */}
      <SystemStatus barberosCount={barberosCount} serviciosCount={serviciosCount} />
    </div>
  );
};