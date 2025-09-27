# Guía CSS para Integración de Fuentes - Fase 2

## Implementación de Google Fonts y Variables CSS

### 1. Variables CSS Personalizadas

Agrega estas variables a tu CSS principal (`globals.css`):

```css
:root {
  /* Fuentes por defecto */
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-button: 'Inter', sans-serif;
  
  /* Tamaños de fuente */
  --heading-size: 2.5rem;
  --body-size: 1rem;
  --line-height: 1.5;
  
  /* Colores de branding existentes */
  --brand-primary: #8B5CF6;
  --brand-secondary: #EC4899;
  --brand-button: #10B981;
  --brand-text: #F3F4F6;
  --brand-text-secondary: #D1D5DB;
  --brand-icon: #A78BFA;
}

/* Aplicar fuentes a elementos */
h1, h2, h3, h4, h5, h6, .heading {
  font-family: var(--font-heading);
  font-size: var(--heading-size);
  line-height: var(--line-height);
}

body, p, span, div, .body-text {
  font-family: var(--font-body);
  font-size: var(--body-size);
  line-height: var(--line-height);
}

button, .button, .btn {
  font-family: var(--font-button);
}

/* Responsive font sizes */
@media (max-width: 768px) {
  h1, .heading-large {
    font-size: calc(var(--heading-size) * 0.8);
  }
  
  body, .body-text {
    font-size: calc(var(--body-size) * 0.9);
  }
}
```

### 2. Precargar Google Fonts en Next.js

#### Opción 1: En el `layout.tsx` principal

```tsx
import { Inter, Roboto, Poppins, Montserrat, Playfair_Display, Lora, Oswald, Dancing_Script } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'], variable: '--font-roboto' })
const poppins = Poppins({ weight: ['300', '400', '500', '600', '700'], subsets: ['latin'], variable: '--font-poppins' })
const montserrat = Montserrat({ weight: ['300', '400', '500', '600', '700'], subsets: ['latin'], variable: '--font-montserrat' })
const playfair = Playfair_Display({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-playfair' })
const lora = Lora({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-lora' })
const oswald = Oswald({ weight: ['300', '400', '500', '600', '700'], subsets: ['latin'], variable: '--font-oswald' })
const dancingScript = Dancing_Script({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-dancing-script' })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`
      ${inter.variable} 
      ${roboto.variable} 
      ${poppins.variable} 
      ${montserrat.variable} 
      ${playfair.variable} 
      ${lora.variable} 
      ${oswald.variable} 
      ${dancingScript.variable}
    `}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

#### Opción 2: Carga dinámica (Implementada actualmente)

```tsx
// En el hook use-branding.ts - ya implementado
const loadGoogleFont = (fontId: string) => {
  const font = FONT_OPTIONS.find(f => f.id === fontId)
  if (!font || !font.googleFont || loadedFonts.has(fontId)) return

  const weights = font.weights.join(',')
  const fontName = font.name.replace(/\s+/g, '+')
  const link = document.createElement('link')
  link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@${weights}&display=swap`
  link.rel = 'stylesheet'
  document.head.appendChild(link)

  setLoadedFonts(prev => new Set([...prev, fontId]))
}
```

### 3. Clases CSS Utilitarias

```css
/* Clases de utilidad para fuentes */
.font-heading { font-family: var(--font-heading); }
.font-body { font-family: var(--font-body); }
.font-button { font-family: var(--font-button); }

/* Tamaños de fuente */
.text-heading-sm { font-size: 1.5rem; }
.text-heading-md { font-size: 2rem; }
.text-heading-lg { font-size: 2.5rem; }
.text-heading-xl { font-size: 3rem; }

.text-body-sm { font-size: 0.875rem; }
.text-body-md { font-size: 1rem; }
.text-body-lg { font-size: 1.125rem; }

/* Line heights */
.leading-tight { line-height: 1.2; }
.leading-normal { line-height: 1.5; }
.leading-relaxed { line-height: 1.75; }
```

### 4. Ejemplo de Uso en Componentes

```tsx
// Componente de landing page
export function LandingHero() {
  const { getTypography, getCustomText } = useBranding()
  const typography = getTypography()
  
  return (
    <section className="hero">
      <h1 
        className="font-heading text-heading-lg leading-normal"
        style={{ 
          fontFamily: `var(--font-heading)`,
          fontSize: 'var(--heading-size)',
          lineHeight: 'var(--line-height)'
        }}
      >
        {getCustomText('customTitle') || 'Bienvenido'}
      </h1>
      
      <p 
        className="font-body text-body-md leading-normal"
        style={{ 
          fontFamily: `var(--font-body)`,
          fontSize: 'var(--body-size)',
          lineHeight: 'var(--line-height)'
        }}
      >
        {getCustomText('customSubtitle') || 'Reserva tu cita fácilmente'}
      </p>
      
      <button 
        className="font-button px-6 py-3 rounded-lg"
        style={{ 
          fontFamily: `var(--font-button)`,
          backgroundColor: 'var(--brand-button)',
          color: 'white'
        }}
      >
        {getCustomText('buttonText') || 'Reservar Ahora'}
      </button>
    </section>
  )
}
```

### 5. Optimización de Performance

#### Preload crítico
```html
<!-- En el <head> para fuentes críticas -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" as="style">
```

#### Font display strategy
```css
@font-face {
  font-family: 'Inter';
  font-display: swap; /* Muestra fallback inmediatamente, swap cuando esté listo */
}
```

### 6. Fallbacks de Fuentes

```css
:root {
  --font-sans-fallback: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-serif-fallback: Georgia, 'Times New Roman', serif;
  --font-mono-fallback: 'Monaco', 'Cascadia Code', monospace;
}

/* Aplicar fallbacks */
.font-heading {
  font-family: var(--font-heading), var(--font-sans-fallback);
}

.font-body {
  font-family: var(--font-body), var(--font-sans-fallback);
}
```

## Resultado Final

Con esta implementación tendrás:

1. ✅ **Carga dinámica de fuentes** desde Google Fonts
2. ✅ **Variables CSS automáticas** que se actualizan en tiempo real
3. ✅ **Vista previa inmediata** en la configuración
4. ✅ **Fallbacks de rendimiento** para carga rápida
5. ✅ **Responsive design** con tamaños adaptativos
6. ✅ **TypeScript type-safe** con tipos estrictos

Las fuentes se aplicarán automáticamente a todo el sitio cuando el usuario guarde la configuración en `/settings/typography`.