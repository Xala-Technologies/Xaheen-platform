/**
 * Typography Design Tokens - Professional Scale System
 * Fluid typography with Norwegian language support
 * WCAG AAA compliant text sizing and contrast
 */

export const typographyTokens = {
  // Font Family Stack (Performance Optimized)
  fontFamily: {
    sans: [
      'Inter',                    // Primary font (modern, readable)
      '-apple-system',           // macOS system font
      'BlinkMacSystemFont',      // Webkit system font
      'Segoe UI',                // Windows system font
      'Roboto',                  // Android system font
      'Helvetica Neue',          // iOS fallback
      'Arial',                   // Universal fallback
      'sans-serif'               // Generic fallback
    ],
    mono: [
      'JetBrains Mono',          // Code font (excellent for programming)
      'SF Mono',                 // macOS monospace
      'Monaco',                  // macOS fallback
      'Consolas',                // Windows monospace
      'Ubuntu Mono',             // Linux monospace
      'Liberation Mono',         // Linux fallback
      'Courier New',             // Universal fallback
      'monospace'                // Generic fallback
    ],
    display: [
      'Inter Display',           // Display variant of Inter
      'Inter',                   // Fallback to regular Inter
      '-apple-system',           // System fallbacks
      'BlinkMacSystemFont',
      'sans-serif'
    ]
  },

  // Fluid Typography Scale (Viewport-based scaling)
  fontSize: {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',     // 12px - 14px
    sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',       // 14px - 16px
    base: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',       // 16px - 18px (body text)
    lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',      // 18px - 20px
    xl: 'clamp(1.25rem, 1.125rem + 0.625vw, 1.5rem)',    // 20px - 24px
    '2xl': 'clamp(1.5rem, 1.3rem + 1vw, 1.875rem)',      // 24px - 30px
    '3xl': 'clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem)', // 30px - 36px
    '4xl': 'clamp(2.25rem, 1.9rem + 1.75vw, 3rem)',      // 36px - 48px
    '5xl': 'clamp(3rem, 2.5rem + 2.5vw, 3.75rem)',       // 48px - 60px
    '6xl': 'clamp(3.75rem, 3rem + 3.75vw, 4.5rem)',      // 60px - 72px
    '7xl': 'clamp(4.5rem, 3.5rem + 5vw, 6rem)',          // 72px - 96px
  },

  // Static Font Sizes (For precise control)
  fontSizeStatic: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
  },

  // Font Weight Scale
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',      // Default body text
    medium: '500',      // Interface elements
    semibold: '600',    // Headings
    bold: '700',        // Emphasis
    extrabold: '800',   // Strong emphasis
    black: '900'        // Display text
  },

  // Line Height Scale (Reading-optimized)
  lineHeight: {
    none: '1',          // Tight spacing (display text)
    tight: '1.25',      // Headlines
    snug: '1.375',      // Sub-headlines
    normal: '1.5',      // Body text (optimal readability)
    relaxed: '1.625',   // Long-form content
    loose: '2'          // Special cases
  },

  // Letter Spacing Scale
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  },

  // Semantic Typography Roles
  semantic: {
    // Display Text (Large headings, hero text)
    display: {
      fontSize: 'var(--font-size-6xl)',
      fontWeight: 'var(--font-weight-bold)',
      lineHeight: 'var(--line-height-none)',
      letterSpacing: 'var(--letter-spacing-tight)',
      fontFamily: 'var(--font-family-display)'
    },

    // Headings
    h1: {
      fontSize: 'var(--font-size-4xl)',        // 36px-48px
      fontWeight: 'var(--font-weight-bold)',    // 700
      lineHeight: 'var(--line-height-tight)',   // 1.25
      letterSpacing: 'var(--letter-spacing-tight)', // -0.025em
      fontFamily: 'var(--font-family-display)'
    },
    h2: {
      fontSize: 'var(--font-size-3xl)',        // 30px-36px
      fontWeight: 'var(--font-weight-semibold)', // 600
      lineHeight: 'var(--line-height-tight)',   // 1.25
      letterSpacing: 'var(--letter-spacing-tight)',
      fontFamily: 'var(--font-family-display)'
    },
    h3: {
      fontSize: 'var(--font-size-2xl)',        // 24px-30px
      fontWeight: 'var(--font-weight-semibold)', // 600
      lineHeight: 'var(--line-height-snug)',    // 1.375
      fontFamily: 'var(--font-family-sans)'
    },
    h4: {
      fontSize: 'var(--font-size-xl)',         // 20px-24px
      fontWeight: 'var(--font-weight-semibold)', // 600
      lineHeight: 'var(--line-height-snug)',    // 1.375
      fontFamily: 'var(--font-family-sans)'
    },
    h5: {
      fontSize: 'var(--font-size-lg)',         // 18px-20px
      fontWeight: 'var(--font-weight-medium)',  // 500
      lineHeight: 'var(--line-height-normal)',  // 1.5
      fontFamily: 'var(--font-family-sans)'
    },
    h6: {
      fontSize: 'var(--font-size-base)',       // 16px-18px
      fontWeight: 'var(--font-weight-medium)',  // 500
      lineHeight: 'var(--line-height-normal)',  // 1.5
      fontFamily: 'var(--font-family-sans)'
    },

    // Body Text
    bodyLarge: {
      fontSize: 'var(--font-size-lg)',         // 18px-20px
      fontWeight: 'var(--font-weight-normal)',  // 400
      lineHeight: 'var(--line-height-relaxed)', // 1.625
      fontFamily: 'var(--font-family-sans)'
    },
    body: {
      fontSize: 'var(--font-size-base)',       // 16px-18px
      fontWeight: 'var(--font-weight-normal)',  // 400
      lineHeight: 'var(--line-height-normal)',  // 1.5
      fontFamily: 'var(--font-family-sans)'
    },
    bodySmall: {
      fontSize: 'var(--font-size-sm)',         // 14px-16px
      fontWeight: 'var(--font-weight-normal)',  // 400
      lineHeight: 'var(--line-height-normal)',  // 1.5
      fontFamily: 'var(--font-family-sans)'
    },

    // Interface Text
    button: {
      fontSize: 'var(--font-size-base)',       // 16px-18px
      fontWeight: 'var(--font-weight-medium)',  // 500
      lineHeight: 'var(--line-height-none)',    // 1
      letterSpacing: 'var(--letter-spacing-wide)', // 0.025em
      fontFamily: 'var(--font-family-sans)'
    },
    label: {
      fontSize: 'var(--font-size-sm)',         // 14px-16px
      fontWeight: 'var(--font-weight-medium)',  // 500
      lineHeight: 'var(--line-height-normal)',  // 1.5
      fontFamily: 'var(--font-family-sans)'
    },
    caption: {
      fontSize: 'var(--font-size-xs)',         // 12px-14px
      fontWeight: 'var(--font-weight-normal)',  // 400
      lineHeight: 'var(--line-height-normal)',  // 1.5
      color: 'var(--color-text-tertiary)',
      fontFamily: 'var(--font-family-sans)'
    },

    // Code Text
    code: {
      fontSize: 'var(--font-size-sm)',         // 14px-16px
      fontWeight: 'var(--font-weight-normal)',  // 400
      lineHeight: 'var(--line-height-relaxed)', // 1.625
      fontFamily: 'var(--font-family-mono)',
      backgroundColor: 'var(--color-background-tertiary)',
      padding: '0.125rem 0.25rem',
      borderRadius: 'var(--border-radius-sm)'
    },
    codeBlock: {
      fontSize: 'var(--font-size-sm)',         // 14px-16px
      fontWeight: 'var(--font-weight-normal)',  // 400
      lineHeight: 'var(--line-height-relaxed)', // 1.625
      fontFamily: 'var(--font-family-mono)'
    }
  },

  // Norwegian Language Optimizations
  norwegian: {
    // Optimized for Norwegian characters (æ, ø, å)
    bodyOptimized: {
      fontSize: 'var(--font-size-base)',
      fontWeight: 'var(--font-weight-normal)',
      lineHeight: '1.6',                        // Slightly more generous for Norwegian
      fontFamily: 'var(--font-family-sans)'
    },
    
    // Government document style (formal Norwegian)
    official: {
      fontSize: 'var(--font-size-base)',
      fontWeight: 'var(--font-weight-normal)',
      lineHeight: '1.7',                        // Generous line height for readability
      letterSpacing: '0.01em',                  // Slight letter spacing
      fontFamily: 'var(--font-family-sans)'
    }
  }
} as const;

