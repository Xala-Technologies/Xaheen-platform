/**
 * Shadow and Elevation Token System
 * Professional shadow system with industry-specific variations
 * WCAG compliant and responsive shadow tokens
 */

// Base shadow configuration
export const shadowConfig = {
  // Color tokens for shadows (can be themed)
  colors: {
    light: {
      primary: 'rgba(0, 0, 0, 0.1)',
      secondary: 'rgba(0, 0, 0, 0.05)',
      accent: 'rgba(0, 0, 0, 0.15)',
      colored: 'rgba(59, 130, 246, 0.1)', // Primary color shadow
    },
    dark: {
      primary: 'rgba(0, 0, 0, 0.3)',
      secondary: 'rgba(0, 0, 0, 0.2)',
      accent: 'rgba(0, 0, 0, 0.4)',
      colored: 'rgba(59, 130, 246, 0.2)',
    },
  },
  
  // Shadow sizes and blur values
  sizes: {
    xs: { blur: 2, spread: 0, offset: { x: 0, y: 1 } },
    sm: { blur: 4, spread: 0, offset: { x: 0, y: 1 } },
    md: { blur: 8, spread: 0, offset: { x: 0, y: 2 } },
    lg: { blur: 16, spread: 0, offset: { x: 0, y: 4 } },
    xl: { blur: 24, spread: 0, offset: { x: 0, y: 8 } },
    '2xl': { blur: 32, spread: 0, offset: { x: 0, y: 12 } },
    '3xl': { blur: 48, spread: 0, offset: { x: 0, y: 20 } },
  },
} as const;

// Elevation levels (Material Design inspired but more professional)
export const elevationLevels = {
  0: 'none', // Ground level
  1: 'xs',   // Slightly raised (cards, inputs)
  2: 'sm',   // Raised (buttons, chips)
  3: 'md',   // Elevated (dropdowns, tooltips)
  4: 'lg',   // High elevation (modals, drawers)
  5: 'xl',   // Very high (overlays)
  6: '2xl',  // Maximum elevation (notifications)
  7: '3xl',  // Special effects
} as const;

// Generate shadow CSS values
const createShadow = (
  size: keyof typeof shadowConfig.sizes,
  color: string,
  intensity: 'subtle' | 'default' | 'strong' = 'default'
): string => {
  const config = shadowConfig.sizes[size];
  const intensityMultiplier = intensity === 'subtle' ? 0.6 : intensity === 'strong' ? 1.4 : 1;
  
  const adjustedBlur = Math.round(config.blur * intensityMultiplier);
  const adjustedOffset = {
    x: Math.round(config.offset.x * intensityMultiplier),
    y: Math.round(config.offset.y * intensityMultiplier),
  };
  
  return `${adjustedOffset.x}px ${adjustedOffset.y}px ${adjustedBlur}px ${config.spread}px ${color}`;
};

