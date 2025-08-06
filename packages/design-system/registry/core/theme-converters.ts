/**
 * Theme Converters
 * Convert universal theme tokens to platform-specific formats
 */

import { UniversalTheme, ThemeTokens, ColorTokens } from './theme-system';

// =============================================================================
// PLATFORM-SPECIFIC THEME FORMATS
// =============================================================================

export interface TailwindTheme {
  colors: Record<string, any>;
  fontFamily: Record<string, string[]>;
  fontSize: Record<string, [string, string]>;
  fontWeight: Record<string, number>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  boxShadow: Record<string, string>;
  screens: Record<string, string>;
}

export interface ReactNativeTheme {
  colors: Record<string, string>;
  spacing: Record<string, number>;
  typography: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, number>;
    fontWeight: Record<string, string>;
  };
  shadows: Record<string, any>;
}

export interface CSSVariables {
  [key: string]: string;
}

export interface StyledComponentsTheme {
  colors: Record<string, any>;
  typography: Record<string, any>;
  spacing: Record<string, string>;
  shadows: Record<string, string>;
  breakpoints: string[];
}

export interface IonicCSSVariables {
  [key: string]: string;
}

// =============================================================================
// CONVERTER CLASSES
// =============================================================================

export class ThemeConverters {
  /**
   * Convert to Tailwind CSS theme configuration
   */
  static toTailwind(theme: UniversalTheme): TailwindTheme {
    const tokens = theme.tokens;
    
    return {
      colors: {
        // Primary semantic colors
        primary: this.colorScaleToCSSVariables(tokens.colors.primary, 'primary'),
        secondary: this.colorScaleToCSSVariables(tokens.colors.secondary, 'secondary'),
        accent: this.colorScaleToCSSVariables(tokens.colors.accent, 'accent'),
        neutral: this.colorScaleToCSSVariables(tokens.colors.neutral, 'neutral'),
        
        // Feedback colors
        success: this.colorScaleToCSSVariables(tokens.colors.success, 'success'),
        warning: this.colorScaleToCSSVariables(tokens.colors.warning, 'warning'),
        error: this.colorScaleToCSSVariables(tokens.colors.error, 'error'),
        destructive: this.colorScaleToCSSVariables(tokens.colors.error, 'destructive'),
        info: this.colorScaleToCSSVariables(tokens.colors.info, 'info'),
        
        // Surface colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        
        // Border and input colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))'
      },
      
      fontFamily: {
        sans: tokens.typography.fontFamily.sans,
        serif: tokens.typography.fontFamily.serif,
        mono: tokens.typography.fontFamily.mono,
        display: tokens.typography.fontFamily.display
      },
      
      fontSize: Object.entries(tokens.typography.fontSize).reduce(
        (acc, [key, value]) => {
          const lineHeight = this.calculateLineHeight(value);
          acc[key] = [value, lineHeight];
          return acc;
        },
        {} as Record<string, [string, string]>
      ),
      
      fontWeight: tokens.typography.fontWeight,
      
      spacing: tokens.spacing,
      
      borderRadius: tokens.borders.radius,
      
      boxShadow: tokens.shadows,
      
      screens: tokens.breakpoints
    };
  }
  
  /**
   * Convert to React Native theme
   */
  static toReactNative(theme: UniversalTheme): ReactNativeTheme {
    const tokens = theme.tokens;
    
    return {
      colors: {
        // Flatten color scales for React Native
        ...this.flattenColorScale(tokens.colors.primary, 'primary'),
        ...this.flattenColorScale(tokens.colors.secondary, 'secondary'),
        ...this.flattenColorScale(tokens.colors.accent, 'accent'),
        ...this.flattenColorScale(tokens.colors.success, 'success'),
        ...this.flattenColorScale(tokens.colors.warning, 'warning'),
        ...this.flattenColorScale(tokens.colors.error, 'error'),
        
        // Surface colors
        background: tokens.colors.surface.background,
        foreground: tokens.colors.surface.foreground,
        card: tokens.colors.surface.card,
        muted: tokens.colors.surface.muted,
        
        // Text colors
        text: tokens.colors.text.primary,
        textSecondary: tokens.colors.text.secondary,
        textMuted: tokens.colors.text.muted,
        
        // Border colors
        border: tokens.colors.border.default,
        borderMuted: tokens.colors.border.muted
      },
      
      spacing: Object.entries(tokens.spacing).reduce(
        (acc, [key, value]) => {
          acc[key] = parseFloat(value.replace('rem', '')) * 16; // Convert rem to px
          return acc;
        },
        {} as Record<string, number>
      ),
      
      typography: {
        fontFamily: Object.entries(tokens.typography.fontFamily).reduce(
          (acc, [key, value]) => {
            acc[key] = value[0]; // Use first font in stack
            return acc;
          },
          {} as Record<string, string>
        ),
        fontSize: Object.entries(tokens.typography.fontSize).reduce(
          (acc, [key, value]) => {
            acc[key] = parseFloat(value.replace('rem', '')) * 16;
            return acc;
          },
          {} as Record<string, number>
        ),
        fontWeight: Object.entries(tokens.typography.fontWeight).reduce(
          (acc, [key, value]) => {
            acc[key] = value.toString();
            return acc;
          },
          {} as Record<string, string>
        )
      },
      
      shadows: this.convertShadowsToReactNative(tokens.shadows)
    };
  }
  