// CSS Custom Properties Export
export const cssTypographyTokens = {
  // Font families
  '--font-family-sans': typographyTokens.fontFamily.sans.join(', '),
  '--font-family-mono': typographyTokens.fontFamily.mono.join(', '),
  '--font-family-display': typographyTokens.fontFamily.display.join(', '),

  // Font sizes (fluid)
  '--font-size-xs': typographyTokens.fontSize.xs,
  '--font-size-sm': typographyTokens.fontSize.sm,
  '--font-size-base': typographyTokens.fontSize.base,
  '--font-size-lg': typographyTokens.fontSize.lg,
  '--font-size-xl': typographyTokens.fontSize.xl,
  '--font-size-2xl': typographyTokens.fontSize['2xl'],
  '--font-size-3xl': typographyTokens.fontSize['3xl'],
  '--font-size-4xl': typographyTokens.fontSize['4xl'],
  '--font-size-5xl': typographyTokens.fontSize['5xl'],
  '--font-size-6xl': typographyTokens.fontSize['6xl'],
  '--font-size-7xl': typographyTokens.fontSize['7xl'],

  // Font weights
  '--font-weight-thin': typographyTokens.fontWeight.thin,
  '--font-weight-extralight': typographyTokens.fontWeight.extralight,
  '--font-weight-light': typographyTokens.fontWeight.light,
  '--font-weight-normal': typographyTokens.fontWeight.normal,
  '--font-weight-medium': typographyTokens.fontWeight.medium,
  '--font-weight-semibold': typographyTokens.fontWeight.semibold,
  '--font-weight-bold': typographyTokens.fontWeight.bold,
  '--font-weight-extrabold': typographyTokens.fontWeight.extrabold,
  '--font-weight-black': typographyTokens.fontWeight.black,

  // Line heights
  '--line-height-none': typographyTokens.lineHeight.none,
  '--line-height-tight': typographyTokens.lineHeight.tight,
  '--line-height-snug': typographyTokens.lineHeight.snug,
  '--line-height-normal': typographyTokens.lineHeight.normal,
  '--line-height-relaxed': typographyTokens.lineHeight.relaxed,
  '--line-height-loose': typographyTokens.lineHeight.loose,

  // Letter spacing
  '--letter-spacing-tighter': typographyTokens.letterSpacing.tighter,
  '--letter-spacing-tight': typographyTokens.letterSpacing.tight,
  '--letter-spacing-normal': typographyTokens.letterSpacing.normal,
  '--letter-spacing-wide': typographyTokens.letterSpacing.wide,
  '--letter-spacing-wider': typographyTokens.letterSpacing.wider,
  '--letter-spacing-widest': typographyTokens.letterSpacing.widest,
} as const;

// Utility functions
export const getFontSize = (size: keyof typeof typographyTokens.fontSize) => {
  return typographyTokens.fontSize[size];
};

export const getFontWeight = (weight: keyof typeof typographyTokens.fontWeight) => {
  return typographyTokens.fontWeight[weight];
};

export const getLineHeight = (height: keyof typeof typographyTokens.lineHeight) => {
  return typographyTokens.lineHeight[height];
};

// Type definitions
export type FontSize = keyof typeof typographyTokens.fontSize;
export type FontWeight = keyof typeof typographyTokens.fontWeight;
export type LineHeight = keyof typeof typographyTokens.lineHeight;
export type LetterSpacing = keyof typeof typographyTokens.letterSpacing;
export type SemanticTypography = keyof typeof typographyTokens.semantic;