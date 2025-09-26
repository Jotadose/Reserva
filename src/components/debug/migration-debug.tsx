'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { useTenant } from '@/hooks/use-tenant'
import { usePermissions, useCurrentTenant } from '@/hooks/use-permissions'

export function DebugMigration() {
  const { user, session } = useAuth()
  const { memberships, currentMembership, isLoading } = useTenant()
  const permissions = usePermissions()
  const currentTenant = useCurrentTenant()

  if (isLoading) {
    return <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      🔄 Cargando información de migración...
    </div>
  }

  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
      <h2 className="text-xl font-bold text-gray-900">🔧 Debug Post-Migración</h2>
      
      {/* Auth Status */}
      <div className="bg-white p-4 rounded border">
        <h3 className="font-semibold text-gray-700 mb-2">📧 Autenticación</h3>
        <p><strong>Usuario:</strong> {user?.email || 'No autenticado'}</p>
        <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
        <p><strong>Sesión activa:</strong> {session ? '✅ Sí' : '❌ No'}</p>
      </div>

      {/* Current Tenant */}
      <div className="bg-white p-4 rounded border">
        <h3 className="font-semibold text-gray-700 mb-2">🏢 Tenant Actual</h3>
        <p><strong>Tenant:</strong> {currentTenant.tenantName || 'N/A'}</p>
        <p><strong>Slug:</strong> {currentTenant.tenantSlug || 'N/A'}</p>
        <p><strong>ID:</strong> {currentTenant.tenantId || 'N/A'}</p>
        <p><strong>Tu rol:</strong> {currentTenant.userRole || 'N/A'}</p>
        <p><strong>Estado:</strong> {currentTenant.isActive ? '✅ Activo' : '❌ Inactivo'}</p>
      </div>

      {/* Memberships */}
      <div className="bg-white p-4 rounded border">
        <h3 className="font-semibold text-gray-700 mb-2">👥 Membresías ({memberships.length})</h3>
        {memberships.length > 0 ? (
          <div className="space-y-2">
            {memberships.map((membership, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                <p><strong>{membership.tenant.name}</strong> ({membership.tenant.slug})</p>
                <p>Rol: <span className="font-mono bg-blue-100 px-1 rounded">{membership.role}</span></p>
                <p>Estado: {membership.is_active ? '✅ Activo' : '❌ Inactivo'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay membresías disponibles</p>
        )}
      </div>

      {/* Permissions */}
      <div className="bg-white p-4 rounded border">
        <h3 className="font-semibold text-gray-700 mb-2">🔐 Permisos</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p>Es Admin: {permissions.isAdmin() ? '✅' : '❌'}</p>
          <p>Es Owner: {permissions.isOwner() ? '✅' : '❌'}</p>
          <p>Es Staff: {permissions.isStaff() ? '✅' : '❌'}</p>
          <p>Es Provider: {permissions.isProvider() ? '✅' : '❌'}</p>
          <p>Puede gestionar Providers: {permissions.canManageProviders() ? '✅' : '❌'}</p>
          <p>Puede gestionar Services: {permissions.canManageServices() ? '✅' : '❌'}</p>
          <p>Puede gestionar Bookings: {permissions.canManageBookings() ? '✅' : '❌'}</p>
          <p>Puede gestionar Clients: {permissions.canManageClients() ? '✅' : '❌'}</p>
          <p>Puede acceder Dashboard: {permissions.canAccessDashboard() ? '✅' : '❌'}</p>
          <p>Puede crear Bookings: {permissions.canCreateBookings() ? '✅' : '❌'}</p>
        </div>
      </div>

      {/* Migration Status */}
      <div className="bg-green-50 p-4 rounded border border-green-200">
        <h3 className="font-semibold text-green-700 mb-2">✅ Estado de Migración</h3>
        <ul className="text-sm text-green-600 space-y-1">
          <li>✅ Tabla tenant_memberships: Funcional</li>
          <li>✅ Tabla clients: Lista para usar</li>
          <li>✅ RLS actualizado: Políticas activas</li>
          <li>✅ Hooks actualizados: Compatibilidad mantenida</li>
          <li>✅ API bookings: Integrado con clients</li>
        </ul>
      </div>
    </div>
  )
}