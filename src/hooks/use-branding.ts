'use client'

import { useEffect } from 'react'
import { useTenant } from './use-tenant'

interface BrandingColors {
  primary: string
  secondary: string
  button: string
  text: string
  textSecondary: string
  icon: string
}

export function useBranding() {
  const { tenant } = useTenant()

  const colors: BrandingColors = {
    primary: tenant?.branding?.primaryColor || '#8B5CF6',
    secondary: tenant?.branding?.secondaryColor || '#EC4899',
    button: tenant?.branding?.buttonColor || '#10B981',
    text: tenant?.branding?.textColor || '#F3F4F6',
    textSecondary: tenant?.branding?.textSecondaryColor || '#D1D5DB',
    icon: tenant?.branding?.iconColor || '#A78BFA'
  }

  // Apply branding colors and fonts to CSS custom properties
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      
      // Colors
      root.style.setProperty('--brand-primary', colors.primary)
      root.style.setProperty('--brand-secondary', colors.secondary)
      root.style.setProperty('--brand-button', colors.button)
      root.style.setProperty('--brand-text', colors.text)
      root.style.setProperty('--brand-text-secondary', colors.textSecondary)
      root.style.setProperty('--brand-icon', colors.icon)
      
      // Generate lighter/darker variants
      root.style.setProperty('--brand-primary-light', colors.primary + '20')
      root.style.setProperty('--brand-primary-dark', colors.primary + '80')
      root.style.setProperty('--brand-secondary-light', colors.secondary + '20')
      root.style.setProperty('--brand-secondary-dark', colors.secondary + '80')
      root.style.setProperty('--brand-text-light', colors.text + '80')
      root.style.setProperty('--brand-text-dark', colors.text + '40')

      // Typography
      const typography = tenant?.branding?.typography
      if (typography) {
        // Font families (would need to be loaded from Google Fonts)
        const fontMap: Record<string, string> = {
          'inter': 'Inter, sans-serif',
          'roboto': 'Roboto, sans-serif',
          'poppins': 'Poppins, sans-serif',
          'montserrat': 'Montserrat, sans-serif',
          'playfair': 'Playfair Display, serif',
          'lora': 'Lora, serif',
          'oswald': 'Oswald, sans-serif',
          'dancing-script': 'Dancing Script, cursive'
        }

        root.style.setProperty('--font-heading', fontMap[typography.headingFont] || 'Inter, sans-serif')
        root.style.setProperty('--font-body', fontMap[typography.bodyFont] || 'Inter, sans-serif')
        root.style.setProperty('--font-button', fontMap[typography.buttonFont] || 'Inter, sans-serif')

        // Font sizes
        const headingSizes = {
          small: '1.5rem',
          medium: '2rem',
          large: '2.5rem',
          xlarge: '3rem'
        }
        
        const bodySizes = {
          small: '0.875rem',
          medium: '1rem',
          large: '1.125rem'
        }

        const lineHeights = {
          tight: '1.2',
          normal: '1.5',
          relaxed: '1.75'
        }

        root.style.setProperty('--heading-size', headingSizes[typography.headingSize])
        root.style.setProperty('--body-size', bodySizes[typography.bodySize])
        root.style.setProperty('--line-height', lineHeights[typography.lineHeight])
      }
    }
  }, [colors.primary, colors.secondary, colors.button, colors.text, colors.textSecondary, colors.icon, tenant?.branding?.typography])

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

  const getTextSecondaryStyle = () => ({
    color: colors.textSecondary
  })

  const getIconStyle = () => ({
    color: colors.icon
  })

  const getCustomText = (key: 'customTitle' | 'customSubtitle' | 'buttonText' | 'whatsappButtonText') => {
    return tenant?.branding?.[key] || ''
  }

  const getGradientClass = () => 'bg-brand-gradient'

  const getGalleryImages = () => {
    return tenant?.branding?.gallery || []
  }

  const getTypography = () => {
    return tenant?.branding?.typography || {
      headingFont: 'inter',
      bodyFont: 'inter',
      buttonFont: 'inter',
      headingSize: 'large',
      bodySize: 'medium',
      lineHeight: 'normal'
    }
  }

  return {
    colors,
    getGradientStyle,
    getPrimaryStyle,
    getSecondaryStyle,
    getButtonStyle,
    getTextStyle,
    getTextSecondaryStyle,
    getIconStyle,
    getCustomText,
    getGalleryImages,
    getTypography,
    getGradientClass,
    logoUrl: tenant?.branding?.logoUrl,
    coverImageUrl: tenant?.branding?.coverImageUrl
  }
}