// Core shadow tokens
export const shadowTokens = {
  // Basic shadows (light mode)
  light: {
    none: 'none',
    xs: createShadow('xs', shadowConfig.colors.light.primary),
    sm: createShadow('sm', shadowConfig.colors.light.primary),
    md: createShadow('md', shadowConfig.colors.light.primary),
    lg: createShadow('lg', shadowConfig.colors.light.primary),
    xl: createShadow('xl', shadowConfig.colors.light.primary),
    '2xl': createShadow('2xl', shadowConfig.colors.light.primary),
    '3xl': createShadow('3xl', shadowConfig.colors.light.primary),
    
    // Layered shadows for more depth
    layered: {
      sm: [
        createShadow('xs', shadowConfig.colors.light.secondary),
        createShadow('sm', shadowConfig.colors.light.primary),
      ].join(', '),
      md: [
        createShadow('xs', shadowConfig.colors.light.secondary),
        createShadow('md', shadowConfig.colors.light.primary),
      ].join(', '),
      lg: [
        createShadow('sm', shadowConfig.colors.light.secondary),
        createShadow('lg', shadowConfig.colors.light.primary),
      ].join(', '),
      xl: [
        createShadow('md', shadowConfig.colors.light.secondary),
        createShadow('xl', shadowConfig.colors.light.primary),
      ].join(', '),
    },
    
    // Colored shadows for branded elements
    colored: {
      xs: createShadow('xs', shadowConfig.colors.light.colored),
      sm: createShadow('sm', shadowConfig.colors.light.colored),
      md: createShadow('md', shadowConfig.colors.light.colored),
      lg: createShadow('lg', shadowConfig.colors.light.colored),
    },
    
    // Inner shadows for pressed states
    inner: {
      xs: `inset ${createShadow('xs', shadowConfig.colors.light.primary)}`,
      sm: `inset ${createShadow('sm', shadowConfig.colors.light.primary)}`,
      md: `inset ${createShadow('md', shadowConfig.colors.light.primary)}`,
    },
  },
  
  // Dark mode shadows
  dark: {
    none: 'none',
    xs: createShadow('xs', shadowConfig.colors.dark.primary),
    sm: createShadow('sm', shadowConfig.colors.dark.primary),
    md: createShadow('md', shadowConfig.colors.dark.primary),
    lg: createShadow('lg', shadowConfig.colors.dark.primary),
    xl: createShadow('xl', shadowConfig.colors.dark.primary),
    '2xl': createShadow('2xl', shadowConfig.colors.dark.primary),
    '3xl': createShadow('3xl', shadowConfig.colors.dark.primary),
    
    layered: {
      sm: [
        createShadow('xs', shadowConfig.colors.dark.secondary),
        createShadow('sm', shadowConfig.colors.dark.primary),
      ].join(', '),
      md: [
        createShadow('xs', shadowConfig.colors.dark.secondary),
        createShadow('md', shadowConfig.colors.dark.primary),
      ].join(', '),
      lg: [
        createShadow('sm', shadowConfig.colors.dark.secondary),
        createShadow('lg', shadowConfig.colors.dark.primary),
      ].join(', '),
      xl: [
        createShadow('md', shadowConfig.colors.dark.secondary),
        createShadow('xl', shadowConfig.colors.dark.primary),
      ].join(', '),
    },
    
    colored: {
      xs: createShadow('xs', shadowConfig.colors.dark.colored),
      sm: createShadow('sm', shadowConfig.colors.dark.colored),
      md: createShadow('md', shadowConfig.colors.dark.colored),
      lg: createShadow('lg', shadowConfig.colors.dark.colored),
    },
    
    inner: {
      xs: `inset ${createShadow('xs', shadowConfig.colors.dark.primary)}`,
      sm: `inset ${createShadow('sm', shadowConfig.colors.dark.primary)}`,
      md: `inset ${createShadow('md', shadowConfig.colors.dark.primary)}`,
    },
  },
} as const;

