import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Rutas que requieren autenticación
const protectedRoutes = ['/dashboard']

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/', '/login', '/register', '/pricing', '/api/auth', '/api/webhooks']

export default withAuth(
  function middleware(request) {
    const pathname = request.nextUrl.pathname
    const token = request.nextauth.token
    
    // Permitir todas las rutas públicas
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next()
    }
    
    // Verificar autenticación para rutas protegidas
    if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req }) => {
        const { pathname } = req.nextUrl
        
        // Permitir rutas públicas sin token
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true
        }
        
        // Por defecto, permitir acceso
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|manifest.json|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)',
  ],
}