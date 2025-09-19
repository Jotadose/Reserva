'use client'

import { TenantProvider } from '@/hooks/use-tenant'
import { SupabaseAuthProvider } from './providers/auth-provider'

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SupabaseAuthProvider>
      <TenantProvider>
        {children}
      </TenantProvider>
    </SupabaseAuthProvider>
  )
}