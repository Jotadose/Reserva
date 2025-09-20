import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const pathname = request.nextUrl.pathname

  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    '/', 
    '/login', 
    '/register', 
    '/pricing', 
    '/demo', 
    '/features',
    '/test-colors',
    '/api'
  ]

  // Rutas que requieren autenticación
  const protectedRoutes = ['/onboarding']

  // Permitir todas las rutas públicas
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return response
  }

  // Verificar autenticación para rutas protegidas y rutas de tenant
  const needsAuth = protectedRoutes.some(route => pathname.startsWith(route)) || 
                   pathname.match(/^\/[^\/]+\/(dashboard|bookings|services|providers|settings)/);

  if (needsAuth) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              request.cookies.set({
                name,
                value,
                ...options,
              })
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              response.cookies.set({
                name,
                value,
                ...options,
              })
            },
            remove(name: string, options: any) {
              request.cookies.set({
                name,
                value: '',
                ...options,
              })
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              response.cookies.set({
                name,
                value: '',
                ...options,
              })
            },
          },
        }
      )

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('message', 'Debes iniciar sesión para acceder a esta página')
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
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
