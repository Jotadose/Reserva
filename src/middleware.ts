import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Patterns para matching de rutas
const TENANT_ROUTE_REGEX = /^\/([^/]+)\/(dashboard|bookings|services|providers|settings)/
const TENANT_EXTRACT_REGEX = /^\/([^/]+)\/(dashboard|bookings|services|providers|settings)/

function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/', '/login', '/register', '/pricing', 
    '/demo', '/features', '/test-colors', '/api',
    '/auth', // Incluir rutas de autenticación como /auth/callback
    '/debug' // Página temporal de debug
  ]
  return publicRoutes.some(route => pathname === route || pathname.startsWith(route))
}

function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ['/onboarding']
  return protectedRoutes.some(route => pathname.startsWith(route)) || 
         TENANT_ROUTE_REGEX.test(pathname)
}

function createSupabaseClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )
}

async function validateTenantAccess(
  pathname: string, 
  supabase: any, 
  userId: string, 
  request: NextRequest
): Promise<NextResponse | null> {
  const tenantMatch = TENANT_EXTRACT_REGEX.exec(pathname)
  if (!tenantMatch) return null

  const tenantSlug = tenantMatch[1]
  
  // Verificar que el tenant existe y está activo
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, owner_id')
    .eq('slug', tenantSlug)
    .eq('subscription_status', 'active')
    .maybeSingle()

  if (!tenant) {
    return NextResponse.redirect(new URL('/404', request.url))
  }

  // Verificar que el usuario es propietario del tenant
  if (tenant.owner_id !== userId) {
    const { data: userTenant } = await supabase
      .from('tenants')
      .select('slug')
      .eq('owner_id', userId)
      .eq('subscription_status', 'active')
      .maybeSingle()

    const redirectUrl = userTenant 
      ? `/${userTenant.slug}/dashboard` 
      : '/onboarding'
    
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return null
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const pathname = request.nextUrl.pathname

  // Permitir rutas públicas
  if (isPublicRoute(pathname)) {
    return response
  }

  // Verificar autenticación para rutas protegidas
  if (isProtectedRoute(pathname)) {
    try {
      const supabase = createSupabaseClient(request, response)
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('message', 'Debes iniciar sesión para acceder a esta página')
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Validar acceso al tenant si es ruta de dashboard
      const tenantValidation = await validateTenantAccess(
        pathname, 
        supabase, 
        session.user.id, 
        request
      )
      
      if (tenantValidation) {
        return tenantValidation
      }

    } catch (error) {
      console.error('Auth middleware error:', error)
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('message', 'Error de autenticación')
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|manifest.json|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)',
  ],
}
