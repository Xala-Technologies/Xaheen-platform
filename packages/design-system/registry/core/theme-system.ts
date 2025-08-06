/**
 * Universal Theme System
 * Provides consistent theming across all platforms with dark/light mode support
 */

import { Platform } from './component-specs';

// =============================================================================
// THEME SYSTEM TYPES
// =============================================================================

export interface UniversalTheme {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: 'light' | 'dark' | 'auto' | 'custom';
  readonly tokens: ThemeTokens;
  readonly platforms: ThemePlatformConfig;
  readonly semanticColors: SemanticColorScheme;
  readonly accessibility: ThemeAccessibility;
}

export interface ThemeTokens {
  readonly colors: ColorTokens;
  readonly typography: TypographyTokens;
  readonly spacing: SpacingTokens;
  readonly shadows: ShadowTokens;
  readonly borders: BorderTokens;
  readonly motion: MotionTokens;
  readonly breakpoints: BreakpointTokens;
}

export interface ColorTokens {
  readonly primary: ColorScale;
  readonly secondary: ColorScale;
  readonly accent: ColorScale;
  readonly neutral: ColorScale;
  readonly success: ColorScale;
  readonly warning: ColorScale;
  readonly error: ColorScale;
  readonly info: ColorScale;
  readonly surface: SurfaceColors;
  readonly text: TextColors;
  readonly border: BorderColors;
}

export interface ColorScale {
  readonly 50: string;
  readonly 100: string;
  readonly 200: string;
  readonly 300: string;
  readonly 400: string;
  readonly 500: string; // Base color
  readonly 600: string;
  readonly 700: string;
  readonly 800: string;
  readonly 900: string;
  readonly 950: string;
}

export interface SurfaceColors {
  readonly background: string;
  readonly foreground: string;
  readonly card: string;
  readonly cardForeground: string;
  readonly popover: string;
  readonly popoverForeground: string;
  readonly muted: string;
  readonly mutedForeground: string;
}

export interface TextColors {
  readonly primary: string;
  readonly secondary: string;
  readonly muted: string;
  readonly disabled: string;
  readonly inverse: string;
}

export interface BorderColors {
  readonly default: string;
  readonly muted: string;
  readonly focus: string;
  readonly error: string;
  readonly success: string;
}

export interface TypographyTokens {
  readonly fontFamily: FontFamilyTokens;
  readonly fontSize: FontSizeTokens;
  readonly fontWeight: FontWeightTokens;
  readonly lineHeight: LineHeightTokens;
  readonly letterSpacing: LetterSpacingTokens;
}

export interface FontFamilyTokens {
  readonly sans: string[];
  readonly serif: string[];
  readonly mono: string[];
  readonly display: string[];
}

export interface FontSizeTokens {
  readonly xs: string;
  readonly sm: string;
  readonly base: string;
  readonly lg: string;
  readonly xl: string;
  readonly '2xl': string;
  readonly '3xl': string;
  readonly '4xl': string;
  readonly '5xl': string;
  readonly '6xl': string;
  readonly '7xl': string;
  readonly '8xl': string;
  readonly '9xl': string;
}

export interface FontWeightTokens {
  readonly thin: number;
  readonly extralight: number;
  readonly light: number;
  readonly normal: number;
  readonly medium: number;
  readonly semibold: number;
  readonly bold: number;
  readonly extrabold: number;
  readonly black: number;
}

export interface LineHeightTokens {
  readonly none: number;
  readonly tight: number;
  readonly snug: number;
  readonly normal: number;
  readonly relaxed: number;
  readonly loose: number;
}

export interface LetterSpacingTokens {
  readonly tighter: string;
  readonly tight: string;
  readonly normal: string;
  readonly wide: string;
  readonly wider: string;
  readonly widest: string;
}