// Industry-specific shadow variations
export const industryShallows = {
  education: {
    // Softer, friendlier shadows
    light: {
      ...shadowTokens.light,
      xs: createShadow('xs', shadowConfig.colors.light.primary, 'subtle'),
      sm: createShadow('sm', shadowConfig.colors.light.primary, 'subtle'),
      md: createShadow('md', shadowConfig.colors.light.primary, 'subtle'),
    },
    dark: {
      ...shadowTokens.dark,
      xs: createShadow('xs', shadowConfig.colors.dark.primary, 'subtle'),
      sm: createShadow('sm', shadowConfig.colors.dark.primary, 'subtle'),
      md: createShadow('md', shadowConfig.colors.dark.primary, 'subtle'),
    },
  },
  
  healthcare: {
    // Clean, minimal shadows
    light: {
      ...shadowTokens.light,
      xs: createShadow('xs', 'rgba(0, 150, 136, 0.08)', 'subtle'), // Teal tint
      sm: createShadow('sm', 'rgba(0, 150, 136, 0.08)', 'subtle'),
      md: createShadow('md', 'rgba(0, 150, 136, 0.08)', 'subtle'),
    },
    dark: {
      ...shadowTokens.dark,
      xs: createShadow('xs', 'rgba(0, 150, 136, 0.15)', 'subtle'),
      sm: createShadow('sm', 'rgba(0, 150, 136, 0.15)', 'subtle'),
      md: createShadow('md', 'rgba(0, 150, 136, 0.15)', 'subtle'),
    },
  },
  
  government: {
    // Sharp, authoritative shadows
    light: {
      ...shadowTokens.light,
      xs: createShadow('xs', 'rgba(30, 58, 138, 0.12)'), // Navy tint
      sm: createShadow('sm', 'rgba(30, 58, 138, 0.12)'),
      md: createShadow('md', 'rgba(30, 58, 138, 0.12)'),
    },
    dark: {
      ...shadowTokens.dark,
      xs: createShadow('xs', 'rgba(30, 58, 138, 0.25)'),
      sm: createShadow('sm', 'rgba(30, 58, 138, 0.25)'),
      md: createShadow('md', 'rgba(30, 58, 138, 0.25)'),
    },
  },
  
  enterprise: {
    // Strong, professional shadows
    light: {
      ...shadowTokens.light,
      xs: createShadow('xs', shadowConfig.colors.light.primary, 'strong'),
      sm: createShadow('sm', shadowConfig.colors.light.primary, 'strong'),
      md: createShadow('md', shadowConfig.colors.light.primary, 'strong'),
      lg: createShadow('lg', shadowConfig.colors.light.primary, 'strong'),
    },
    dark: {
      ...shadowTokens.dark,
      xs: createShadow('xs', shadowConfig.colors.dark.primary, 'strong'),
      sm: createShadow('sm', shadowConfig.colors.dark.primary, 'strong'),
      md: createShadow('md', shadowConfig.colors.dark.primary, 'strong'),
      lg: createShadow('lg', shadowConfig.colors.dark.primary, 'strong'),
    },
  },
  
  ai: {
    // Glowing, futuristic shadows with color
    light: {
      ...shadowTokens.light,
      xs: createShadow('xs', 'rgba(139, 92, 246, 0.15)'), // Purple glow
      sm: createShadow('sm', 'rgba(139, 92, 246, 0.15)'),
      md: createShadow('md', 'rgba(139, 92, 246, 0.15)'),
      glow: [
        createShadow('sm', 'rgba(139, 92, 246, 0.3)'),
        createShadow('lg', 'rgba(139, 92, 246, 0.1)'),
      ].join(', '),
    },
    dark: {
      ...shadowTokens.dark,
      xs: createShadow('xs', 'rgba(139, 92, 246, 0.3)'),
      sm: createShadow('sm', 'rgba(139, 92, 246, 0.3)'),
      md: createShadow('md', 'rgba(139, 92, 246, 0.3)'),
      glow: [
        createShadow('sm', 'rgba(139, 92, 246, 0.5)'),
        createShadow('lg', 'rgba(139, 92, 246, 0.2)'),
      ].join(', '),
    },
  },
  
  private: {
    // Luxurious, sophisticated shadows
    light: {
      ...shadowTokens.light,
      xs: createShadow('xs', 'rgba(180, 83, 9, 0.1)'), // Gold tint
      sm: createShadow('sm', 'rgba(180, 83, 9, 0.1)'),
      md: createShadow('md', 'rgba(180, 83, 9, 0.1)'),
      luxury: [
        createShadow('xs', 'rgba(180, 83, 9, 0.05)'),
        createShadow('md', 'rgba(0, 0, 0, 0.08)'),
        createShadow('lg', 'rgba(180, 83, 9, 0.03)'),
      ].join(', '),
    },
    dark: {
      ...shadowTokens.dark,
      xs: createShadow('xs', 'rgba(180, 83, 9, 0.2)'),
      sm: createShadow('sm', 'rgba(180, 83, 9, 0.2)'),
      md: createShadow('md', 'rgba(180, 83, 9, 0.2)'),
      luxury: [
        createShadow('xs', 'rgba(180, 83, 9, 0.1)'),
        createShadow('md', 'rgba(0, 0, 0, 0.2)'),
        createShadow('lg', 'rgba(180, 83, 9, 0.05)'),
      ].join(', '),
    },
  },
} as const;

