/**
 * Theme Generator
 * Generate theme files for different platforms and configurations
 */

import { UniversalTheme, ThemeId } from '../core/theme-system';
import { ThemeConverters } from '../core/theme-converters';
import { Platform } from '../core/component-specs';

// =============================================================================
// THEME GENERATION TYPES
// =============================================================================

export interface ThemeGenerationContext {
  readonly theme: UniversalTheme;
  readonly platform: Platform;
  readonly options: ThemeGenerationOptions;
}

export interface ThemeGenerationOptions {
  readonly outputPath?: string;
  readonly includeProvider?: boolean;
  readonly includeComponents?: boolean;
  readonly includeCSSVariables?: boolean;
  readonly includeUtilities?: boolean;
  readonly customPrefix?: string;
  readonly generateTypes?: boolean;
}

export interface GeneratedThemeFile {
  readonly path: string;
  readonly content: string;
  readonly type: 'theme' | 'provider' | 'utilities' | 'types' | 'config';
  readonly platform: Platform;
}

// =============================================================================
// PLATFORM THEME GENERATORS
// =============================================================================

export class ThemeGenerator {
  /**
   * Generate theme files for a specific platform
   */
  static generateThemeForPlatform(
    theme: UniversalTheme,
    platform: Platform,
    options: ThemeGenerationOptions = {}
  ): GeneratedThemeFile[] {
    const context: ThemeGenerationContext = { theme, platform, options };
    const files: GeneratedThemeFile[] = [];

    // Generate main theme file
    files.push(this.generateMainTheme(context));

    // Generate platform-specific provider
    if (options.includeProvider) {
      files.push(this.generateThemeProvider(context));
    }

    // Generate CSS variables
    if (options.includeCSSVariables && this.supportsCSSVariables(platform)) {
      files.push(this.generateCSSVariables(context));
    }

    // Generate utility classes
    if (options.includeUtilities) {
      files.push(this.generateUtilities(context));
    }

    // Generate TypeScript types
    if (options.generateTypes) {
      files.push(this.generateTypes(context));
    }

    return files;
  }

