/**
 * Design Tokens - Complete Token System Export
 * Professional design tokens for the Xaheen Design System
 * Industry-specific themes with WCAG AAA compliance
 */

// Color tokens
export * from './colors';

// Typography tokens
export * from './typography';

// Spacing tokens
export * from './spacing';

// Shadow and elevation tokens
export * from './shadows';

// Theme system (industry-specific themes)
export * from './themes';

// Re-export commonly used types for convenience
export type {
  ShadowSize,
  ElevationLevel,
  IndustryTheme,
  ShadowIntensity,
} from './shadows';

export type {
  ThemeName,
  ThemeColors,
  ThemeConfig,
  ThemeMode,
} from './themes';

// Norwegian-specific token utilities
export const norwegianTokens = {
  // Norwegian typography preferences
  typography: {
    primaryFont: 'Inter, "Segoe UI", system-ui, sans-serif',
    headingFont: 'Inter Display, "Segoe UI", system-ui, sans-serif',
    monoFont: 'JetBrains Mono, "SF Mono", Monaco, monospace',
  },
  
  // Norwegian accessibility standards
  accessibility: {
    minimumContrastRatio: 7, // WCAG AAA
    largeTextSize: '18px',
    touchTargetSize: '44px',
    focusRingWidth: '2px',
  },
  
  // Norwegian design preferences (inspired by Nordic design)
  nordic: {
    borderRadius: '8px',
    shadowIntensity: 'subtle' as const,
    animationDuration: '250ms',
    spacingScale: 'comfortable' as const,
  },
} as const;