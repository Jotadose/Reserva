# 🏗️ MONOREPO PROFESIONAL - SISTEMA DE RESERVAS BARBERÍA

## 📋 ESTRUCTURA DEL PROYECTO

```
reserva-monorepo/
├── 📁 apps/
│   ├── 📱 web/                    # Frontend React + Vite
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── ...
│   └── 🔧 api/                    # Backend Express + Node.js
│       ├── index.js               # Servidor principal
│       ├── package.json
│       └── ...
├── 📦 packages/
│   └── shared/                    # Tipos y utilidades compartidas
│       ├── src/
│       │   ├── types/
│       │   ├── utils/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── 📄 package.json               # Configuración raíz
├── 🛠️ pnpm-workspace.yaml       # Configuración workspace
├── 🚀 vercel.json               # Deploy configuration
└── 📖 README.md
```

## 🎯 CARACTERÍSTICAS PRINCIPALES

### ✅ **FRONTEND (apps/web)**

- **React 18** + **TypeScript** + **Vite**
- **UI Profesional** con sistema de diseño consistente
- **AdminPanelProfessional** con 7 vistas completas
- **Sistema de notificaciones** en tiempo real
- **Responsive design** con Tailwind CSS
- **PWA Ready** con Service Worker

### ✅ **BACKEND (apps/api)**

- **Express.js** + **Node.js** + **TypeScript**
- **REST API** completa con todas las operaciones CRUD
- **Supabase** como base de datos
- **Middleware** de CORS y seguridad
- **Analytics** y reportes integrados
- **Vercel Serverless** compatible

### ✅ **SHARED PACKAGE (packages/shared)**

- **Tipos TypeScript** compartidos
- **Utilidades** comunes (validación, formateo, etc.)
- **Constants** y configuraciones
- **Consistent API interfaces**

## 🚀 COMANDOS PRINCIPALES

### **Desarrollo**

```bash
# Instalar dependencias (toda la monorepo)
pnpm install

# Desarrollo completo (frontend + API)
pnpm run dev

# Solo frontend
pnpm run dev:web

# Solo API
pnpm run dev:api
```

### **Build & Deploy**

```bash
# Build completo
pnpm run build

# Build solo frontend
pnpm run build:web

# Build solo API
pnpm run build:api

# Deploy a Vercel
pnpm run deploy

# Deploy preview
pnpm run deploy:preview
```

### **Utilidades**

```bash
# Linting
pnpm run lint

# Type checking
pnpm run type-check

# Limpiar builds
pnpm run clean

# Tests
pnpm run test
```

## 🔧 CONFIGURACIÓN DE DESARROLLO

### **1. Variables de Entorno**

**apps/web/.env.local**

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001/api
```

**apps/api/.env**

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5174
```

### **2. Instalación Inicial**

```bash
# Clonar repositorio
git clone https://github.com/Jotadose/Reserva.git
cd Reserva

# Instalar pnpm si no lo tienes
npm install -g pnpm

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Iniciar desarrollo
pnpm run dev
```

## 🌐 DEPLOYMENT EN VERCEL

### **Configuración Automática**

El proyecto incluye `vercel.json` configurado para:

- ✅ **Frontend estático** en `/`
- ✅ **API serverless** en `/api/*`
- ✅ **Monorepo build** automático
- ✅ **Environment variables** automáticas

### **Deploy Commands**

```bash
# Primera vez
vercel --prod

# Deploys posteriores
pnpm run deploy
```

### **Variables de Entorno en Vercel**

Configurar en Vercel Dashboard:

```
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_key
NODE_ENV=production
```

## 📊 API ENDPOINTS

### **Usuarios/Clientes**

```
GET    /api/usuarios          # Listar usuarios
POST   /api/usuarios          # Crear usuario
GET    /api/usuarios/:id      # Obtener usuario
PUT    /api/usuarios/:id      # Actualizar usuario
```

### **Servicios**

```
GET    /api/servicios         # Listar servicios
POST   /api/servicios         # Crear servicio
PUT    /api/servicios/:id     # Actualizar servicio
```

### **Reservas**

```
GET    /api/reservas          # Listar reservas
POST   /api/reservas          # Crear reserva
PUT    /api/reservas/:id      # Actualizar reserva
```

### **Disponibilidad**

```
GET    /api/disponibilidad    # Obtener slots disponibles
```

### **Analytics**

```
GET    /api/analytics/resumen # Estadísticas generales
```

### **Sistema**

```
GET    /api/health            # Estado del sistema
GET    /                      # Info de la API
```

## 🎨 FRONTEND ROUTES

- `/` - Landing page
- `/reservas` - Sistema de reservas
- `/admin` - Panel básico
- `/admin-pro` - Panel profesional completo

## 🔒 SEGURIDAD Y CORS

### **CORS Configuration**

```javascript
cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://your-vercel-app.vercel.app",
  ],
  credentials: true,
});
```

### **API Security**

- ✅ **Input validation**
- ✅ **Error handling** robusto
- ✅ **Rate limiting** (Vercel automático)
- ✅ **HTTPS** en producción

## 📈 PERFORMANCE

### **Frontend**

- ✅ **Code splitting** automático con Vite
- ✅ **Tree shaking** optimizado
- ✅ **Asset optimization**
- ✅ **PWA caching**

### **Backend**

- ✅ **Serverless functions** (cold start optimizado)
- ✅ **Database connection pooling**
- ✅ **Response caching**
- ✅ **Gzip compression**

## 🧪 TESTING

```bash
# Unit tests
pnpm run test

# E2E tests (si están configurados)
pnpm run test:e2e

# API tests
pnpm run test:api
```

## 📝 DESARROLLO

### **Agregar Nueva Feature**

1. **Frontend**: Crear componente en `apps/web/src/components/`
2. **Backend**: Agregar endpoint en `apps/api/index.js`
3. **Shared**: Actualizar tipos en `packages/shared/src/types/`
4. **Test**: Verificar funcionamiento completo

### **Debugging**

```bash
# Frontend dev tools
pnpm run dev:web

# API logs
pnpm run dev:api

# Type checking
pnpm run type-check
```

## 🌟 ROADMAP

### **Próximas Features**

- [ ] **Autenticación** completa (JWT + roles)
- [ ] **WebSockets** para notificaciones real-time
- [ ] **WhatsApp API** para notificaciones
- [ ] **Pagos** integrados (WebPay, Stripe)
- [ ] **Multi-tenant** (múltiples barberías)
- [ ] **Mobile App** (React Native)
- [ ] **Advanced Analytics** (Chart.js/D3)

### **Optimizaciones Técnicas**

- [ ] **Redis caching**
- [ ] **Database migrations** automáticas
- [ ] **CI/CD pipeline** completo
- [ ] **Monitoring** (Sentry, DataDog)
- [ ] **Load testing**

## 🔗 URLS IMPORTANTES

### **Desarrollo**

- Frontend: http://localhost:5174
- API: http://localhost:3001
- API Health: http://localhost:3001/api/health

### **Producción**

- App: https://reserva-imfi1r7az-jotadoses-projects.vercel.app
- API: https://reserva-imfi1r7az-jotadoses-projects.vercel.app/api

---

## 💡 NOTAS IMPORTANTES

1. **pnpm** es requerido para el workspace
2. **Node.js 18+** es recomendado
3. **Variables de entorno** deben estar configuradas
4. **Supabase** debe estar funcionando
5. **Vercel CLI** para deploys manuales

## 🆘 SOPORTE

Si tienes problemas:

1. Verificar variables de entorno
2. Revisar logs en terminal
3. Verificar conexión a Supabase
4. Revisar Vercel deployment logs
