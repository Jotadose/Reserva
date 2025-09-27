'use client'

import { useEffect } from 'react'
import { useTenant } from './use-tenant'

interface BrandingColors {
  primary: string
  secondary: string
  button: string
}

export function useBranding() {
  const { tenant } = useTenant()

  const colors: BrandingColors = {
    primary: tenant?.branding?.primaryColor || '#8B5CF6',
    secondary: tenant?.branding?.secondaryColor || '#EC4899',
    button: tenant?.branding?.buttonColor || '#10B981'
  }

  // Apply branding colors to CSS custom properties
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      root.style.setProperty('--brand-primary', colors.primary)
      root.style.setProperty('--brand-secondary', colors.secondary)
      root.style.setProperty('--brand-button', colors.button)
      
      // Generate lighter/darker variants
      root.style.setProperty('--brand-primary-light', colors.primary + '20')
      root.style.setProperty('--brand-primary-dark', colors.primary + '80')
      root.style.setProperty('--brand-secondary-light', colors.secondary + '20')
      root.style.setProperty('--brand-secondary-dark', colors.secondary + '80')
    }
  }, [colors.primary, colors.secondary, colors.button])

  const getGradientStyle = () => ({
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
  })

  const getPrimaryStyle = () => ({
    backgroundColor: colors.primary
  })

  const getSecondaryStyle = () => ({
    backgroundColor: colors.secondary
  })

  const getButtonStyle = () => ({
    backgroundColor: colors.button
  })

  const getGradientClass = () => 'bg-brand-gradient'

  return {
    colors,
    getGradientStyle,
    getPrimaryStyle,
    getSecondaryStyle,
    getButtonStyle,
    getGradientClass,
    logoUrl: tenant?.branding?.logoUrl,
    coverImageUrl: tenant?.branding?.coverImageUrl
  }
}