export interface SpacingTokens {
  readonly px: string;
  readonly 0: string;
  readonly 0.5: string;
  readonly 1: string;
  readonly 1.5: string;
  readonly 2: string;
  readonly 2.5: string;
  readonly 3: string;
  readonly 3.5: string;
  readonly 4: string;
  readonly 5: string;
  readonly 6: string;
  readonly 7: string;
  readonly 8: string;
  readonly 9: string;
  readonly 10: string;
  readonly 11: string;
  readonly 12: string;
  readonly 14: string;
  readonly 16: string;
  readonly 20: string;
  readonly 24: string;
  readonly 28: string;
  readonly 32: string;
  readonly 36: string;
  readonly 40: string;
  readonly 44: string;
  readonly 48: string;
  readonly 52: string;
  readonly 56: string;
  readonly 60: string;
  readonly 64: string;
  readonly 72: string;
  readonly 80: string;
  readonly 96: string;
}

export interface ShadowTokens {
  readonly xs: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
  readonly '2xl': string;
  readonly inner: string;
  readonly none: string;
}

export interface BorderTokens {
  readonly width: BorderWidthTokens;
  readonly radius: BorderRadiusTokens;
}

export interface BorderWidthTokens {
  readonly 0: string;
  readonly 1: string;
  readonly 2: string;
  readonly 4: string;
  readonly 8: string;
}

export interface BorderRadiusTokens {
  readonly none: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
  readonly '2xl': string;
  readonly '3xl': string;
  readonly full: string;
}

export interface MotionTokens {
  readonly duration: DurationTokens;
  readonly easing: EasingTokens;
  readonly scale: ScaleTokens;
}

export interface DurationTokens {
  readonly instant: string;
  readonly fast: string;
  readonly normal: string;
  readonly slow: string;
  readonly slower: string;
}

export interface EasingTokens {
  readonly linear: string;
  readonly ease: string;
  readonly easeIn: string;
  readonly easeOut: string;
  readonly easeInOut: string;
  readonly spring: string;
}

export interface ScaleTokens {
  readonly 0: string;
  readonly 50: string;
  readonly 75: string;
  readonly 90: string;
  readonly 95: string;
  readonly 100: string;
  readonly 105: string;
  readonly 110: string;
  readonly 125: string;
  readonly 150: string;
}

export interface BreakpointTokens {
  readonly xs: string;
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
  readonly '2xl': string;
}

export interface ThemePlatformConfig {
  readonly react: ReactThemeConfig;
  readonly vue: VueThemeConfig;
  readonly angular: AngularThemeConfig;
  readonly svelte: SvelteThemeConfig;
  readonly 'react-native': ReactNativeThemeConfig;
  readonly ionic: IonicThemeConfig;
  readonly vanilla: VanillaThemeConfig;
}

export interface ReactThemeConfig {
  readonly cssVariables: boolean;
  readonly tailwindConfig: TailwindThemeConfig;
  readonly styledComponents?: StyledComponentsThemeConfig;
  readonly emotion?: EmotionThemeConfig;
}

export interface VueThemeConfig {
  readonly cssVariables: boolean;
  readonly composables: VueComposableConfig;
}

export interface AngularThemeConfig {
  readonly cssVariables: boolean;
  readonly materialIntegration: boolean;
}

export interface SvelteThemeConfig {
  readonly cssVariables: boolean;
  readonly stores: SvelteStoreConfig;
}

export interface ReactNativeThemeConfig {
  readonly styleSheet: boolean;
  readonly asyncStorage: boolean;
}

export interface IonicThemeConfig {
  readonly ionicVariables: boolean;
  readonly platformSpecific: boolean;
}

export interface VanillaThemeConfig {
  readonly cssVariables: boolean;
  readonly dataAttributes: boolean;
}

export interface TailwindThemeConfig {
  readonly extend: boolean;
  readonly darkMode: 'media' | 'class' | 'selector';
}

export interface StyledComponentsThemeConfig {
  readonly themeProvider: boolean;
  readonly globalStyles: boolean;
}

export interface EmotionThemeConfig {
  readonly themeProvider: boolean;
  readonly globalStyles: boolean;
}

export interface VueComposableConfig {
  readonly useTheme: boolean;
  readonly useColorMode: boolean;
}

export interface SvelteStoreConfig {
  readonly themeStore: boolean;
  readonly colorModeStore: boolean;
}

export interface SemanticColorScheme {
  readonly intent: IntentColors;
  readonly feedback: FeedbackColors;
  readonly interactive: InteractiveColors;
}

export interface IntentColors {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
}

export interface FeedbackColors {
  readonly success: string;
  readonly warning: string;
  readonly error: string;
  readonly info: string;
}

