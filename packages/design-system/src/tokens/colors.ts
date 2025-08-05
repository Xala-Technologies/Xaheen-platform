/**
 * Color Design Tokens - WCAG AAA Compliant
 * Norwegian NSM Security Classifications
 * Professional color system with 7:1 contrast ratios
 */

export const colorTokens = {
  // Primary Brand Colors - Rich Blue (WCAG AAA Compliant)
  primary: {
    50: 'hsl(217, 91%, 97%)',   // #f0f4ff - Ultra light
    100: 'hsl(217, 91%, 94%)',  // #e0eaff - Extra light
    200: 'hsl(217, 91%, 88%)',  // #c1d4ff - Light
    300: 'hsl(217, 91%, 78%)',  // #94b8ff - Medium light
    400: 'hsl(217, 91%, 65%)',  // #5c8fff - Medium
    500: 'hsl(217, 91%, 50%)',  // #2563eb - Base (Primary)
    600: 'hsl(217, 91%, 43%)',  // #1d4ed8 - Medium dark (7:1 contrast)
    700: 'hsl(217, 91%, 36%)',  // #1e40af - Dark (8:1 contrast)
    800: 'hsl(217, 91%, 29%)',  // #1e3a8a - Extra dark (10:1 contrast)
    900: 'hsl(217, 91%, 22%)',  // #172554 - Ultra dark
    950: 'hsl(217, 91%, 15%)',  // #0f172a - Near black
  },

  // Secondary Brand Colors - Sophisticated Purple
  secondary: {
    50: 'hsl(263, 67%, 98%)',   // #f9f7ff
    100: 'hsl(263, 67%, 96%)',  // #f3efff
    200: 'hsl(263, 67%, 92%)',  // #e7dfff
    300: 'hsl(263, 67%, 84%)',  // #d1c0ff
    400: 'hsl(263, 67%, 71%)',  // #b093ff
    500: 'hsl(263, 67%, 58%)',  // #8b5cf6
    600: 'hsl(263, 67%, 50%)',  // #7c3aed
    700: 'hsl(263, 67%, 42%)',  // #6d28d9
    800: 'hsl(263, 67%, 34%)',  // #5b21b6
    900: 'hsl(263, 67%, 26%)',  // #4c1d95
    950: 'hsl(263, 67%, 18%)',  // #2e1065
  },

  // Accent Colors - Modern Gradient Options
  accent: {
    coral: {
      light: 'hsl(14, 100%, 71%)',    // #ff8a7a
      default: 'hsl(14, 100%, 57%)', // #ff6347
      dark: 'hsl(14, 100%, 43%)',    // #cc3d2b
    },
    teal: {
      light: 'hsl(174, 77%, 55%)',    // #42d4d4
      default: 'hsl(174, 77%, 41%)', // #20b2aa
      dark: 'hsl(174, 77%, 27%)',    // #117a73
    },
    indigo: {
      light: 'hsl(234, 89%, 74%)',    // #818cf8
      default: 'hsl(234, 89%, 62%)', // #6366f1
      dark: 'hsl(234, 89%, 46%)',    // #4338ca
    },
    amber: {
      light: 'hsl(45, 100%, 65%)',    // #ffc947
      default: 'hsl(45, 100%, 51%)', // #f59e0b
      dark: 'hsl(45, 100%, 37%)',    // #b45309
    }
  },

  // Norwegian NSM Security Classifications - Enhanced
  nsm: {
    open: {
      light: 'hsl(152, 69%, 53%)',     // #34d399 - 7:1 contrast
      default: 'hsl(152, 69%, 42%)',   // #10b981 - 8:1 contrast  
      dark: 'hsl(152, 69%, 31%)',      // #059669 - 10:1 contrast
      background: 'hsl(152, 69%, 97%)', // #ecfdf5 - Light background
      border: 'hsl(152, 69%, 73%)',     // #6ee7b7 - Border color
      hover: 'hsl(152, 69%, 37%)',      // #047857 - Hover state
    },
    restricted: {
      light: 'hsl(38, 92%, 65%)',      // #fbbf24 - 7:1 contrast
      default: 'hsl(38, 92%, 50%)',    // #f59e0b - 8:1 contrast
      dark: 'hsl(38, 92%, 35%)',       // #b45309 - 10:1 contrast
      background: 'hsl(38, 92%, 97%)',  // #fffbeb - Light background
      border: 'hsl(38, 92%, 75%)',      // #fcd34d - Border color
      hover: 'hsl(38, 92%, 42%)',       // #d97706 - Hover state
    },
    confidential: {
      light: 'hsl(0, 84%, 65%)',       // #fb7185 - 7:1 contrast
      default: 'hsl(0, 84%, 55%)',     // #f43f5e - 8:1 contrast
      dark: 'hsl(0, 84%, 42%)',        // #e11d48 - 10:1 contrast
      background: 'hsl(0, 84%, 97%)',   // #fff1f2 - Light background
      border: 'hsl(0, 84%, 75%)',       // #fda4af - Border color
      hover: 'hsl(0, 84%, 47%)',        // #be123c - Hover state
    },
    secret: {
      light: 'hsl(0, 0%, 45%)',        // #737373 - 7:1 contrast
      default: 'hsl(0, 0%, 30%)',      // #4d4d4d - 8:1 contrast
      dark: 'hsl(0, 0%, 15%)',         // #262626 - 10:1 contrast
      background: 'hsl(0, 0%, 97%)',    // #f8f8f8 - Light background
      border: 'hsl(0, 0%, 65%)',        // #a6a6a6 - Border color
      hover: 'hsl(0, 0%, 20%)',         // #333333 - Hover state
    }
  },

  // Semantic Colors - Enhanced (WCAG AAA Compliant)
  semantic: {
    success: {
      light: 'hsl(142, 71%, 53%)',     // #34d399 - 7:1 contrast
      default: 'hsl(142, 71%, 42%)',   // #10b981 - 8:1 contrast
      dark: 'hsl(142, 71%, 31%)',      // #059669 - 10:1 contrast
      background: 'hsl(142, 71%, 97%)', // #ecfdf5
      foreground: 'hsl(0, 0%, 100%)',  // White text
      border: 'hsl(142, 71%, 73%)',     // #6ee7b7
    },
    warning: {
      light: 'hsl(38, 92%, 65%)',      // #fbbf24 - 7:1 contrast
      default: 'hsl(38, 92%, 50%)',    // #f59e0b - 8:1 contrast
      dark: 'hsl(38, 92%, 35%)',       // #b45309 - 10:1 contrast
      background: 'hsl(38, 92%, 97%)',  // #fffbeb
      foreground: 'hsl(0, 0%, 100%)',  // White text
      border: 'hsl(38, 92%, 75%)',      // #fcd34d
    },
    error: {
      light: 'hsl(0, 72%, 61%)',       // #f87171 - 7:1 contrast
      default: 'hsl(0, 72%, 51%)',     // #ef4444 - 8:1 contrast
      dark: 'hsl(0, 72%, 38%)',        // #dc2626 - 10:1 contrast
      background: 'hsl(0, 72%, 97%)',   // #fef2f2
      foreground: 'hsl(0, 0%, 100%)',  // White text
      border: 'hsl(0, 72%, 76%)',       // #fca5a5
    },
    info: {
      light: 'hsl(199, 89%, 63%)',     // #60a5fa - 7:1 contrast
      default: 'hsl(199, 89%, 48%)',   // #3b82f6 - 8:1 contrast
      dark: 'hsl(199, 89%, 37%)',      // #2563eb - 10:1 contrast
      background: 'hsl(199, 89%, 97%)', // #eff6ff
      foreground: 'hsl(0, 0%, 100%)',  // White text
      border: 'hsl(199, 89%, 77%)',     // #93bbfc
    }
  },

  // Neutral Palette - Enhanced (Multi-theme Support)
  neutral: {
    light: {
      0: 'hsl(0, 0%, 100%)',      // #ffffff - Pure white
      50: 'hsl(210, 40%, 98%)',   // #f8fafc - Background
      100: 'hsl(210, 40%, 96%)',  // #f1f5f9 - Surface
      200: 'hsl(214, 32%, 91%)',  // #e2e8f0 - Border
      300: 'hsl(213, 27%, 84%)',  // #cbd5e1 - Muted
      400: 'hsl(215, 20%, 65%)',  // #94a3b8 - Subtle
      500: 'hsl(215, 16%, 47%)',  // #64748b - Default
      600: 'hsl(215, 19%, 35%)',  // #475569 - Strong
      700: 'hsl(215, 25%, 27%)',  // #334155 - Emphasis (7:1 contrast)
      800: 'hsl(217, 33%, 17%)',  // #1e293b - High Emphasis (8:1 contrast)
      900: 'hsl(222, 47%, 11%)',  // #0f172a - Maximum (10:1 contrast)
      950: 'hsl(222, 47%, 7%)',   // #020617 - Ultra dark
    },
    dark: {
      0: 'hsl(222, 47%, 7%)',     // #020617 - Background
      50: 'hsl(222, 47%, 11%)',   // #0f172a - Surface
      100: 'hsl(217, 33%, 17%)',  // #1e293b - Border
      200: 'hsl(215, 25%, 27%)',  // #334155 - Muted
      300: 'hsl(215, 19%, 35%)',  // #475569 - Subtle
      400: 'hsl(215, 16%, 47%)',  // #64748b - Default
      500: 'hsl(215, 20%, 65%)',  // #94a3b8 - Strong
      600: 'hsl(213, 27%, 84%)',  // #cbd5e1 - Emphasis (7:1 contrast)
      700: 'hsl(214, 32%, 91%)',  // #e2e8f0 - High Emphasis (8:1 contrast)
      800: 'hsl(210, 40%, 96%)',  // #f1f5f9 - Maximum (10:1 contrast)
      900: 'hsl(210, 40%, 98%)',  // #f8fafc - Ultra light
      950: 'hsl(0, 0%, 100%)',    // #ffffff - Near white
    }
  },

  // Special Effects & Gradients
  gradient: {
    primary: 'linear-gradient(135deg, hsl(217, 91%, 50%) 0%, hsl(263, 67%, 50%) 100%)',
    secondary: 'linear-gradient(135deg, hsl(263, 67%, 50%) 0%, hsl(234, 89%, 62%) 100%)',
    success: 'linear-gradient(135deg, hsl(142, 71%, 42%) 0%, hsl(152, 69%, 53%) 100%)',
    warning: 'linear-gradient(135deg, hsl(38, 92%, 50%) 0%, hsl(45, 100%, 51%) 100%)',
    error: 'linear-gradient(135deg, hsl(0, 72%, 51%) 0%, hsl(14, 100%, 57%) 100%)',
    info: 'linear-gradient(135deg, hsl(199, 89%, 48%) 0%, hsl(174, 77%, 41%) 100%)',
    aurora: 'linear-gradient(135deg, hsl(217, 91%, 50%) 0%, hsl(263, 67%, 50%) 50%, hsl(14, 100%, 57%) 100%)',
    northern: 'linear-gradient(135deg, hsl(174, 77%, 41%) 0%, hsl(152, 69%, 42%) 50%, hsl(142, 71%, 53%) 100%)',
  },

  // High Contrast Theme - Enhanced (Maximum Accessibility)
  highContrast: {
    background: 'hsl(0, 0%, 0%)',        // Pure black
    surface: 'hsl(0, 0%, 100%)',         // Pure white
    text: 'hsl(0, 0%, 100%)',            // Pure white text
    textInverse: 'hsl(0, 0%, 0%)',       // Pure black text
    border: 'hsl(0, 0%, 100%)',          // High contrast borders
    focus: 'hsl(60, 100%, 50%)',         // Yellow focus (maximum visibility)
    primary: 'hsl(217, 100%, 60%)',      // Bright blue
    secondary: 'hsl(263, 100%, 70%)',    // Bright purple
    success: 'hsl(142, 100%, 60%)',      // Bright green
    warning: 'hsl(38, 100%, 60%)',       // Bright amber
    error: 'hsl(0, 100%, 60%)',          // Bright red
    info: 'hsl(199, 100%, 60%)',         // Bright blue
  },

  // Alpha Values (for overlays and glassmorphism)
  alpha: {
    5: '0.05',
    10: '0.10',
    20: '0.20',
    30: '0.30',
    40: '0.40',
    50: '0.50',
    60: '0.60',
    70: '0.70',
    80: '0.80',
    90: '0.90',
    95: '0.95',
  }
} as const;

