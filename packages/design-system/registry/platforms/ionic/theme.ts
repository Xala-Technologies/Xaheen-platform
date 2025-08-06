/**
 * Ionic Theme Utilities
 * Maps universal design tokens to Ionic CSS variables
 */

// =============================================================================
// COLOR MAPPINGS
// =============================================================================

export const ionicColorMap = {
  // Primary colors
  primary: {
    DEFAULT: 'var(--ion-color-primary)',
    shade: 'var(--ion-color-primary-shade)',
    tint: 'var(--ion-color-primary-tint)',
    contrast: 'var(--ion-color-primary-contrast)',
    rgb: 'var(--ion-color-primary-rgb)'
  },
  
  // Secondary colors
  secondary: {
    DEFAULT: 'var(--ion-color-secondary)',
    shade: 'var(--ion-color-secondary-shade)',
    tint: 'var(--ion-color-secondary-tint)',
    contrast: 'var(--ion-color-secondary-contrast)',
    rgb: 'var(--ion-color-secondary-rgb)'
  },
  
  // Status colors
  success: {
    DEFAULT: 'var(--ion-color-success)',
    shade: 'var(--ion-color-success-shade)',
    tint: 'var(--ion-color-success-tint)',
    contrast: 'var(--ion-color-success-contrast)',
    rgb: 'var(--ion-color-success-rgb)'
  },
  
  warning: {
    DEFAULT: 'var(--ion-color-warning)',
    shade: 'var(--ion-color-warning-shade)',
    tint: 'var(--ion-color-warning-tint)',
    contrast: 'var(--ion-color-warning-contrast)',
    rgb: 'var(--ion-color-warning-rgb)'
  },
  
  danger: {
    DEFAULT: 'var(--ion-color-danger)',
    shade: 'var(--ion-color-danger-shade)',
    tint: 'var(--ion-color-danger-tint)',
    contrast: 'var(--ion-color-danger-contrast)',
    rgb: 'var(--ion-color-danger-rgb)'
  },
  
  // Neutral colors
  dark: {
    DEFAULT: 'var(--ion-color-dark)',
    shade: 'var(--ion-color-dark-shade)',
    tint: 'var(--ion-color-dark-tint)',
    contrast: 'var(--ion-color-dark-contrast)',
    rgb: 'var(--ion-color-dark-rgb)'
  },
  
  medium: {
    DEFAULT: 'var(--ion-color-medium)',
    shade: 'var(--ion-color-medium-shade)',
    tint: 'var(--ion-color-medium-tint)',
    contrast: 'var(--ion-color-medium-contrast)',
    rgb: 'var(--ion-color-medium-rgb)'
  },
  
  light: {
    DEFAULT: 'var(--ion-color-light)',
    shade: 'var(--ion-color-light-shade)',
    tint: 'var(--ion-color-light-tint)',
    contrast: 'var(--ion-color-light-contrast)',
    rgb: 'var(--ion-color-light-rgb)'
  }
} as const;

// =============================================================================
// SPACING MAPPINGS
// =============================================================================

export const ionicSpacingMap = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px'
} as const;

// =============================================================================
// TYPOGRAPHY MAPPINGS
// =============================================================================

export const ionicTypographyMap = {
  fontSize: {
    xs: '10px',
    sm: '12px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '28px',
    '5xl': '32px',
    '6xl': '36px'
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2'
  }
} as const;

// =============================================================================
// SHADOW MAPPINGS
// =============================================================================

export const ionicShadowMap = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  none: 'none'
} as const;

// =============================================================================
// BORDER RADIUS MAPPINGS
// =============================================================================

export const ionicRadiusMap = {
  none: '0',
  sm: '2px',
  DEFAULT: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px'
} as const;

// =============================================================================
// BREAKPOINT MAPPINGS
// =============================================================================

export const ionicBreakpointMap = {
  xs: '0px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px'
} as const;

// =============================================================================
// THEME GENERATOR
// =============================================================================

interface IonicThemeConfig {
  colors?: Record<string, string>;
  spacing?: Record<string, string>;
  typography?: {
    fontFamily?: string;
    fontSize?: Record<string, string>;
  };
  darkMode?: boolean;
}

/**
 * Generate Ionic theme CSS variables
 */
export function generateIonicTheme(config: IonicThemeConfig = {}): string {
  const cssVariables: string[] = [];
  
  // Generate color variables
  if (config.colors) {
    Object.entries(config.colors).forEach(([key, value]) => {
      // Convert hex to RGB for Ionic
      const rgb = hexToRgb(value);
      if (rgb) {
        cssVariables.push(`--ion-color-${key}: ${value};`);
        cssVariables.push(`--ion-color-${key}-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};`);
        cssVariables.push(`--ion-color-${key}-shade: ${darken(value, 0.12)};`);
        cssVariables.push(`--ion-color-${key}-tint: ${lighten(value, 0.11)};`);
      }
    });
  }
  
  // Generate spacing variables
  if (config.spacing) {
    Object.entries(config.spacing).forEach(([key, value]) => {
      cssVariables.push(`--ion-spacing-${key}: ${value};`);
    });
  }
  
  // Generate typography variables
  if (config.typography) {
    if (config.typography.fontFamily) {
      cssVariables.push(`--ion-font-family: ${config.typography.fontFamily};`);
    }
    
    if (config.typography.fontSize) {
      Object.entries(config.typography.fontSize).forEach(([key, value]) => {
        cssVariables.push(`--ion-font-size-${key}: ${value};`);
      });
    }
  }
  
  return `:root {\n  ${cssVariables.join('\n  ')}\n}`;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Darken a hex color
 */
function darken(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const r = Math.max(0, Math.floor(rgb.r * (1 - amount)));
  const g = Math.max(0, Math.floor(rgb.g * (1 - amount)));
  const b = Math.max(0, Math.floor(rgb.b * (1 - amount)));
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Lighten a hex color
 */
function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * amount));
  const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * amount));
  const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * amount));
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// =============================================================================
// THEME OBJECT
// =============================================================================

export const ionicTheme = {
  colors: ionicColorMap,
  spacing: ionicSpacingMap,
  typography: ionicTypographyMap,
  shadows: ionicShadowMap,
  radius: ionicRadiusMap,
  breakpoints: ionicBreakpointMap,
  generate: generateIonicTheme
} as const;

export default ionicTheme;