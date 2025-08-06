/**
 * Design Tokens for Tailwind Config (CommonJS)
 * Simplified tokens that work with Tailwind CSS
 */

const colorTokens = {
  // Primary Brand Colors
  primary: {
    50: '#f0f4ff',
    100: '#e0eaff',
    200: '#c1d4ff',
    300: '#94b8ff',
    400: '#5c8fff',
    500: '#2563eb',
    600: '#1d4ed8',
    700: '#1e40af',
    800: '#1e3a8a',
    900: '#172554',
    950: '#0f172a',
  },

  // Secondary Brand Colors
  secondary: {
    50: '#f9f7ff',
    100: '#f3efff',
    200: '#e7dfff',
    300: '#d1c0ff',
    400: '#b093ff',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#3c1361',
  },

  // Accent Colors
  accent: {
    coral: '#f97316',
    teal: '#14b8a6',
    indigo: '#6366f1',
    amber: '#f59e0b',
  },

  // Semantic Colors
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // NSM Security Classifications
  nsm: {
    open: {
      background: '#f0fdf4',
      border: '#bbf7d0',
      text: '#065f46',
    },
    restricted: {
      background: '#fffbeb',
      border: '#fde68a',
      text: '#92400e',
    },
    confidential: {
      background: '#fef2f2',
      border: '#fecaca',
      text: '#991b1b',
    },
    secret: {
      background: '#f8fafc',
      border: '#cbd5e1',
      text: '#334155',
    },
  },

  gradient: {}
};

const cssColorTokens = {
  light: {
    '--color-background': 'hsl(0, 0%, 100%)',
    '--color-foreground': 'hsl(222, 84%, 5%)',
    '--color-surface': 'hsl(0, 0%, 100%)',
    '--color-background-secondary': 'hsl(210, 40%, 98%)',
    '--color-foreground-secondary': 'hsl(215, 16%, 47%)',
    '--color-border': 'hsl(214, 32%, 91%)',
    '--color-input-border': 'hsl(214, 32%, 91%)',
    '--color-ring': 'hsl(217, 91%, 43%)',
  },
  dark: {
    '--color-background': 'hsl(222, 47%, 7%)',
    '--color-foreground': 'hsl(210, 40%, 98%)',
    '--color-surface': 'hsl(222, 47%, 10%)',
    '--color-background-secondary': 'hsl(217, 33%, 17%)',
    '--color-foreground-secondary': 'hsl(215, 16%, 65%)',
    '--color-border': 'hsl(217, 33%, 17%)',
    '--color-input-border': 'hsl(217, 33%, 17%)',
    '--color-ring': 'hsl(217, 91%, 43%)',
  }
};

const typographyTokens = {
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    mono: ['Monaco', 'Menlo', 'ui-monospace', 'monospace'],
    display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

const spacingTokens = {
  scale: {
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  }
};

module.exports = {
  colorTokens,
  cssColorTokens,
  typographyTokens,
  spacingTokens,
};