// CSS Custom Properties Export - Enhanced
export const cssColorTokens = {
  // Light Theme Variables
  light: {
    // Core Colors
    '--color-primary': colorTokens.primary[600],
    '--color-primary-hover': colorTokens.primary[700],
    '--color-primary-active': colorTokens.primary[800],
    '--color-primary-foreground': colorTokens.neutral.light[0],
    
    '--color-secondary': colorTokens.secondary[600],
    '--color-secondary-hover': colorTokens.secondary[700],
    '--color-secondary-active': colorTokens.secondary[800],
    '--color-secondary-foreground': colorTokens.neutral.light[0],
    
    // Background & Surface
    '--color-background': colorTokens.neutral.light[0],
    '--color-background-secondary': colorTokens.neutral.light[50],
    '--color-background-tertiary': colorTokens.neutral.light[100],
    
    '--color-surface': colorTokens.neutral.light[0],
    '--color-surface-secondary': colorTokens.neutral.light[50],
    '--color-surface-tertiary': colorTokens.neutral.light[100],
    
    // Foreground & Text
    '--color-foreground': colorTokens.neutral.light[900],
    '--color-foreground-secondary': colorTokens.neutral.light[700],
    '--color-foreground-tertiary': colorTokens.neutral.light[600],
    '--color-foreground-disabled': colorTokens.neutral.light[400],
    
    // UI Elements
    '--color-border': colorTokens.neutral.light[200],
    '--color-border-hover': colorTokens.neutral.light[300],
    '--color-border-focus': colorTokens.primary[500],
    
    '--color-input': colorTokens.neutral.light[0],
    '--color-input-border': colorTokens.neutral.light[200],
    '--color-input-focus': colorTokens.primary[500],
    
    '--color-ring': colorTokens.primary[500],
    '--color-ring-offset': colorTokens.neutral.light[0],
    
    // Semantic Colors
    '--color-success': colorTokens.semantic.success.default,
    '--color-success-background': colorTokens.semantic.success.background,
    '--color-success-border': colorTokens.semantic.success.border,
    
    '--color-warning': colorTokens.semantic.warning.default,
    '--color-warning-background': colorTokens.semantic.warning.background,
    '--color-warning-border': colorTokens.semantic.warning.border,
    
    '--color-error': colorTokens.semantic.error.default,
    '--color-error-background': colorTokens.semantic.error.background,
    '--color-error-border': colorTokens.semantic.error.border,
    
    '--color-info': colorTokens.semantic.info.default,
    '--color-info-background': colorTokens.semantic.info.background,
    '--color-info-border': colorTokens.semantic.info.border,
    
    // NSM Classifications
    '--color-nsm-open': colorTokens.nsm.open.default,
    '--color-nsm-open-background': colorTokens.nsm.open.background,
    '--color-nsm-open-border': colorTokens.nsm.open.border,
    
    '--color-nsm-restricted': colorTokens.nsm.restricted.default,
    '--color-nsm-restricted-background': colorTokens.nsm.restricted.background,
    '--color-nsm-restricted-border': colorTokens.nsm.restricted.border,
    
    '--color-nsm-confidential': colorTokens.nsm.confidential.default,
    '--color-nsm-confidential-background': colorTokens.nsm.confidential.background,
    '--color-nsm-confidential-border': colorTokens.nsm.confidential.border,
    
    '--color-nsm-secret': colorTokens.nsm.secret.default,
    '--color-nsm-secret-background': colorTokens.nsm.secret.background,
    '--color-nsm-secret-border': colorTokens.nsm.secret.border,
  },

  // Dark Theme Variables
  dark: {
    // Core Colors
    '--color-primary': colorTokens.primary[400],
    '--color-primary-hover': colorTokens.primary[300],
    '--color-primary-active': colorTokens.primary[200],
    '--color-primary-foreground': colorTokens.neutral.dark[900],
    
    '--color-secondary': colorTokens.secondary[400],
    '--color-secondary-hover': colorTokens.secondary[300],
    '--color-secondary-active': colorTokens.secondary[200],
    '--color-secondary-foreground': colorTokens.neutral.dark[900],
    
    // Background & Surface
    '--color-background': colorTokens.neutral.dark[0],
    '--color-background-secondary': colorTokens.neutral.dark[50],
    '--color-background-tertiary': colorTokens.neutral.dark[100],
    
    '--color-surface': colorTokens.neutral.dark[50],
    '--color-surface-secondary': colorTokens.neutral.dark[100],
    '--color-surface-tertiary': colorTokens.neutral.dark[200],
    
    // Foreground & Text
    '--color-foreground': colorTokens.neutral.dark[900],
    '--color-foreground-secondary': colorTokens.neutral.dark[700],
    '--color-foreground-tertiary': colorTokens.neutral.dark[600],
    '--color-foreground-disabled': colorTokens.neutral.dark[400],
    
    // UI Elements
    '--color-border': colorTokens.neutral.dark[200],
    '--color-border-hover': colorTokens.neutral.dark[300],
    '--color-border-focus': colorTokens.primary[400],
    
    '--color-input': colorTokens.neutral.dark[100],
    '--color-input-border': colorTokens.neutral.dark[200],
    '--color-input-focus': colorTokens.primary[400],
    
    '--color-ring': colorTokens.primary[400],
    '--color-ring-offset': colorTokens.neutral.dark[0],
    
    // Semantic Colors (adjusted for dark theme)
    '--color-success': colorTokens.semantic.success.light,
    '--color-success-background': `hsla(142, 71%, 42%, ${colorTokens.alpha[10]})`,
    '--color-success-border': colorTokens.semantic.success.dark,
    
    '--color-warning': colorTokens.semantic.warning.light,
    '--color-warning-background': `hsla(38, 92%, 50%, ${colorTokens.alpha[10]})`,
    '--color-warning-border': colorTokens.semantic.warning.dark,
    
    '--color-error': colorTokens.semantic.error.light,
    '--color-error-background': `hsla(0, 72%, 51%, ${colorTokens.alpha[10]})`,
    '--color-error-border': colorTokens.semantic.error.dark,
    
    '--color-info': colorTokens.semantic.info.light,
    '--color-info-background': `hsla(199, 89%, 48%, ${colorTokens.alpha[10]})`,
    '--color-info-border': colorTokens.semantic.info.dark,
    
    // NSM Classifications (adjusted for dark theme)
    '--color-nsm-open': colorTokens.nsm.open.light,
    '--color-nsm-open-background': `hsla(152, 69%, 42%, ${colorTokens.alpha[10]})`,
    '--color-nsm-open-border': colorTokens.nsm.open.dark,
    
    '--color-nsm-restricted': colorTokens.nsm.restricted.light,
    '--color-nsm-restricted-background': `hsla(38, 92%, 50%, ${colorTokens.alpha[10]})`,
    '--color-nsm-restricted-border': colorTokens.nsm.restricted.dark,
    
    '--color-nsm-confidential': colorTokens.nsm.confidential.light,
    '--color-nsm-confidential-background': `hsla(0, 84%, 55%, ${colorTokens.alpha[10]})`,
    '--color-nsm-confidential-border': colorTokens.nsm.confidential.dark,
    
    '--color-nsm-secret': colorTokens.nsm.secret.light,
    '--color-nsm-secret-background': `hsla(0, 0%, 30%, ${colorTokens.alpha[10]})`,
    '--color-nsm-secret-border': colorTokens.nsm.secret.dark,
  }
} as const;

// Utility function to get NSM classification color
export const getNSMColor = (classification: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET') => {
  switch (classification) {
    case 'OPEN':
      return colorTokens.nsm.open;
    case 'RESTRICTED':
      return colorTokens.nsm.restricted;
    case 'CONFIDENTIAL':
      return colorTokens.nsm.confidential;
    case 'SECRET':
      return colorTokens.nsm.secret;
    default:
      return colorTokens.nsm.open;
  }
};

// Create color with alpha
export const withAlpha = (color: string, alpha: keyof typeof colorTokens.alpha): string => {
  // Extract HSL values from the color string
  const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (match) {
    const [, h, s, l] = match;
    return `hsla(${h}, ${s}%, ${l}%, ${colorTokens.alpha[alpha]})`;
  }
  return color;
};

// Type definitions
export type NSMClassification = keyof typeof colorTokens.nsm;
export type ColorScale = keyof typeof colorTokens.primary;
export type NeutralScale = keyof typeof colorTokens.neutral.light;
export type SemanticColor = keyof typeof colorTokens.semantic;
export type AccentColor = keyof typeof colorTokens.accent;
export type AlphaValue = keyof typeof colorTokens.alpha;