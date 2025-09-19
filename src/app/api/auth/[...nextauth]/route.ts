import NextAuth from 'next-auth'
import { SupabaseAdapter } from '@next-auth/supabase-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { JWT } from 'next-auth/jwt'
import { Session } from 'next-auth'

// Extender los tipos de NextAuth para incluir tenant_id
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      tenant_id?: string
      role?: string
    }
  }
  
  interface User {
    id: string
    email: string
    name: string
    tenant_id?: string
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    tenant_id?: string
    role?: string
    user_id?: string
  }
}

const authOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        tenant_slug: { label: 'Tenant Slug', type: 'text', optional: true }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos')
        }

        try {
          // 1. Autenticar con Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (authError || !authData.user) {
            throw new Error('Credenciales inválidas')
          }

          // 2. Obtener información del usuario desde nuestra tabla users
          const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select(`
              id,
              tenant_id,
              email,
              name,
              phone,
              role,
              status,
              tenants!inner(
                id,
                slug,
                name,
                subscription_status
              )
            `)
            .eq('email', credentials.email)
            .eq('status', 'active')
            .single()

          if (userError || !userData) {
            throw new Error('Usuario no encontrado o inactivo')
          }

          // 3. Verificar que el tenant esté activo
          if (userData.tenants.subscription_status !== 'active' && userData.tenants.subscription_status !== 'trial') {
            throw new Error('La suscripción de la barbería no está activa')
          }

          // 4. Si se proporciona tenant_slug, verificar que coincida
          if (credentials.tenant_slug && userData.tenants.slug !== credentials.tenant_slug) {
            throw new Error('No tienes acceso a esta barbería')
          }

          return {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            tenant_id: userData.tenant_id,
            role: userData.role,
          }
        } catch (error) {
          console.error('Error en autorización:', error)
          throw new Error(error instanceof Error ? error.message : 'Error de autenticación')
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      // Cuando el usuario se autentica por primera vez
      if (user) {
        token.user_id = user.id
        token.tenant_id = user.tenant_id
        token.role = user.role
      }
      return token
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      // Agregar información del token a la sesión
      if (token) {
        session.user.id = token.user_id as string
        session.user.tenant_id = token.tenant_id
        session.user.role = token.role
      }
      return session
    },

    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Redirigir después del login
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      // Si la URL contiene el baseUrl, permitir la redirección
      if (new URL(url).origin === baseUrl) {
        return url
      }
      return baseUrl
    },
  },

  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/login',
  },

  session: {
    strategy: 'jwt' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 días
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST, authOptions }