  /**
   * Generate main theme file
   */
  private static generateMainTheme(context: ThemeGenerationContext): GeneratedThemeFile {
    const { theme, platform, options } = context;
    
    switch (platform) {
      case 'react':
      case 'nextjs':
        return this.generateReactTheme(context);
      case 'vue':
      case 'nuxt':
        return this.generateVueTheme(context);
      case 'angular':
        return this.generateAngularTheme(context);
      case 'svelte':
      case 'sveltekit':
        return this.generateSvelteTheme(context);
      case 'react-native':
      case 'expo':
        return this.generateReactNativeTheme(context);
      case 'ionic':
        return this.generateIonicTheme(context);
      case 'vanilla':
        return this.generateVanillaTheme(context);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Generate React theme
   */
  private static generateReactTheme(context: ThemeGenerationContext): GeneratedThemeFile {
    const { theme, platform } = context;
    const tailwindTheme = ThemeConverters.toTailwind(theme);
    const styledTheme = ThemeConverters.toStyledComponents(theme);

    const content = `/**
 * ${theme.name} - React Implementation
 * Generated theme configuration for React applications
 */

import { UniversalTheme } from '../core/theme-system';

// Tailwind CSS theme extension
export const tailwindTheme = ${JSON.stringify(tailwindTheme, null, 2)};

// Styled Components theme
export const styledComponentsTheme = ${JSON.stringify(styledTheme, null, 2)};

// Emotion theme (compatible with Styled Components)
export const emotionTheme = styledComponentsTheme;

// Universal theme object
export const theme: UniversalTheme = ${JSON.stringify(theme, null, 2)};

// Theme tokens for direct access
export const tokens = theme.tokens;

// Semantic color helpers
export const colors = {
  primary: theme.tokens.colors.primary,
  secondary: theme.tokens.colors.secondary,
  accent: theme.tokens.colors.accent,
  success: theme.tokens.colors.success,
  warning: theme.tokens.colors.warning,
  error: theme.tokens.colors.error,
  surface: theme.tokens.colors.surface,
  text: theme.tokens.colors.text,
  border: theme.tokens.colors.border
};

// Typography helpers
export const typography = theme.tokens.typography;

// Spacing helpers  
export const spacing = theme.tokens.spacing;

// Shadow helpers
export const shadows = theme.tokens.shadows;

// Motion helpers
export const motion = theme.tokens.motion;

export default theme;`;

    return {
      path: `${theme.id}.theme.ts`,
      content,
      type: 'theme',
      platform
    };
  }

  /**
   * Generate Vue theme
   */
  private static generateVueTheme(context: ThemeGenerationContext): GeneratedThemeFile {
    const { theme, platform } = context;
    const cssVariables = ThemeConverters.toCSSVariables(theme);

    const content = `/**
 * ${theme.name} - Vue Implementation
 * Generated theme configuration for Vue applications
 */

import type { UniversalTheme } from '../core/theme-system';

// CSS Variables
export const cssVariables = ${JSON.stringify(cssVariables, null, 2)};

// Universal theme object
export const theme: UniversalTheme = ${JSON.stringify(theme, null, 2)};

// Composable-friendly theme tokens
export const useThemeTokens = () => {
  return {
    colors: theme.tokens.colors,
    typography: theme.tokens.typography,
    spacing: theme.tokens.spacing,
    shadows: theme.tokens.shadows,
    borders: theme.tokens.borders,
    motion: theme.tokens.motion,
    breakpoints: theme.tokens.breakpoints
  };
};

// CSS variable helpers
export const getCSSVariable = (path: string): string => {
  return \`var(--\${path})\`;
};

// Theme class helpers
export const getThemeClass = (isDark: boolean = false): string => {
  return isDark ? 'dark' : 'light';
};

export default theme;`;

    return {
      path: `${theme.id}.theme.ts`,
      content,
      type: 'theme',
      platform
    };
  }

  /**
   * Generate Angular theme
   */
  private static generateAngularTheme(context: ThemeGenerationContext): GeneratedThemeFile {
    const { theme, platform } = context;
    const cssVariables = ThemeConverters.toCSSVariables(theme);

    const content = `/**
 * ${theme.name} - Angular Implementation
 * Generated theme configuration for Angular applications
 */

import { InjectionToken } from '@angular/core';
import type { UniversalTheme } from '../core/theme-system';

// Injection token for theme
export const THEME_TOKEN = new InjectionToken<UniversalTheme>('THEME_TOKEN');

// CSS Variables
export const cssVariables = ${JSON.stringify(cssVariables, null, 2)};

// Universal theme object
export const theme: UniversalTheme = ${JSON.stringify(theme, null, 2)};

// Angular Material theme integration
export const materialTheme = {
  primary: theme.tokens.colors.primary,
  accent: theme.tokens.colors.accent,
  warn: theme.tokens.colors.error
};

// Theme tokens as constants
export const THEME_COLORS = theme.tokens.colors;
export const THEME_TYPOGRAPHY = theme.tokens.typography;
export const THEME_SPACING = theme.tokens.spacing;
export const THEME_SHADOWS = theme.tokens.shadows;
export const THEME_MOTION = theme.tokens.motion;

// CSS class helpers
export class ThemeHelpers {
  static getThemeClass(isDark: boolean = false): string {
    return isDark ? 'dark' : 'light';
  }

  static getCSSVariable(path: string): string {
    return \`var(--\${path})\`;
  }

  static getColor(colorPath: string): string {
    // Navigate color object by path (e.g., 'primary.500')
    const keys = colorPath.split('.');
    let current: any = THEME_COLORS;
    
    for (const key of keys) {
      current = current[key];
      if (current === undefined) break;
    }
    
    return current || '';
  }
}

export default theme;`;

    return {
      path: `${theme.id}.theme.ts`,
      content,
      type: 'theme',
      platform
    };
  }

  /**
   * Generate Svelte theme
   */
  private static generateSvelteTheme(context: ThemeGenerationContext): GeneratedThemeFile {
    const { theme, platform } = context;
    const cssVariables = ThemeConverters.toCSSVariables(theme);

    const content = `/**
 * ${theme.name} - Svelte Implementation
 * Generated theme configuration for Svelte applications
 */

import type { UniversalTheme } from '../core/theme-system';

// CSS Variables
export const cssVariables = ${JSON.stringify(cssVariables, null, 2)};

// Universal theme object
export const theme: UniversalTheme = ${JSON.stringify(theme, null, 2)};

// Theme tokens
export const tokens = theme.tokens;

// Color helpers
export const colors = {
  primary: theme.tokens.colors.primary,
  secondary: theme.tokens.colors.secondary,
  accent: theme.tokens.colors.accent,
  success: theme.tokens.colors.success,
  warning: theme.tokens.colors.warning,
  error: theme.tokens.colors.error,
  surface: theme.tokens.colors.surface,
  text: theme.tokens.colors.text,
  border: theme.tokens.colors.border
};

// Utility functions
export function getCSSVariable(path: string): string {
  return \`var(--\${path})\`;
}

export function getThemeClass(isDark: boolean = false): string {
  return isDark ? 'dark' : 'light';
}

export function getColorValue(colorPath: string): string {
  const keys = colorPath.split('.');
  let current: any = colors;
  
  for (const key of keys) {
    current = current[key];
    if (current === undefined) break;
  }
  
  return current || '';
}

// CSS helper functions for use in components
export function applyTheme(element: HTMLElement, isDark: boolean = false): void {
  element.classList.remove('light', 'dark');
  element.classList.add(getThemeClass(isDark));
  
  // Apply CSS variables
  Object.entries(cssVariables).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

export default theme;`;

    return {
      path: `${theme.id}.theme.ts`,
      content,
      type: 'theme',
      platform
    };
  }

  /**
   * Generate React Native theme
   */
  private static generateReactNativeTheme(context: ThemeGenerationContext): GeneratedThemeFile {
    const { theme, platform } = context;
    const nativeTheme = ThemeConverters.toReactNative(theme);

    const content = `/**
 * ${theme.name} - React Native Implementation  
 * Generated theme configuration for React Native applications
 */

import { StyleSheet } from 'react-native';
import type { UniversalTheme } from '../core/theme-system';

// Universal theme object
export const theme: UniversalTheme = ${JSON.stringify(theme, null, 2)};

// React Native optimized theme
export const nativeTheme = ${JSON.stringify(nativeTheme, null, 2)};

// StyleSheet-ready theme
export const styles = StyleSheet.create({
  // Common container styles
  container: {
    flex: 1,
    backgroundColor: nativeTheme.colors.background,
  },
  
  card: {
    backgroundColor: nativeTheme.colors.card,
    borderRadius: 8,
    padding: nativeTheme.spacing[4],
    marginVertical: nativeTheme.spacing[2],
    shadowColor: nativeTheme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  text: {
    color: nativeTheme.colors.text,
    fontSize: nativeTheme.typography.fontSize.base,
    fontFamily: nativeTheme.typography.fontFamily.sans,
  },
  
  headingLarge: {
    color: nativeTheme.colors.text,
    fontSize: nativeTheme.typography.fontSize['2xl'],
    fontWeight: nativeTheme.typography.fontWeight.bold,
    fontFamily: nativeTheme.typography.fontFamily.display,
  },
  
  headingMedium: {
    color: nativeTheme.colors.text,
    fontSize: nativeTheme.typography.fontSize.xl,
    fontWeight: nativeTheme.typography.fontWeight.semibold,
    fontFamily: nativeTheme.typography.fontFamily.display,
  },
  
  // Button styles
  buttonPrimary: {
    backgroundColor: nativeTheme.colors.primary500,
    paddingHorizontal: nativeTheme.spacing[6],
    paddingVertical: nativeTheme.spacing[3],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // WCAG touch target
  },
  
  buttonSecondary: {
    backgroundColor: nativeTheme.colors.secondary500,
    paddingHorizontal: nativeTheme.spacing[6],
    paddingVertical: nativeTheme.spacing[3],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: nativeTheme.colors.primary500,
    paddingHorizontal: nativeTheme.spacing[6],
    paddingVertical: nativeTheme.spacing[3],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});

// Color helpers
export const colors = nativeTheme.colors;

// Typography helpers
export const typography = nativeTheme.typography;

// Spacing helpers
export const spacing = nativeTheme.spacing;

// Shadow helpers
export const shadows = nativeTheme.shadows;

// Platform-specific helpers
export function getStatusBarStyle(isDark: boolean): 'light-content' | 'dark-content' {
  return isDark ? 'light-content' : 'dark-content';
}

export function getNavigationBarStyle(isDark: boolean) {
  return {
    backgroundColor: isDark ? colors.background : colors.background,
    barStyle: getStatusBarStyle(isDark),
  };
}

export default {
  theme,
  nativeTheme,
  styles,
  colors,
  typography,
  spacing,
  shadows
};`;

    return {
      path: `${theme.id}.theme.ts`,
      content,
      type: 'theme',
      platform
    };
  }

  /**
   * Generate Ionic theme
   */
  private static generateIonicTheme(context: ThemeGenerationContext): GeneratedThemeFile {
    const { theme, platform } = context;
    const ionicVariables = ThemeConverters.toIonic(theme);

    const content = `/**
 * ${theme.name} - Ionic Implementation
 * Generated theme configuration for Ionic applications
 */

import type { UniversalTheme } from '../core/theme-system';

// Universal theme object
export const theme: UniversalTheme = ${JSON.stringify(theme, null, 2)};

// Ionic CSS Variables
export const ionicVariables = ${JSON.stringify(ionicVariables, null, 2)};

// CSS content for Ionic themes
export const ionicCSS = \`
:root {
${Object.entries(ionicVariables)
  .map(([property, value]) => `  ${property}: ${value};`)
  .join('\n')}
}

/* Dark theme overrides */
.dark {
  --ion-background-color: ${theme.type === 'dark' ? theme.tokens.colors.surface.background : '#000000'};
  --ion-background-color-rgb: ${theme.type === 'dark' ? '9,9,11' : '0,0,0'};
  --ion-text-color: ${theme.type === 'dark' ? theme.tokens.colors.text.primary : '#ffffff'};
  --ion-text-color-rgb: ${theme.type === 'dark' ? '250,250,250' : '255,255,255'};
}

/* Platform-specific overrides */
.ios {
  /* iOS specific styling */
  --ion-header-background: var(--ion-background-color);
}

.md {
  /* Material Design specific styling */
  --ion-header-background: var(--ion-color-primary);
}
\`;

// Ionic color palette helper
export const ionicColors = {
  primary: {
    value: theme.tokens.colors.primary[500],
    shade: theme.tokens.colors.primary[600],
    tint: theme.tokens.colors.primary[400],
  },
  secondary: {
    value: theme.tokens.colors.secondary[500],
    shade: theme.tokens.colors.secondary[600], 
    tint: theme.tokens.colors.secondary[400],
  },
  success: {
    value: theme.tokens.colors.success[500],
    shade: theme.tokens.colors.success[600],
    tint: theme.tokens.colors.success[400],
  },
  warning: {
    value: theme.tokens.colors.warning[500],
    shade: theme.tokens.colors.warning[600],
    tint: theme.tokens.colors.warning[400],
  },
  danger: {
    value: theme.tokens.colors.error[500],
    shade: theme.tokens.colors.error[600],
    tint: theme.tokens.colors.error[400],
  },
};

// Helper to apply theme to Ionic app
export function applyIonicTheme(document: Document): void {
  const style = document.createElement('style');
  style.textContent = ionicCSS;
  document.head.appendChild(style);
}

export default {
  theme,
  ionicVariables,
  ionicCSS,
  ionicColors,
  applyIonicTheme
};`;

    return {
      path: `${theme.id}.theme.ts`,
      content,
      type: 'theme',
      platform
    };
  }

  /**
   * Generate Vanilla JS theme
   */
  private static generateVanillaTheme(context: ThemeGenerationContext): GeneratedThemeFile {
    const { theme, platform } = context;
    const cssVariables = ThemeConverters.toCSSVariables(theme);

    const content = `/**
 * ${theme.name} - Vanilla JS Implementation
 * Generated theme configuration for vanilla JavaScript applications
 */

// Universal theme object  
export const theme = ${JSON.stringify(theme, null, 2)};

// CSS Variables
export const cssVariables = ${JSON.stringify(cssVariables, null, 2)};

// CSS content for injection
export const themeCSS = \`
:root {
${Object.entries(cssVariables)
  .map(([property, value]) => `  ${property}: ${value};`)
  .join('\n')}
}

/* Dark theme */
.dark {
  /* Dark theme variables would be injected here */
}

/* Theme utility classes */
.theme-text-primary { color: var(--color-text-primary); }
.theme-text-secondary { color: var(--color-text-secondary); }
.theme-bg-background { background-color: var(--background); }
.theme-bg-card { background-color: var(--card); }
.theme-border-default { border-color: var(--border); }

/* Responsive utilities */
@media (max-width: 640px) {
  .theme-responsive { /* mobile styles */ }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .theme-responsive { /* tablet styles */ }
}

@media (min-width: 1025px) {
  .theme-responsive { /* desktop styles */ }
}
\`;

// Theme manager class
export class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.init();
  }
  
  init() {
    // Inject CSS
    this.injectCSS();
    
    // Set up system theme detection
    this.setupSystemThemeDetection();
    
    // Load saved theme
    this.loadSavedTheme();
  }
  
  injectCSS() {
    const style = document.createElement('style');
    style.id = 'xaheen-theme';
    style.textContent = themeCSS;
    document.head.appendChild(style);
  }
  
  setTheme(themeId) {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    
    this.currentTheme = themeId;
    this.saveTheme(themeId);
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: themeId }
    }));
  }
  
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
  
  setupSystemThemeDetection() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e) => {
        if (this.currentTheme === 'auto') {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      };
      
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    }
  }
  
  saveTheme(themeId) {
    try {
      localStorage.setItem('xaheen-theme', themeId);
    } catch (error) {
      console.warn('Failed to save theme:', error);
    }
  }
  
  loadSavedTheme() {
    try {
      const saved = localStorage.getItem('xaheen-theme');
      if (saved && ['light', 'dark'].includes(saved)) {
        this.setTheme(saved);
      }
    } catch (error) {
      console.warn('Failed to load saved theme:', error);
    }
  }
  
  getCSSVariable(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name);
  }
  
  setCSSVariable(name, value) {
    document.documentElement.style.setProperty(name, value);
  }
}

// Create global theme manager instance
export const themeManager = new ThemeManager();

// Convenience functions
export const setTheme = (themeId) => themeManager.setTheme(themeId);
export const toggleTheme = () => themeManager.toggleTheme();
export const getCurrentTheme = () => themeManager.currentTheme;
export const getCSSVariable = (name) => themeManager.getCSSVariable(name);

export default {
  theme,
  cssVariables,
  themeCSS,
  ThemeManager,
  themeManager,
  setTheme,
  toggleTheme,
  getCurrentTheme,
  getCSSVariable
};`;

    return {
      path: `${theme.id}.theme.js`,
      content,
      type: 'theme',
      platform
    };
  }

  /**
   * Generate theme provider for platform
   */
  private static generateThemeProvider(context: ThemeGenerationContext): GeneratedThemeFile {
    const { theme, platform } = context;
    
    // Implementation would generate platform-specific providers
    // For now, return a placeholder
    const content = `// Theme provider for ${platform} - Implementation needed`;
    
    return {
      path: `${theme.id}.provider.${this.getFileExtension(platform)}`,
      content,
      type: 'provider', 
      platform
    };
  }

  /**
   * Generate CSS variables file
   */
  private static generateCSSVariables(context: ThemeGenerationContext): GeneratedThemeFile {
    const { theme, platform } = context;
    const cssVariables = ThemeConverters.toCSSVariables(theme);

    const content = `:root {
${Object.entries(cssVariables)
  .map(([property, value]) => `  ${property}: ${value};`)
  .join('\n')}
}

.dark {
  /* Dark theme overrides would be generated here */
}`;

    return {
      path: `${theme.id}.variables.css`,
      content,
      type: 'theme',
      platform
    };
  }

  /**
   * Generate utility classes
   */
  private static generateUtilities(context: ThemeGenerationContext): GeneratedThemeFile {
    const { theme, platform } = context;
    
    const content = `/* Utility classes for ${theme.name} */
/* Implementation would generate utility classes */`;
    
    return {
      path: `${theme.id}.utilities.css`,
      content,
      type: 'utilities',
      platform
    };
  }

  /**
   * Generate TypeScript types
   */
  private static generateTypes(context: ThemeGenerationContext): GeneratedThemeFile {
    const { theme, platform } = context;
    
    const content = `/**
 * TypeScript types for ${theme.name}
 */

export interface ThemeTokens {
  // Type definitions would be generated here
}`;
    
    return {
      path: `${theme.id}.types.ts`,
      content,
      type: 'types',
      platform
    };
  }

  /**
   * Check if platform supports CSS variables
   */
  private static supportsCSSVariables(platform: Platform): boolean {
    return !['react-native', 'expo'].includes(platform);
  }

  /**
   * Get file extension for platform
   */
  private static getFileExtension(platform: Platform): string {
    switch (platform) {
      case 'vue':
      case 'nuxt':
        return 'vue';
      case 'svelte':
      case 'sveltekit':
        return 'svelte';
      case 'angular':
        return 'component.ts';
      case 'vanilla':
        return 'js';
      default:
        return 'tsx';
    }
  }
}