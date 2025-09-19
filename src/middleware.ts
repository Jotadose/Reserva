import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Lista de subdominios reservados que no son tenants
const RESERVED_SUBDOMAINS = ['www', 'api', 'admin', 'app', 'mail', 'ftp']

// Rutas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/api/protected',
]

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/pricing',
  '/api/auth',
  '/api/webhooks',
]

export default withAuth(
  function middleware(request) {
    const hostname = request.headers.get('host') || ''
    const pathname = request.nextUrl.pathname
    const token = request.nextauth.token
    
    // Extraer subdominio
    const subdomain = hostname.split('.')[0]
    
    // Manejar subdominios para tenants
    if (subdomain && 
        !RESERVED_SUBDOMAINS.includes(subdomain) && 
        !hostname.includes('localhost') &&
        !hostname.includes('127.0.0.1')) {
      
      // Reescribir URL para incluir el tenant en la ruta
      const url = request.nextUrl.clone()
      
      // Si la ruta no empieza con el tenant, reescribir
      if (!pathname.startsWith(`/${subdomain}`)) {
        url.pathname = `/${subdomain}${pathname}`
        return NextResponse.rewrite(url)
      }
    }
    
    // Permitir rutas de tenant dinámicas (páginas públicas de booking)
    const tenantRouteMatch = pathname.match(/^\/([^/]+)\/?$/)
    if (tenantRouteMatch) {
      const tenantSlug = tenantRouteMatch[1]
      // Verificar que no sea una ruta reservada
      if (!RESERVED_SUBDOMAINS.includes(tenantSlug) && 
          !publicRoutes.some(route => pathname.startsWith(route)) &&
          !protectedRoutes.some(route => pathname.startsWith(route))) {
        // Es una ruta de tenant público, permitir acceso
        return NextResponse.next()
      }
    }
    
    // Verificar autenticación para rutas protegidas
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
    
    if (isProtectedRoute && !token) {
      // Redirigir a login si no está autenticado
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Verificar acceso a dashboard de tenant específico
    if (pathname.startsWith('/dashboard/') && token) {
      const pathSegments = pathname.split('/')
      const requestedTenantId = pathSegments[2]
      
      // Verificar que el usuario tenga acceso al tenant solicitado
      if (token.tenant_id !== requestedTenantId) {
        // Redirigir al dashboard correcto del usuario
        if (token.tenant_id) {
          return NextResponse.redirect(new URL(`/dashboard/${token.tenant_id}`, request.url))
        } else {
          // Si no tiene tenant_id, redirigir a login
          return NextResponse.redirect(new URL('/login', request.url))
        }
      }
    }
    
    // Para rutas de API, agregar header con tenant info
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.next()
      response.headers.set('x-tenant-id', subdomain || 'default')
      if (token?.tenant_id) {
        response.headers.set('x-user-tenant-id', token.tenant_id)
      }
      return response
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Permitir rutas públicas sin token
        const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
        if (isPublicRoute) {
          return true
        }
        
        // Requerir token para rutas protegidas
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
        if (isProtectedRoute) {
          return !!token
        }
        
        // Por defecto, permitir acceso
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}