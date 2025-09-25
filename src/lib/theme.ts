export interface BrandingTheme {
  primaryColor: string
  secondaryColor: string
  buttonColor: string
  backgroundColor: string
  textColor: string
  cardColor: string
  accentColor: string
}

export const defaultTheme: BrandingTheme = {
  primaryColor: '#8B5CF6', // Purple
  secondaryColor: '#A855F7', // Purple lighter
  buttonColor: '#7C3AED', // Purple darker
  backgroundColor: '#1A0B2E', // Dark purple
  textColor: '#FFFFFF',
  cardColor: 'rgba(255, 255, 255, 0.1)', // Glass morphism
  accentColor: '#F59E0B', // Gold accent
}

export function getTenantTheme(tenant: any): BrandingTheme {
  const settings = tenant?.settings?.branding
  
  return {
    primaryColor: settings?.primaryColor || defaultTheme.primaryColor,
    secondaryColor: settings?.secondaryColor || defaultTheme.secondaryColor,
    buttonColor: settings?.buttonColor || defaultTheme.buttonColor,
    backgroundColor: settings?.backgroundColor || defaultTheme.backgroundColor,
    textColor: settings?.textColor || defaultTheme.textColor,
    cardColor: settings?.cardColor || defaultTheme.cardColor,
    accentColor: settings?.accentColor || defaultTheme.accentColor,
  }
}

export function generateGradientBackground(theme: BrandingTheme): string {
  return `linear-gradient(135deg, ${theme.primaryColor}DD, ${theme.secondaryColor}DD, ${theme.primaryColor}DD)`
}

export function generateGlassMorphismCard(): React.CSSProperties {
  return {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  }
}