export interface InteractiveColors {
  readonly link: string;
  readonly linkHover: string;
  readonly linkVisited: string;
  readonly focus: string;
  readonly selection: string;
}

export interface ThemeAccessibility {
  readonly contrastRatio: 'AA' | 'AAA';
  readonly colorBlindSupport: boolean;
  readonly reducedMotion: boolean;
  readonly highContrast: boolean;
}

// =============================================================================
// DEFAULT LIGHT THEME
// =============================================================================

export const LightTheme: UniversalTheme = {
  id: 'light',
  name: 'Light Theme',
  description: 'Default light theme with high contrast and WCAG AAA compliance',
  type: 'light',
  
  tokens: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6', // Base blue
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
        500: '#64748b', // Base slate
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617'
      },
      accent: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f5d0fe',
        300: '#f0abfc',
        400: '#e879f9',
        500: '#d946ef', // Base purple
        600: '#c026d3',
        700: '#a21caf',
        800: '#86198f',
        900: '#701a75',
        950: '#4a044e'
      },
      neutral: {
        50: '#fafafa',
        100: '#f4f4f5',
        200: '#e4e4e7',
        300: '#d4d4d8',
        400: '#a1a1aa',
        500: '#71717a', // Base zinc
        600: '#52525b',
        700: '#3f3f46',
        800: '#27272a',
        900: '#18181b',
        950: '#09090b'
      },
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e', // Base green
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        950: '#052e16'
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b', // Base amber
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        950: '#451a03'
      },
      error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444', // Base red
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        950: '#450a0a'
      },
      info: {
        50: '#ecfeff',
        100: '#cffafe',
        200: '#a5f3fc',
        300: '#67e8f9',
        400: '#22d3ee',
        500: '#06b6d4', // Base cyan
        600: '#0891b2',
        700: '#0e7490',
        800: '#155e75',
        900: '#164e63',
        950: '#083344'
      },
      surface: {
        background: '#ffffff',
        foreground: '#09090b',
        card: '#ffffff',
        cardForeground: '#09090b',
        popover: '#ffffff',
        popoverForeground: '#09090b',
        muted: '#f4f4f5',
        mutedForeground: '#71717a'
      },
      text: {
        primary: '#09090b',
        secondary: '#71717a',
        muted: '#a1a1aa',
        disabled: '#d4d4d8',
        inverse: '#ffffff'
      },
      border: {
        default: '#e4e4e7',
        muted: '#f4f4f5',
        focus: '#3b82f6',
        error: '#ef4444',
        success: '#22c55e'
      }
    },
    
    typography: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
        display: ['Inter Display', 'Inter', 'sans-serif']
      },
      fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem',  // 36px
        '5xl': '3rem',     // 48px
        '6xl': '3.75rem',  // 60px
        '7xl': '4.5rem',   // 72px
        '8xl': '6rem',     // 96px
        '9xl': '8rem'      // 128px
      },
      fontWeight: {
        thin: 100,
        extralight: 200,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900
      },
      lineHeight: {
        none: 1,
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em'
      }
    },
    
    spacing: {
      px: '1px',
      0: '0px',
      0.5: '0.125rem',  // 2px
      1: '0.25rem',     // 4px
      1.5: '0.375rem',  // 6px
      2: '0.5rem',      // 8px
      2.5: '0.625rem',  // 10px
      3: '0.75rem',     // 12px
      3.5: '0.875rem',  // 14px
      4: '1rem',        // 16px
      5: '1.25rem',     // 20px
      6: '1.5rem',      // 24px
      7: '1.75rem',     // 28px
      8: '2rem',        // 32px
      9: '2.25rem',     // 36px
      10: '2.5rem',     // 40px
      11: '2.75rem',    // 44px
      12: '3rem',       // 48px
      14: '3.5rem',     // 56px
      16: '4rem',       // 64px
      20: '5rem',       // 80px
      24: '6rem',       // 96px
      28: '7rem',       // 112px
      32: '8rem',       // 128px
      36: '9rem',       // 144px
      40: '10rem',      // 160px
      44: '11rem',      // 176px
      48: '12rem',      // 192px
      52: '13rem',      // 208px
      56: '14rem',      // 224px
      60: '15rem',      // 240px
      64: '16rem',      // 256px
      72: '18rem',      // 288px
      80: '20rem',      // 320px
      96: '24rem'       // 384px
    },
    
    shadows: {
      xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      none: '0 0 #0000'
    },
    
    borders: {
      width: {
        0: '0px',
        1: '1px',
        2: '2px',
        4: '4px',
        8: '8px'
      },
      radius: {
        none: '0px',
        sm: '0.125rem',   // 2px
        md: '0.375rem',   // 6px
        lg: '0.5rem',     // 8px
        xl: '0.75rem',    // 12px
        '2xl': '1rem',    // 16px
        '3xl': '1.5rem',  // 24px
        full: '9999px'
      }
    },
    
    motion: {
      duration: {
        instant: '0ms',
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
        slower: '800ms'
      },
      easing: {
        linear: 'linear',
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      },
      scale: {
        0: '0',
        50: '0.5',
        75: '0.75',
        90: '0.9',
        95: '0.95',
        100: '1',
        105: '1.05',
        110: '1.1',
        125: '1.25',
        150: '1.5'
      }
    },
    
    breakpoints: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    }
  },
  
  platforms: {
    react: {
      cssVariables: true,
      tailwindConfig: {
        extend: true,
        darkMode: 'class'
      },
      styledComponents: {
        themeProvider: true,
        globalStyles: true
      },
      emotion: {
        themeProvider: true,
        globalStyles: true
      }
    },
    vue: {
      cssVariables: true,
      composables: {
        useTheme: true,
        useColorMode: true
      }
    },
    angular: {
      cssVariables: true,
      materialIntegration: true
    },
    svelte: {
      cssVariables: true,
      stores: {
        themeStore: true,
        colorModeStore: true
      }
    },
    'react-native': {
      styleSheet: true,
      asyncStorage: true
    },
    ionic: {
      ionicVariables: true,
      platformSpecific: true
    },
    vanilla: {
      cssVariables: true,
      dataAttributes: true
    }
  },
  
  semanticColors: {
    intent: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#d946ef'
    },
    feedback: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4'
    },
    interactive: {
      link: '#3b82f6',
      linkHover: '#2563eb',
      linkVisited: '#7c3aed',
      focus: '#3b82f6',
      selection: '#dbeafe'
    }
  },
  
  accessibility: {
    contrastRatio: 'AAA',
    colorBlindSupport: true,
    reducedMotion: true,
    highContrast: true
  }
};

