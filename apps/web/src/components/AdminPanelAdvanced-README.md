# AdminPanelAdvanced Component Documentation

## Descripción General
El componente `AdminPanelAdvanced.tsx` es un panel de administración completo y responsive para la gestión de una barbería. Proporciona una interfaz unificada para administrar reservas, clientes, servicios y estadísticas.

## Estructura del Componente

### 1. Imports y Dependencias
- **React Hooks**: `useState`, `useEffect`, `useMemo`
- **Iconos Lucide**: Amplia gama de iconos para UI
- **Store**: `useAppStore` para gestión de estado global

### 2. Estados Principales
```typescript
const [activeSection, setActiveSection] = useState("overview");
const [sidebarOpen, setSidebarOpen] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
```

### 3. Secciones del Panel

#### Overview (Vista General)
- **StatsCards**: Tarjetas con estadísticas clave
- **Gráficos**: Reservas por estado, ingresos mensuales
- **Actividad Reciente**: Lista de últimas reservas

#### Reservas
- **Filtros**: Por estado, fecha, barbero, servicio
- **Tabla Responsive**: Lista completa de reservas
- **Acciones**: Editar, eliminar, cambiar estado

#### Clientes
- **Tabla de Usuarios**: Información completa de clientes
- **Estadísticas**: Número de reservas, última visita
- **Acciones**: Ver perfil, editar información

#### Servicios
- **Grid de Servicios**: Catálogo visual de servicios
- **Gestión**: Crear, editar, eliminar servicios
- **Información**: Precio, duración, descripción

#### Barberos
- **Placeholder**: Sección preparada para futura implementación

#### Configuración
- **Placeholder**: Sección preparada para configuraciones del sistema

## Características de Responsividad

### Mobile-First Design
- **Breakpoints**: `sm:` (640px+), `md:` (768px+), `lg:` (1024px+)
- **Sidebar Colapsable**: Se oculta en móviles, overlay en tablets
- **Tablas Responsive**: Columnas se ocultan según el tamaño de pantalla
- **Grid Adaptativo**: Cambia de 1 columna a múltiples según dispositivo

### Elementos Responsive Específicos

#### Sidebar
```typescript
// Móvil: Overlay con backdrop
// Desktop: Sidebar fijo lateral
const sidebarClasses = `fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`;
```

#### Header
```typescript
// Botón de menú solo visible en móviles
<button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
  <Menu className="h-6 w-6" />
</button>
```

#### Tablas
```typescript
// Columnas se ocultan en pantallas pequeñas
<th className="hidden sm:table-cell">Servicio</th>
<th className="hidden md:table-cell">Última Visita</th>
```

## Gestión de Estado

### Store Global
```typescript
const {
  reservas,
  usuarios,
  servicios,
  barberos,
  fetchReservas,
  fetchUsuarios,
  fetchServicios,
  updateReservaEstado,
} = useAppStore();
```

### Estados Calculados
```typescript
const stats = useMemo(() => ({
  totalReservas: reservas.length,
  reservasHoy: reservasHoy.length,
  ingresosMes: reservasCompletadas.reduce((sum, r) => sum + (r.precio_total || 0), 0),
  clientesActivos: new Set(reservas.map(r => r.usuario_id)).size,
}), [reservas]);
```

## Funciones Principales

### Cambio de Estado de Reservas
```typescript
const handleEstadoChange = async (reservaId: string, nuevoEstado: string) => {
  await updateReservaEstado(reservaId, nuevoEstado);
  await fetchReservas();
};
```

### Exportación de Datos
```typescript
const exportToCSV = (data: any[], filename: string) => {
  // Convierte datos a CSV y descarga
};
```

### Filtrado y Búsqueda
```typescript
const filteredData = useMemo(() => {
  return data.filter(item => 
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [data, searchTerm]);
```

## Componentes Auxiliares

### StatsCard
```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}
```

### EstadoItem
```typescript
interface EstadoItemProps {
  estado: string;
  onChange: (nuevoEstado: string) => void;
}
```

## Patrones de Diseño Utilizados

### 1. Compound Components
- Sidebar + Main Content
- Header + Navigation + Content Area

### 2. Render Props Pattern
- Secciones como funciones que reciben props

### 3. Custom Hooks Pattern
- `useAppStore` para gestión de estado
- `useMemo` para cálculos optimizados

## Estilos y Tema

### Color Palette
- **Background**: `slate-900`, `slate-800`
- **Borders**: `slate-700`, `slate-600`
- **Text**: `white`, `slate-300`, `slate-400`
- **Accents**: `blue-600`, `green-600`, `yellow-500`

### Spacing System
- **Padding**: `p-4`, `p-6` (responsive)
- **Margins**: `space-y-4`, `space-y-6`
- **Gaps**: `gap-4`, `gap-6`

## Consideraciones para Futuras Implementaciones

### 1. Consistencia de Componentes
- Usar los mismos patrones de responsive design
- Mantener la paleta de colores establecida
- Seguir la estructura de secciones modulares

### 2. Patrones de Estado
- Utilizar `useAppStore` para datos globales
- `useState` para estados locales del componente
- `useMemo` para cálculos costosos

### 3. Estructura de Archivos
- Componentes auxiliares en archivos separados si crecen
- Mantener la documentación actualizada
- Usar TypeScript para tipado fuerte

### 4. Accesibilidad
- Mantener contraste adecuado
- Usar semantic HTML
- Implementar navegación por teclado

### 5. Performance
- Lazy loading para secciones grandes
- Virtualización para listas largas
- Memoización de componentes pesados

## Testing Recommendations

### Unit Tests
- Funciones de cálculo de estadísticas
- Filtros y búsquedas
- Cambios de estado

### Integration Tests
- Navegación entre secciones
- Responsive behavior
- Store interactions

### E2E Tests
- Flujos completos de gestión
- Responsive design en diferentes dispositivos
- Funcionalidades críticas del negocio