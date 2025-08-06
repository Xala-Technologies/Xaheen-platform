/**
 * Tailwind Configuration - Xaheen Design System
 * Enhanced with professional design tokens
 * WCAG AAA compliant color system
 */

// Import tokens directly from source during development
const path = require('path');

// Helper to load ES modules
const loadModule = (modulePath) => {
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
};

// Load design tokens from CommonJS file
const { colorTokens, cssColorTokens, typographyTokens, spacingTokens } = require('./tailwind-tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx}',
    './registry/**/*.{ts,tsx}',
    './stories/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Enhanced Color System - Dynamic CSS Custom Properties
      colors: {
        // Primary Brand Colors - Dynamic from theme system
        primary: {
          DEFAULT: 'var(--color-primary-600)',
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          950: 'var(--color-primary-950)',
          foreground: 'var(--color-primary-foreground)',
        },
        
        // Secondary Brand Colors - Dynamic from theme system
        secondary: {
          DEFAULT: 'var(--color-secondary-600)',
          50: 'var(--color-secondary-50)',
          100: 'var(--color-secondary-100)',
          200: 'var(--color-secondary-200)',
          300: 'var(--color-secondary-300)',
          400: 'var(--color-secondary-400)',
          500: 'var(--color-secondary-500)',
          600: 'var(--color-secondary-600)',
          700: 'var(--color-secondary-700)',
          800: 'var(--color-secondary-800)',
          900: 'var(--color-secondary-900)',
          950: 'var(--color-secondary-950)',
          foreground: 'var(--color-secondary-foreground)',
        },
        
        // Accent Colors - Dynamic from theme system
        accent: {
          DEFAULT: 'var(--color-accent-primary)',
          primary: 'var(--color-accent-primary)',
          secondary: 'var(--color-accent-secondary)',
          tertiary: 'var(--color-accent-tertiary)',
          foreground: 'var(--color-accent-foreground)',
        },
        
        // Semantic Colors - Dynamic from theme system
        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-success-foreground)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          foreground: 'var(--color-warning-foreground)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          foreground: 'var(--color-error-foreground)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          foreground: 'var(--color-info-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--color-error)',
          foreground: 'var(--color-error-foreground)',
        },
        
        // NSM Security Classifications
        nsm: {
          open: colorTokens.nsm.open,
          restricted: colorTokens.nsm.restricted,
          confidential: colorTokens.nsm.confidential,
          secret: colorTokens.nsm.secret,
        },
        
        // Neutral Colors
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: {
          DEFAULT: 'var(--color-surface)',
          foreground: 'var(--color-foreground)',
        },
        popover: {
          DEFAULT: 'var(--color-surface)',
          foreground: 'var(--color-foreground)',
        },
        muted: {
          DEFAULT: 'var(--color-background-secondary)',
          foreground: 'var(--color-foreground-secondary)',
        },
        border: 'var(--color-border)',
        input: 'var(--color-input-border)',
        ring: 'var(--color-ring)',
        
        // Gradients (as background utilities)
        gradient: colorTokens.gradient,
      },
      
      // Enhanced Typography
      fontFamily: {
        sans: typographyTokens.fontFamily.sans,
        mono: typographyTokens.fontFamily.mono,
        display: typographyTokens.fontFamily.display,
      },
      
      fontSize: {
        // Fluid typography
        'xs': typographyTokens.fontSize.xs,
        'sm': typographyTokens.fontSize.sm,
        'base': typographyTokens.fontSize.base,
        'lg': typographyTokens.fontSize.lg,
        'xl': typographyTokens.fontSize.xl,
        '2xl': typographyTokens.fontSize['2xl'],
        '3xl': typographyTokens.fontSize['3xl'],
        '4xl': typographyTokens.fontSize['4xl'],
        '5xl': typographyTokens.fontSize['5xl'],
        '6xl': typographyTokens.fontSize['6xl'],
        '7xl': typographyTokens.fontSize['7xl'],
      },
      
      fontWeight: typographyTokens.fontWeight,
      lineHeight: typographyTokens.lineHeight,
      letterSpacing: typographyTokens.letterSpacing,
      
      // Enhanced Spacing
      spacing: {
        ...spacingTokens.scale,
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      
      // Border Radius
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',  // 4px
        'DEFAULT': '0.375rem', // 6px
        'md': '0.5rem',   // 8px
        'lg': '0.75rem',  // 12px
        'xl': '1rem',     // 16px
        '2xl': '1.5rem',  // 24px
        '3xl': '2rem',    // 32px
        'full': '9999px',
      },
      
      // Shadows (Enhanced)
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
      },
      
      // Animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-in',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 2s infinite',
        'wave': 'wave 2s infinite',
        'slideUp': 'slideUp 0.8s ease-out forwards',
        'indeterminateProgress': 'indeterminateProgress 2s linear infinite',
        'circularProgress': 'circularProgress 2s ease-in-out infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        wave: {
          '0%, 100%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', height: '0' },
          '100%': { transform: 'translateY(0)', height: 'var(--bar-height)' },
        },
        indeterminateProgress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        circularProgress: {
          '0%': { strokeDasharray: '0 100' },
          '100%': { strokeDasharray: '100 0' },
        },
      },
      
      // Transitions
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      
      // Z-index Scale
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'notification': '1080',
      },
    },
  },
  plugins: [
    // Add plugin for CSS custom properties
    function({ addBase }) {
      addBase({
        ':root': cssColorTokens.light,
        '.dark': cssColorTokens.dark,
        // Add typography CSS custom properties
        ':root, .dark': {
          ...Object.entries(typographyTokens.fontSize).reduce((acc, [key, value]) => {
            acc[`--font-size-${key}`] = value;
            return acc;
          }, {}),
          ...Object.entries(typographyTokens.fontWeight).reduce((acc, [key, value]) => {
            acc[`--font-weight-${key}`] = value;
            return acc;
          }, {}),
          ...Object.entries(typographyTokens.lineHeight).reduce((acc, [key, value]) => {
            acc[`--line-height-${key}`] = value;
            return acc;
          }, {}),
          ...Object.entries(typographyTokens.letterSpacing).reduce((acc, [key, value]) => {
            acc[`--letter-spacing-${key}`] = value;
            return acc;
          }, {}),
        },
      });
    },
  ],
};