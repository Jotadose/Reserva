'use client'

import { useEffect } from 'react'
import { useTenant } from './use-tenant'

interface BrandingColors {
  primary: string
  secondary: string
  button: string
  text: string
}

export function useBranding() {
  const { tenant } = useTenant()

  const colors: BrandingColors = {
    primary: tenant?.branding?.primaryColor || '#8B5CF6',
    secondary: tenant?.branding?.secondaryColor || '#EC4899',
    button: tenant?.branding?.buttonColor || '#10B981',
    text: tenant?.branding?.textColor || '#F3F4F6'
  }

  // Apply branding colors to CSS custom properties
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      root.style.setProperty('--brand-primary', colors.primary)
      root.style.setProperty('--brand-secondary', colors.secondary)
      root.style.setProperty('--brand-button', colors.button)
      root.style.setProperty('--brand-text', colors.text)
      
      // Generate lighter/darker variants
      root.style.setProperty('--brand-primary-light', colors.primary + '20')
      root.style.setProperty('--brand-primary-dark', colors.primary + '80')
      root.style.setProperty('--brand-secondary-light', colors.secondary + '20')
      root.style.setProperty('--brand-secondary-dark', colors.secondary + '80')
      root.style.setProperty('--brand-text-light', colors.text + '80')
      root.style.setProperty('--brand-text-dark', colors.text + '40')
    }
  }, [colors.primary, colors.secondary, colors.button, colors.text])

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

  const getTextStyle = () => ({
    color: colors.text
  })

  const getGradientClass = () => 'bg-brand-gradient'

  return {
    colors,
    getGradientStyle,
    getPrimaryStyle,
    getSecondaryStyle,
    getButtonStyle,
    getTextStyle,
    getGradientClass,
    logoUrl: tenant?.branding?.logoUrl,
    coverImageUrl: tenant?.branding?.coverImageUrl
  }
}