  /**
   * Convert to CSS Variables
   */
  static toCSSVariables(theme: UniversalTheme): CSSVariables {
    const tokens = theme.tokens;
    const variables: CSSVariables = {};
    
    // Color variables
    Object.entries(tokens.colors.primary).forEach(([shade, color]) => {
      variables[`--color-primary-${shade}`] = this.colorToHSL(color);
    });
    
    Object.entries(tokens.colors.secondary).forEach(([shade, color]) => {
      variables[`--color-secondary-${shade}`] = this.colorToHSL(color);
    });
    
    Object.entries(tokens.colors.accent).forEach(([shade, color]) => {
      variables[`--color-accent-${shade}`] = this.colorToHSL(color);
    });
    
    // Surface color variables
    variables['--background'] = this.colorToHSL(tokens.colors.surface.background);
    variables['--foreground'] = this.colorToHSL(tokens.colors.surface.foreground);
    variables['--card'] = this.colorToHSL(tokens.colors.surface.card);
    variables['--card-foreground'] = this.colorToHSL(tokens.colors.surface.cardForeground);
    variables['--popover'] = this.colorToHSL(tokens.colors.surface.popover);
    variables['--popover-foreground'] = this.colorToHSL(tokens.colors.surface.popoverForeground);
    variables['--muted'] = this.colorToHSL(tokens.colors.surface.muted);
    variables['--muted-foreground'] = this.colorToHSL(tokens.colors.surface.mutedForeground);
    
    // Border variables
    variables['--border'] = this.colorToHSL(tokens.colors.border.default);
    variables['--input'] = this.colorToHSL(tokens.colors.border.default);
    variables['--ring'] = this.colorToHSL(tokens.colors.border.focus);
    
    // Typography variables
    variables['--font-sans'] = tokens.typography.fontFamily.sans.join(', ');
    variables['--font-serif'] = tokens.typography.fontFamily.serif.join(', ');
    variables['--font-mono'] = tokens.typography.fontFamily.mono.join(', ');
    
    // Spacing variables
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      variables[`--spacing-${key}`] = value;
    });
    
    // Border radius variables
    Object.entries(tokens.borders.radius).forEach(([key, value]) => {
      variables[`--radius-${key}`] = value;
    });
    
    return variables;
  }
  
  /**
   * Convert to Styled Components theme
   */
  static toStyledComponents(theme: UniversalTheme): StyledComponentsTheme {
    const tokens = theme.tokens;
    
    return {
      colors: {
        primary: tokens.colors.primary,
        secondary: tokens.colors.secondary,
        accent: tokens.colors.accent,
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        error: tokens.colors.error,
        surface: tokens.colors.surface,
        text: tokens.colors.text,
        border: tokens.colors.border
      },
      
      typography: {
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.fontSize,
        fontWeight: tokens.typography.fontWeight,
        lineHeight: tokens.typography.lineHeight
      },
      
      spacing: tokens.spacing,
      
      shadows: tokens.shadows,
      
      breakpoints: Object.values(tokens.breakpoints)
    };
  }
  
  /**
   * Convert to Ionic CSS Variables
   */
  static toIonic(theme: UniversalTheme): IonicCSSVariables {
    const tokens = theme.tokens;
    const variables: IonicCSSVariables = {};
    
    // Ionic color variables
    variables['--ion-color-primary'] = tokens.colors.primary[500];
    variables['--ion-color-primary-rgb'] = this.hexToRGB(tokens.colors.primary[500]);
    variables['--ion-color-primary-contrast'] = '#ffffff';
    variables['--ion-color-primary-contrast-rgb'] = '255,255,255';
    variables['--ion-color-primary-shade'] = tokens.colors.primary[600];
    variables['--ion-color-primary-tint'] = tokens.colors.primary[400];
    
    variables['--ion-color-secondary'] = tokens.colors.secondary[500];
    variables['--ion-color-secondary-rgb'] = this.hexToRGB(tokens.colors.secondary[500]);
    variables['--ion-color-secondary-contrast'] = '#ffffff';
    variables['--ion-color-secondary-contrast-rgb'] = '255,255,255';
    variables['--ion-color-secondary-shade'] = tokens.colors.secondary[600];
    variables['--ion-color-secondary-tint'] = tokens.colors.secondary[400];
    
    variables['--ion-color-success'] = tokens.colors.success[500];
    variables['--ion-color-success-rgb'] = this.hexToRGB(tokens.colors.success[500]);
    variables['--ion-color-success-contrast'] = '#ffffff';
    variables['--ion-color-success-contrast-rgb'] = '255,255,255';
    variables['--ion-color-success-shade'] = tokens.colors.success[600];
    variables['--ion-color-success-tint'] = tokens.colors.success[400];
    
    variables['--ion-color-warning'] = tokens.colors.warning[500];
    variables['--ion-color-warning-rgb'] = this.hexToRGB(tokens.colors.warning[500]);
    variables['--ion-color-warning-contrast'] = '#000000';
    variables['--ion-color-warning-contrast-rgb'] = '0,0,0';
    variables['--ion-color-warning-shade'] = tokens.colors.warning[600];
    variables['--ion-color-warning-tint'] = tokens.colors.warning[400];
    
    variables['--ion-color-danger'] = tokens.colors.error[500];
    variables['--ion-color-danger-rgb'] = this.hexToRGB(tokens.colors.error[500]);
    variables['--ion-color-danger-contrast'] = '#ffffff';
    variables['--ion-color-danger-contrast-rgb'] = '255,255,255';
    variables['--ion-color-danger-shade'] = tokens.colors.error[600];
    variables['--ion-color-danger-tint'] = tokens.colors.error[400];
    
    // Background variables
    variables['--ion-background-color'] = tokens.colors.surface.background;
    variables['--ion-background-color-rgb'] = this.hexToRGB(tokens.colors.surface.background);
    variables['--ion-text-color'] = tokens.colors.text.primary;
    variables['--ion-text-color-rgb'] = this.hexToRGB(tokens.colors.text.primary);
    
    // Item variables
    variables['--ion-item-background'] = tokens.colors.surface.card;
    variables['--ion-item-border-color'] = tokens.colors.border.default;
    
    // Toolbar variables
    variables['--ion-toolbar-background'] = tokens.colors.surface.card;
    variables['--ion-toolbar-color'] = tokens.colors.text.primary;
    variables['--ion-toolbar-border-color'] = tokens.colors.border.default;
    
    return variables;
  }
  
  // =============================================================================
  // UTILITY METHODS
  // =============================================================================
  
  private static colorScaleToCSSVariables(
    colorScale: any, 
    name: string
  ): Record<string, string> {
    const result: Record<string, string> = {};
    
    Object.entries(colorScale).forEach(([shade, color]) => {
      result[shade] = `hsl(var(--color-${name}-${shade}))`;
    });
    
    return result;
  }
  
  private static flattenColorScale(
    colorScale: any, 
    prefix: string
  ): Record<string, string> {
    const result: Record<string, string> = {};
    
    Object.entries(colorScale).forEach(([shade, color]) => {
      result[`${prefix}${shade}`] = color as string;
    });
    
    return result;
  }
  
  private static calculateLineHeight(fontSize: string): string {
    const size = parseFloat(fontSize.replace('rem', ''));
    
    if (size <= 0.875) return '1.25rem'; // Small text
    if (size <= 1.125) return '1.5rem';  // Base text
    if (size <= 1.875) return '2rem';    // Large text
    return '1.2';                        // Display text
  }
  
  private static convertShadowsToReactNative(shadows: any): Record<string, any> {
    const result: Record<string, any> = {};
    
    Object.entries(shadows).forEach(([key, shadow]) => {
      if (key === 'none' || key === 'inner') {
        result[key] = {};
        return;
      }
      
      // Parse CSS shadow to React Native shadow
      // This is a simplified conversion - real implementation would need more parsing
      const shadowStr = shadow as string;
      const parts = shadowStr.split(' ');
      
      result[key] = {
        shadowColor: '#000',
        shadowOffset: {
          width: parseInt(parts[0]) || 0,
          height: parseInt(parts[1]) || 0
        },
        shadowOpacity: 0.1,
        shadowRadius: parseInt(parts[2]) || 0,
        elevation: key === 'xs' ? 1 : key === 'sm' ? 2 : key === 'md' ? 4 : key === 'lg' ? 8 : 16
      };
    });
    
    return result;
  }
  
  private static colorToHSL(color: string): string {
    // Convert hex to HSL - simplified implementation
    // Real implementation would need full color conversion
    if (color.startsWith('#')) {
      // For now, return a placeholder HSL value
      // In real implementation, convert hex to HSL
      return '0 0% 0%'; // Placeholder
    }
    
    return color;
  }
  
  private static hexToRGB(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    return `${r},${g},${b}`;
  }
}