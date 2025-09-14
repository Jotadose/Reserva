export interface Tenant {
  id: string
  slug: string
  name: string
  plan: 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'suspended' | 'cancelled'
  settings: TenantSettings
  createdAt: string
  updatedAt: string
}

export interface TenantSettings {
  branding: {
    logo?: string
    primaryColor: string
    secondaryColor: string
    customDomain?: string
  }
  business: {
    name: string
    address?: string
    phone?: string
    email: string
    website?: string
    timezone: string
  }
  features: {
    onlineBooking: boolean
    paymentProcessing: boolean
    smsNotifications: boolean
    emailNotifications: boolean
    analytics: boolean
    multiLocation: boolean
  }
  limits: {
    maxUsers: number
    maxBookings: number
    maxServices: number
    storageLimit: number // in MB
  }
}

export interface User {
  id: string
  tenantId: string
  authUserId?: string // Supabase auth user ID
  name: string
  email: string
  phone?: string
  role: 'owner' | 'admin' | 'provider' | 'client'
  avatarUrl?: string
  settings: UserSettings
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserSettings {
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  preferences: {
    language: string
    timezone: string
    theme: 'light' | 'dark' | 'system'
  }
}

export interface Service {
  id: string
  tenantId: string
  name: string
  description?: string
  price: number // in cents
  durationMinutes: number
  category?: string
  color: string
  isActive: boolean
  settings: ServiceSettings
  createdAt: string
  updatedAt: string
}

export interface ServiceSettings {
  requiresProvider: boolean
  maxConcurrent: number
  preparationTime: number // minutes
  cleanupTime: number // minutes
  bookingWindow: {
    minAdvance: number // hours
    maxAdvance: number // days
  }
}

export interface Provider {
  id: string
  tenantId: string
  userId: string
  bio?: string
  specialties: string[]
  commissionRate: number // percentage
  schedule: ProviderSchedule
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProviderSchedule {
  [key: string]: {
    enabled: boolean
    start: string // HH:MM
    end: string // HH:MM
    breaks: Array<{
      start: string
      end: string
      title?: string
    }>
  }
}

export interface Booking {
  id: string
  tenantId: string
  clientId: string
  providerId: string
  serviceId: string
  scheduledDate: string // YYYY-MM-DD
  scheduledTime: string // HH:MM
  durationMinutes: number
  totalPrice: number // in cents
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  internalNotes?: string
  cancellationReason?: string
  createdAt: string
  updatedAt: string
  confirmedAt?: string
  completedAt?: string
  cancelledAt?: string
}

export interface AvailabilityBlock {
  id: string
  tenantId: string
  providerId: string
  startDatetime: string
  endDatetime: string
  type: 'available' | 'break' | 'vacation' | 'blocked'
  reason?: string
  createdAt: string
}