// Semantic shadows for different component states
export const semanticShadows = {
  // Interactive elements
  button: {
    rest: shadowTokens.light.sm,
    hover: shadowTokens.light.md,
    active: shadowTokens.light.inner.xs,
    focus: `${shadowTokens.light.sm}, 0 0 0 3px rgba(59, 130, 246, 0.1)`,
  },
  
  // Surface elements
  card: {
    flat: shadowTokens.light.xs,
    raised: shadowTokens.light.sm,
    elevated: shadowTokens.light.md,
    floating: shadowTokens.light.lg,
  },
  
  // Overlay elements
  overlay: {
    dropdown: shadowTokens.light.layered.md,
    modal: shadowTokens.light.layered.xl,
    tooltip: shadowTokens.light.md,
    popover: shadowTokens.light.layered.lg,
  },
  
  // Status shadows
  status: {
    success: createShadow('sm', 'rgba(34, 197, 94, 0.2)'),
    warning: createShadow('sm', 'rgba(245, 158, 11, 0.2)'),
    error: createShadow('sm', 'rgba(239, 68, 68, 0.2)'),
    info: createShadow('sm', 'rgba(59, 130, 246, 0.2)'),
  },
} as const;

// Utility functions for shadow management
export const shadowUtils = {
  // Get appropriate shadow for elevation level
  getElevationShadow: (
    level: keyof typeof elevationLevels,
    theme: 'light' | 'dark' = 'light',
    intensity: 'subtle' | 'default' | 'strong' = 'default'
  ): string => {
    const shadowSize = elevationLevels[level];
    if (shadowSize === 'none') return 'none';
    
    const baseColor = theme === 'light' 
      ? shadowConfig.colors.light.primary 
      : shadowConfig.colors.dark.primary;
    
    return createShadow(shadowSize as keyof typeof shadowConfig.sizes, baseColor, intensity);
  },
  
  // Create custom shadow with theme colors
  createThemedShadow: (
    size: keyof typeof shadowConfig.sizes,
    color: string,
    _theme: 'light' | 'dark' = 'light',
    intensity: 'subtle' | 'default' | 'strong' = 'default'
  ): string => {
    return createShadow(size, color, intensity);
  },
  
  // Combine multiple shadows
  combineShadows: (...shadows: string[]): string => {
    return shadows.filter(shadow => shadow !== 'none').join(', ');
  },
  
  // Motion-safe shadow (reduced for users with motion preferences)
  motionSafeShadow: (
    normalShadow: string,
    reducedShadow: string = shadowTokens.light.xs
  ): string => {
    return `@media (prefers-reduced-motion: reduce) { box-shadow: ${reducedShadow}; } 
            @media (prefers-reduced-motion: no-preference) { box-shadow: ${normalShadow}; }`;
  },
} as const;

// CSS custom properties mapping
export const shadowCSSVariables = {
  // Basic shadows
  '--shadow-xs': shadowTokens.light.xs,
  '--shadow-sm': shadowTokens.light.sm,
  '--shadow-md': shadowTokens.light.md,
  '--shadow-lg': shadowTokens.light.lg,
  '--shadow-xl': shadowTokens.light.xl,
  '--shadow-2xl': shadowTokens.light['2xl'],
  '--shadow-3xl': shadowTokens.light['3xl'],
  
  // Layered shadows
  '--shadow-layered-sm': shadowTokens.light.layered.sm,
  '--shadow-layered-md': shadowTokens.light.layered.md,
  '--shadow-layered-lg': shadowTokens.light.layered.lg,
  '--shadow-layered-xl': shadowTokens.light.layered.xl,
  
  // Semantic shadows
  '--shadow-button-rest': semanticShadows.button.rest,
  '--shadow-button-hover': semanticShadows.button.hover,
  '--shadow-button-active': semanticShadows.button.active,
  '--shadow-button-focus': semanticShadows.button.focus,
  
  '--shadow-card-flat': semanticShadows.card.flat,
  '--shadow-card-raised': semanticShadows.card.raised,
  '--shadow-card-elevated': semanticShadows.card.elevated,
  '--shadow-card-floating': semanticShadows.card.floating,
  
  '--shadow-overlay-dropdown': semanticShadows.overlay.dropdown,
  '--shadow-overlay-modal': semanticShadows.overlay.modal,
  '--shadow-overlay-tooltip': semanticShadows.overlay.tooltip,
  '--shadow-overlay-popover': semanticShadows.overlay.popover,
} as const;

// Export types
export type ShadowSize = keyof typeof shadowConfig.sizes;
export type ElevationLevel = keyof typeof elevationLevels;
export type IndustryTheme = keyof typeof industryShallows;
export type ShadowIntensity = 'subtle' | 'default' | 'strong';

// All exports are already declared above with their definitions