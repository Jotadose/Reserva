'use client'

import { useTenant } from './use-tenant'

/**
 * Hook helper para permissions y roles - simplifica el uso de tenant memberships
 */
export function usePermissions() {
  const { currentMembership, hasRole, isAdmin, canManage } = useTenant()

  return {
    // Current user info
    currentRole: currentMembership?.role || null,
    isActive: currentMembership?.is_active || false,
    tenantId: currentMembership?.tenant_id || null,

    // Permission checks
    hasRole,
    isAdmin,
    canManage,

    // Specific role checks
    isOwner: (tenantId?: string) => hasRole('owner', tenantId),
    isStaff: (tenantId?: string) => hasRole(['owner', 'admin', 'staff'], tenantId),
    isProvider: (tenantId?: string) => hasRole('provider', tenantId),
    isViewer: (tenantId?: string) => hasRole('viewer', tenantId),

    // Resource-specific permissions
    canManageProviders: (tenantId?: string) => canManage('providers', tenantId),
    canManageServices: (tenantId?: string) => canManage('services', tenantId),
    canManageBookings: (tenantId?: string) => canManage('bookings', tenantId),
    canManageClients: (tenantId?: string) => canManage('clients', tenantId),
    canManageSettings: (tenantId?: string) => canManage('settings', tenantId),
    canManageBilling: (tenantId?: string) => canManage('billing', tenantId),

    // UI helpers
    canAccessDashboard: () => hasRole(['owner', 'admin', 'staff', 'provider']),
    canCreateBookings: () => hasRole(['owner', 'admin', 'staff', 'provider']),
    canViewReports: () => hasRole(['owner', 'admin']),
    canInviteUsers: () => hasRole(['owner', 'admin']),
  }
}

/**
 * Hook para obtener información del tenant actual de forma simplificada
 */
export function useCurrentTenant() {
  const { currentMembership } = useTenant()
  
  return {
    tenant: currentMembership?.tenant || null,
    tenantId: currentMembership?.tenant_id || null,
    tenantSlug: currentMembership?.tenant?.slug || null,
    tenantName: currentMembership?.tenant?.name || null,
    userRole: currentMembership?.role || null,
    isActive: currentMembership?.is_active || false,
  }
}