// =============================================================================
// DEFAULT DARK THEME
// =============================================================================

export const DarkTheme: UniversalTheme = {
  ...LightTheme,
  id: 'dark',
  name: 'Dark Theme',
  description: 'Default dark theme with high contrast and WCAG AAA compliance',
  type: 'dark',
  
  tokens: {
    ...LightTheme.tokens,
    colors: {
      ...LightTheme.tokens.colors,
      surface: {
        background: '#09090b',
        foreground: '#fafafa',
        card: '#09090b',
        cardForeground: '#fafafa',
        popover: '#09090b',
        popoverForeground: '#fafafa',
        muted: '#27272a',
        mutedForeground: '#a1a1aa'
      },
      text: {
        primary: '#fafafa',
        secondary: '#a1a1aa',
        muted: '#71717a',
        disabled: '#3f3f46',
        inverse: '#09090b'
      },
      border: {
        default: '#27272a',
        muted: '#18181b',
        focus: '#60a5fa',
        error: '#f87171',
        success: '#4ade80'
      }
    }
  }
};

// =============================================================================
// THEME REGISTRY
// =============================================================================

export const THEME_REGISTRY = {
  light: LightTheme,
  dark: DarkTheme
} as const;

export type ThemeId = keyof typeof THEME_REGISTRY;

// =============================================================================
// THEME UTILITIES
// =============================================================================

export const ThemeUtils = {
  /**
   * Get theme by ID
   */
  getTheme: (id: ThemeId): UniversalTheme => {
    return THEME_REGISTRY[id];
  },
  
  /**
   * Get available themes
   */
  getAvailableThemes: (): UniversalTheme[] => {
    return Object.values(THEME_REGISTRY);
  },
  
  /**
   * Check if theme supports platform
   */
  supportsPlat