/**
 * Universal Design Tokens
 * Platform-agnostic design tokens that can be transformed for any framework
 */

// =============================================================================
// COLOR SYSTEM - UNIVERSAL
// =============================================================================

export const ColorTokens = {
  // Base palette - semantic colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },

  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b', // Main secondary
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },

  // Semantic color mapping
  success: {
    light: '#10b981',
    main: '#059669',
    dark: '#047857'
  },

  warning: {
    light: '#f59e0b',
    main: '#d97706',
    dark: '#b45309'
  },

  error: {
    light: '#ef4444',
    main: '#dc2626',
    dark: '#b91c1c'
  },

  // NSM Classification Colors (Norwegian Security Model)
  nsm: {
    open: '#10b981',      // Green - Public information
    restricted: '#f59e0b', // Yellow - Limited access
    confidential: '#ef4444', // Red - Sensitive information  
    secret: '#374151'     // Dark gray - Highest classification
  }
} as const;

// =============================================================================
// SPACING SYSTEM - UNIVERSAL
// =============================================================================

export const SpacingTokens = {
  // Base spacing scale (rem values for web, dp for mobile)
  0: '0',
  1: '0.25rem',    // 4px / 4dp
  2: '0.5rem',     // 8px / 8dp
  3: '0.75rem',    // 12px / 12dp
  4: '1rem',       // 16px / 16dp
  5: '1.25rem',    // 20px / 20dp
  6: '1.5rem',     // 24px / 24dp
  7: '1.75rem',    // 28px / 28dp
  8: '2rem',       // 32px / 32dp
  9: '2.25rem',    // 36px / 36dp
  10: '2.5rem',    // 40px / 40dp
  11: '2.75rem',   // 44px / 44dp
  12: '3rem',      // 48px / 48dp
  14: '3.5rem',    // 56px / 56dp
  16: '4rem',      // 64px / 64dp
  20: '5rem',      // 80px / 80dp
  24: '6rem',      // 96px / 96dp
  28: '7rem',      // 112px / 112dp
  32: '8rem',      // 128px / 128dp

  // Professional sizing standards
  button: {
    xs: '2rem',      // 32px minimum
    sm: '2.5rem',    // 40px
    md: '3rem',      // 48px (CLAUDE.md compliant)
    lg: '3.5rem',    // 56px
    xl: '4rem'       // 64px
  },

  input: {
    sm: '2.5rem',    // 40px
    md: '3.5rem',    // 56px (CLAUDE.md compliant)
    lg: '4rem'       // 64px
  },

  touch: {
    minimum: '2.75rem', // 44px - Minimum touch target
    comfortable: '3rem', // 48px - Comfortable touch target
    accessible: '3.5rem' // 56px - Highly accessible
  }
} as const;

// =============================================================================
// TYPOGRAPHY SYSTEM - UNIVERSAL
// =============================================================================

export const TypographyTokens = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
    display: ['Inter', 'system-ui', 'sans-serif']
  },

  // Font sizes (fluid scale)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
    '8xl': '6rem',    // 96px
    '9xl': '8rem'     // 128px
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
} as const;

// =============================================================================
// SHADOW SYSTEM - UNIVERSAL
// =============================================================================

export const ShadowTokens = {
  // Elevation shadows (Material Design inspired)
  elevation: {
    0: 'none',
    1: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    2: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    3: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    4: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    5: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    6: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
  },

  // Semantic shadows
  focus: '0 0 0 2px rgb(59 130 246 / 0.5)',
  error: '0 0 0 2px rgb(239 68 68 / 0.5)',
  success: '0 0 0 2px rgb(16 185 129 / 0.5)',

  // Component-specific shadows
  button: {
    idle: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    hover: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    active: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
  },

  card: {
    default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    hover: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
  },

  dialog: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
} as const;

// =============================================================================
// ANIMATION SYSTEM - UNIVERSAL
// =============================================================================

export const AnimationTokens = {
  // Duration (in milliseconds for easy platform conversion)
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500
  },

  // Easing functions (cubic-bezier values)
  easing: {
    linear: 'cubic-bezier(0, 0, 1, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },

  // Predefined animations
  keyframes: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 }
    },
    slideUp: {
      from: { transform: 'translateY(100%)' },
      to: { transform: 'translateY(0)' }
    },
    scale: {
      from: { transform: 'scale(0.95)' },
      to: { transform: 'scale(1)' }
    },
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' }
    }
  }
} as const;

// =============================================================================
// BREAKPOINTS - UNIVERSAL
// =============================================================================

export const BreakpointTokens = {
  // Web breakpoints (px)
  web: {
    xs: '0px',
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Mobile breakpoints (dp)
  mobile: {
    xs: '0dp',
    sm: '360dp',
    md: '768dp',
    lg: '1024dp',
    xl: '1280dp'
  },

  // Desktop breakpoints (for Electron)
  desktop: {
    compact: '1024px',
    comfortable: '1280px',
    spacious: '1536px'
  }
} as const;

// =============================================================================
// BORDER SYSTEM - UNIVERSAL
// =============================================================================

export const BorderTokens = {
  // Border widths
  width: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px'
  },

  // Border radius
  radius: {
    none: '0px',
    sm: '0.125rem',   // 2px
    default: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // Border styles
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
    none: 'none'
  }
} as const;

// =============================================================================
// PLATFORM CONVERSION UTILITIES
// =============================================================================

/**
 * Convert tokens for specific platforms
 */
export const TokenConverters = {
  /**
   * Convert web tokens to React Native StyleSheet values
   */
  toReactNative: (tokens: typeof SpacingTokens) => {
    const converted: Record<string, number> = {};
    
    Object.entries(tokens).forEach(([key, value]) => {
      if (typeof value === 'string' && value.includes('rem')) {
        // Convert rem to dp (assuming 1rem = 16dp)
        converted[key] = parseFloat(value) * 16;
      } else if (typeof value === 'object') {
        converted[key] = TokenConverters.toReactNative(value as any);
      }
    });
    
    return converted;
  },

  /**
   * Convert tokens to CSS custom properties
   */
  toCSSVariables: (tokens: Record<string, any>, prefix = '--') => {
    const flatten = (obj: Record<string, any>, parentKey = ''): Record<string, string> => {
      let result: Record<string, string> = {};
      
      for (const [key, value] of Object.entries(obj)) {
        const newKey = parentKey ? `${parentKey}-${key}` : key;
        
        if (typeof value === 'object' && value !== null) {
          result = { ...result, ...flatten(value, newKey) };
        } else {
          result[`${prefix}${newKey}`] = String(value);
        }
      }
      
      return result;
    };

    return flatten(tokens);
  },

  /**
   * Convert tokens to JavaScript theme object
   */
  toJSTheme: (tokens: Record<string, any>) => {
    return JSON.parse(JSON.stringify(tokens));
  }
};

// =============================================================================
// UNIVERSAL TOKEN REGISTRY
// =============================================================================

export const UniversalTokens = {
  colors: ColorTokens,
  spacing: SpacingTokens,
  typography: TypographyTokens,
  shadows: ShadowTokens,
  animations: AnimationTokens,
  breakpoints: BreakpointTokens,
  borders: BorderTokens,
  converters: TokenConverters
} as const;

export type UniversalTokensType = typeof UniversalTokens;