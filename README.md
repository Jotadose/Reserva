# 🎯 Agendex SaaS - Sistema de Reservas Multi-Tenant

**Agendex** es una plataforma SaaS moderna para la gestión de citas y reservas, diseñada específicamente para barberías y salones de belleza. Construida con **Next.js 15**, **Supabase** y **TypeScript**.

## 🚀 Estado Actual del Proyecto

✅ **Funcionalidades Implementadas:**
- **Sistema multi-tenant** completo con subdominios por barbería
- **Autenticación robusta** con Supabase Auth
- **Onboarding wizard** de 4 pasos para nuevas barberías
- **Dashboard administrativo** con gestión de servicios, barberos y reservas
- **Booking widget público** con disponibilidad en tiempo real
- **Landing pages personalizadas** por tenant con portfolio y horarios
- **Página de pricing** con 4 planes (Solo, Crecimiento, Pro Multi, Enterprise)
- **Row Level Security (RLS)** para seguridad multi-tenant
- **APIs robustas** para todas las entidades (tenants, services, bookings, etc.)

## 🛠️ Tecnologías Utilizadas

- **Frontend:** Next.js 15 (App Router), TypeScript, TailwindCSS
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **UI Components:** Shadcn/ui
- **Styling:** Tailwind CSS con sistema de diseño coherente
- **Hosting:** Vercel (recomendado)

## 📦 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/agendex-saas.git
cd agendex-saas
npm install
```

### 2. Configurar Supabase

1. **Crear proyecto en Supabase:**
   - Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
   - Crea un nuevo proyecto
   - Anota la URL y las claves del proyecto

2. **Ejecutar migraciones:**
   - Abre el editor SQL en tu dashboard de Supabase
   - Copia y ejecuta el contenido de `supabase-migrations.sql`
   - Esto creará todas las tablas, índices y políticas RLS

3. **Configurar variables de entorno:**

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Configuración de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-nextauth-secret-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Agendex"
```

### 3. Ejecutar el Proyecto

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:3000`

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js 15
│   ├── (auth)/            # Páginas de autenticación
│   ├── (dashboard)/       # Panel administrativo por tenant
│   ├── (public)/          # Páginas públicas
│   ├── [tenant]/          # Landing pages dinámicas por tenant
│   ├── pricing/           # Página de planes y precios
│   ├── onboarding/        # Wizard de configuración
│   └── setup/             # Configuración de Supabase
├── components/            # Componentes reutilizables
│   ├── booking/           # Widget de reservas
│   ├── dashboard/         # Componentes del admin
│   ├── tenant/            # Componentes públicos por tenant
│   └── ui/                # Componentes base (Shadcn)
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y configuración
├── store/                 # Estado global (si se necesita)
└── types/                 # Definiciones de TypeScript
```

## 🎮 Uso del Sistema

### Para Nuevas Barberías:

1. **Visitar la landing principal** → `/`
2. **Explorar planes** → `/pricing`
3. **Completar onboarding** → `/onboarding` (wizard de 4 pasos)
4. **Gestionar barbería** → `/{tu-barberia}/dashboard`

### Para Clientes:

1. **Visitar página de barbería** → `/{nombre-barberia}`
2. **Explorar servicios y portfolio**
3. **Hacer reserva** através del booking widget
4. **Recibir confirmación** por WhatsApp/email

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting con ESLint
npm run type-check   # Verificación de tipos
```

## 🚨 Solución de Problemas

### Supabase no configurado
Si ves errores relacionados con Supabase:

1. Ve a `/setup` para diagnósticos
2. Verifica las variables de entorno
3. Asegúrate de haber ejecutado las migraciones

### Errores de autenticación
- Verifica que las URLs en Supabase coincidan con tu dominio
- Revisa que las políticas RLS estén activas
- Confirma que el usuario tenga permisos en el tenant

### Problemas de build
```bash
# Limpiar cache de Next.js
rm -rf .next
npm run build
```

## 🎯 Próximas Funcionalidades

- [ ] **Pagos con Stripe** - Suscripciones recurrentes
- [ ] **Notificaciones WhatsApp** - Integración con WhatsApp Business API
- [ ] **Multi-ubicación** - Gestión de múltiples sucursales
- [ ] **Analytics avanzados** - Reportes de ingresos y retención
- [ ] **White label** - Marca propia para franquicias
- [ ] **API pública** - Integraciones con sistemas externos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación:** [docs.agendex.studio](https://docs.agendex.studio)
- **Issues:** [GitHub Issues](https://github.com/tu-usuario/agendex-saas/issues)
- **Email:** soporte@agendex.studio

---

**Desarrollado con ❤️ para la comunidad de barberos profesionales**
