import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Lista de subdominios reservados que no son tenants
const RESERVED_SUBDOMAINS = ['www', 'api', 'admin', 'app', 'mail', 'ftp']

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  
  // Extraer subdominio
  const subdomain = hostname.split('.')[0]
  
  // Si es un subdominio válido (no reservado y no localhost)
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
  
  // Para rutas de API, agregar header con tenant info
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    response.headers.set('x-tenant-id', subdomain || 'default')
    return response
  }
  
  return NextResponse.next()
}

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