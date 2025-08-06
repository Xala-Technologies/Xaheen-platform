/**
 * Theme System Tests
 * Comprehensive test suite for the universal theme system
 */

import { describe, test, expect } from 'vitest';
import { 
  LightTheme, 
  DarkTheme, 
  THEME_REGISTRY,
  ThemeUtils 
} from '../core/theme-system';
import { ThemeConverters } from '../core/theme-converters';
import { ThemeGenerator } from '../themes/theme-generator';

// =============================================================================
// THEME SYSTEM CORE TESTS
// =============================================================================

describe('Theme System Core', () => {
  test('should have valid light theme structure', () => {
    expect(LightTheme.id).toBe('light');
    expect(LightTheme.type).toBe('light');
    expect(LightTheme.tokens).toBeDefined();
    expect(LightTheme.tokens.colors).toBeDefined();
    expect(LightTheme.tokens.typography).toBeDefined();
    expect(LightTheme.tokens.spacing).toBeDefined();
  });

  test('should have valid dark theme structure', () => {
    expect(DarkTheme.id).toBe('dark');
    expect(DarkTheme.type).toBe('dark');
    expect(DarkTheme.tokens).toBeDefined();
    expect(DarkTheme.tokens.colors).toBeDefined();
    expect(DarkTheme.tokens.typography).toBeDefined();
    expect(DarkTheme.tokens.spacing).toBeDefined();
  });

  test('should have complete color scales', () => {
    const colorScales = [
      'primary', 'secondary', 'accent', 'neutral',
      'success', 'warning', 'error', 'info'
    ];

    colorScales.forEach(colorName => {
      const colorScale = LightTheme.tokens.colors[colorName];
      expect(colorScale).toBeDefined();
      
      // Test all shades exist
      const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
      shades.forEach(shade => {
        expect(colorScale[shade]).toBeDefined();
        expect(typeof colorScale[shade]).toBe('string');
        expect(colorScale[shade]).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  test('should have valid typography tokens', () => {
    const typography = LightTheme.tokens.typography;
    
    // Font families
    expect(Array.isArray(typography.fontFamily.sans)).toBe(true);
    expect(Array.isArray(typography.fontFamily.serif)).toBe(true);
    expect(Array.isArray(typography.fontFamily.mono)).toBe(true);
    expect(Array.isArray(typography.fontFamily.display)).toBe(true);

    // Font sizes
    const fontSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];
    fontSizes.forEach(size => {
      expect(typography.fontSize[size]).toBeDefined();
      expect(typography.fontSize[size]).toMatch(/^\d+(\.\d+)?rem$/);
    });

    // Font weights
    const fontWeights = ['thin', 'light', 'normal', 'medium', 'semibold', 'bold'];
    fontWeights.forEach(weight => {
      expect(typography.fontWeight[weight]).toBeDefined();
      expect(typeof typography.fontWeight[weight]).toBe('number');
    });
  });

  test('should have consistent spacing scale', () => {
    const spacing = LightTheme.tokens.spacing;
    
    // Test key spacing values
    expect(spacing[0]).toBe('0px');
    expect(spacing[1]).toBe('0.25rem');
    expect(spacing[2]).toBe('0.5rem');
    expect(spacing[4]).toBe('1rem');
    expect(spacing[8]).toBe('2rem');
    expect(spacing[16]).toBe('4rem');

    // Test all spacing values are strings
    Object.values(spacing).forEach(value => {
      expect(typeof value).toBe('string');
    });
  });

  test('should have valid shadow tokens', () => {
    const shadows = LightTheme.tokens.shadows;
    
    const shadowSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'inner', 'none'];
    shadowSizes.forEach(size => {
      expect(shadows[size]).toBeDefined();
      expect(typeof shadows[size]).toBe('string');
    });
  });

  test('should register themes correctly', () => {
    expect(THEME_REGISTRY.light).toBe(LightTheme);
    expect(THEME_REGISTRY.dark).toBe(DarkTheme);
  });
});

// =============================================================================
// THEME CONVERTERS TESTS  
// =============================================================================

describe('Theme Converters', () => {
  test('should convert to Tailwind format', () => {
    const tailwindTheme = ThemeConverters.toTailwind(LightTheme);
    
    expect(tailwindTheme.colors).toBeDefined();
    expect(tailwindTheme.fontFamily).toBeDefined();
    expect(tailwindTheme.fontSize).toBeDefined();
    expect(tailwindTheme.spacing).toBeDefined();
    expect(tailwindTheme.screens).toBeDefined();

    // Test color structure
    expect(tailwindTheme.colors.primary).toBeDefined();
    expect(tailwindTheme.colors.background).toBe('hsl(var(--background))');

    // Test font sizes have line heights
    Object.values(tailwindTheme.fontSize).forEach(([fontSize, lineHeight]) => {
      expect(typeof fontSize).toBe('string');
      expect(typeof lineHeight).toBe('string');
    });
  });

  test('should convert to React Native format', () => {
    const nativeTheme = ThemeConverters.toReactNative(LightTheme);
    
    expect(nativeTheme.colors).toBeDefined();
    expect(nativeTheme.spacing).toBeDefined(); 
    expect(nativeTheme.typography).toBeDefined();
    expect(nativeTheme.shadows).toBeDefined();

    // Test spacing is in numbers (pixels)
    Object.values(nativeTheme.spacing).forEach(value => {
      expect(typeof value).toBe('number');
    });

    // Test typography fontSize is in numbers
    Object.values(nativeTheme.typography.fontSize).forEach(value => {
      expect(typeof value).toBe('number');
    });
  });

  test('should convert to CSS variables', () => {
    const cssVariables = ThemeConverters.toCSSVariables(LightTheme);
    
    // Test essential variables exist
    expect(cssVariables['--background']).toBeDefined();
    expect(cssVariables['--foreground']).toBeDefined();
    expect(cssVariables['--primary']).toBeDefined();
    expect(cssVariables['--border']).toBeDefined();

    // Test variable format
    Object.entries(cssVariables).forEach(([property, value]) => {
      expect(property.startsWith('--')).toBe(true);
      expect(typeof value).toBe('string');
    });
  });

  test('should convert to Styled Components format', () => {
    const styledTheme = ThemeConverters.toStyledComponents(LightTheme);
    
    expect(styledTheme.colors).toBeDefined();
    expect(styledTheme.typography).toBeDefined();
    expect(styledTheme.spacing).toBeDefined();
    expect(styledTheme.shadows).toBeDefined();
    expect(Array.isArray(styledTheme.breakpoints)).toBe(true);
  });

  test('should convert to Ionic format', () => {
    const ionicVariables = ThemeConverters.toIonic(LightTheme);
    
    // Test Ionic color variables
    expect(ionicVariables['--ion-color-primary']).toBeDefined();
    expect(ionicVariables['--ion-color-secondary']).toBeDefined();
    expect(ionicVariables['--ion-color-success']).toBeDefined();
    expect(ionicVariables['--ion-color-danger']).toBeDefined();

    // Test RGB variants exist
    expect(ionicVariables['--ion-color-primary-rgb']).toBeDefined();
    expect(ionicVariables['--ion-color-primary-contrast']).toBeDefined();
  });
});

// =============================================================================
// THEME UTILITIES TESTS
// =============================================================================

describe('Theme Utilities', () => {
  test('should get theme by ID', () => {
    const lightTheme = ThemeUtils.getTheme('light');
    expect(lightTheme).toBe(LightTheme);

    const darkTheme = ThemeUtils.getTheme('dark');
    expect(darkTheme).toBe(DarkTheme);
  });

  test('should get available themes', () => {
    const themes = ThemeUtils.getAvailableThemes();
    expect(themes).toContain(LightTheme);
    expect(themes).toContain(DarkTheme);
    expect(themes.length).toBe(2);
  });

  test('should validate theme structure', () => {
    const isLightValid = ThemeUtils.validateTheme(LightTheme);
    expect(isLightValid).toBe(true);

    const isDarkValid = ThemeUtils.validateTheme(DarkTheme);  
    expect(isDarkValid).toBe(true);
  });

  test('should check accessibility compliance', () => {
    expect(LightTheme.accessibility.contrastRatio).toBe('AAA');
    expect(LightTheme.accessibility.colorBlindSupport).toBe(true);
    expect(LightTheme.accessibility.reducedMotion).toBe(true);
  });
});

// =============================================================================
// THEME GENERATOR TESTS
// =============================================================================

describe('Theme Generator', () => {
  test('should generate React theme files', () => {
    const files = ThemeGenerator.generateThemeForPlatform(
      LightTheme,
      'react',
      {
        includeProvider: true,
        includeCSSVariables: true,
        generateTypes: true
      }
    );

    expect(files.length).toBeGreaterThan(0);
    
    const themeFile = files.find(f => f.type === 'theme');
    expect(themeFile).toBeDefined();
    expect(themeFile?.platform).toBe('react');
    expect(themeFile?.content).toContain('tailwindTheme');
    expect(themeFile?.content).toContain('styledComponentsTheme');
  });

  test('should generate Vue theme files', () => {
    const files = ThemeGenerator.generateThemeForPlatform(
      LightTheme,
      'vue',
      { includeCSSVariables: true }
    );

    const themeFile = files.find(f => f.type === 'theme');
    expect(themeFile).toBeDefined();
    expect(themeFile?.platform).toBe('vue');
    expect(themeFile?.content).toContain('cssVariables');
    expect(themeFile?.content).toContain('useThemeTokens');
  });

  test('should generate React Native theme files', () => {
    const files = ThemeGenerator.generateThemeForPlatform(
      LightTheme,
      'react-native'
    );

    const themeFile = files.find(f => f.type === 'theme');
    expect(themeFile).toBeDefined();
    expect(themeFile?.platform).toBe('react-native');
    expect(themeFile?.content).toContain('nativeTheme');
    expect(themeFile?.content).toContain('StyleSheet');
  });

  test('should generate Ionic theme files', () => {
    const files = ThemeGenerator.generateThemeForPlatform(
      LightTheme,
      'ionic'
    );

    const themeFile = files.find(f => f.type === 'theme');
    expect(themeFile).toBeDefined();
    expect(themeFile?.platform).toBe('ionic');
    expect(themeFile?.content).toContain('ionicVariables');
    expect(themeFile?.content).toContain('--ion-color');
  });

  test('should generate Vanilla JS theme files', () => {
    const files = ThemeGenerator.generateThemeForPlatform(
      LightTheme,
      'vanilla'
    );

    const themeFile = files.find(f => f.type === 'theme');
    expect(themeFile).toBeDefined();
    expect(themeFile?.platform).toBe('vanilla');
    expect(themeFile?.content).toContain('ThemeManager');
    expect(themeFile?.content).toContain('themeCSS');
  });

  test('should handle unsupported platforms', () => {
    expect(() => {
      // @ts-expect-error - Testing error case
      ThemeGenerator.generateThemeForPlatform(LightTheme, 'unsupported');
    }).toThrow('Unsupported platform: unsupported');
  });
});

// =============================================================================
// THEME ACCESSIBILITY TESTS
// =============================================================================

describe('Theme Accessibility', () => {
  test('should have WCAG AAA compliant contrast ratios', () => {
    // Test text on background combinations
    const lightSurface = LightTheme.tokens.colors.surface;
    const lightText = LightTheme.tokens.colors.text;
    
    expect(LightTheme.accessibility.contrastRatio).toBe('AAA');
    
    // Primary text on background should have high contrast
    expect(lightText.primary).toBe('#09090b'); // Very dark on white
    expect(lightSurface.background).toBe('#ffffff'); // White background
  });

  test('should support color blind users', () => {
    expect(LightTheme.accessibility.colorBlindSupport).toBe(true);
    expect(DarkTheme.accessibility.colorBlindSupport).toBe(true);
  });

  test('should support reduced motion preferences', () => {
    expect(LightTheme.accessibility.reducedMotion).toBe(true);
    expect(DarkTheme.accessibility.reducedMotion).toBe(true);
    
    // Motion tokens should include instant duration
    expect(LightTheme.tokens.motion.duration.instant).toBe('0ms');
  });

  test('should have high contrast support', () => {
    expect(LightTheme.accessibility.highContrast).toBe(true);
    expect(DarkTheme.accessibility.highContrast).toBe(true);
  });
});

// =============================================================================
// THEME CONSISTENCY TESTS
// =============================================================================

describe('Theme Consistency', () => {
  test('should have consistent token structure between themes', () => {
    const lightKeys = Object.keys(LightTheme.tokens);
    const darkKeys = Object.keys(DarkTheme.tokens);
    
    expect(lightKeys).toEqual(darkKeys);
    
    // Test color structure consistency
    const lightColorKeys = Object.keys(LightTheme.tokens.colors);
    const darkColorKeys = Object.keys(DarkTheme.tokens.colors);
    
    expect(lightColorKeys).toEqual(darkColorKeys);
  });

  test('should have matching color scale structure', () => {
    const colorScales = ['primary', 'secondary', 'accent', 'neutral'];
    
    colorScales.forEach(scale => {
      const lightShades = Object.keys(LightTheme.tokens.colors[scale]);
      const darkShades = Object.keys(DarkTheme.tokens.colors[scale]);
      
      expect(lightShades).toEqual(darkShades);
    });
  });

  test('should have identical non-color tokens', () => {
    // Typography should be identical
    expect(LightTheme.tokens.typography).toEqual(DarkTheme.tokens.typography);
    
    // Spacing should be identical
    expect(LightTheme.tokens.spacing).toEqual(DarkTheme.tokens.spacing);
    
    // Shadows should be identical
    expect(LightTheme.tokens.shadows).toEqual(DarkTheme.tokens.shadows);
    
    // Motion should be identical
    expect(LightTheme.tokens.motion).toEqual(DarkTheme.tokens.motion);
    
    // Breakpoints should be identical
    expect(LightTheme.tokens.breakpoints).toEqual(DarkTheme.tokens.breakpoints);
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('Theme Integration', () => {
  test('should work with all supported platforms', () => {
    const supportedPlatforms = [
      'react', 'vue', 'angular', 'svelte', 
      'react-native', 'ionic', 'vanilla'
    ];

    supportedPlatforms.forEach(platform => {
      expect(() => {
        ThemeGenerator.generateThemeForPlatform(LightTheme, platform as any);
      }).not.toThrow();
    });
  });

  test('should generate valid CSS variables', () => {
    const cssVariables = ThemeConverters.toCSSVariables(LightTheme);
    
    // Test CSS syntax validity
    Object.entries(cssVariables).forEach(([property, value]) => {
      expect(property.startsWith('--')).toBe(true);
      expect(property).toMatch(/^--[a-z0-9-]+$/);
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });
  });

  test('should maintain platform feature support', () => {
    const platforms = LightTheme.platforms;
    
    expect(platforms.react.cssVariables).toBe(true);
    expect(platforms.react.tailwindConfig.darkMode).toBe('class');
    
    expect(platforms.vue.cssVariables).toBe(true);
    expect(platforms.vue.composables.useTheme).toBe(true);
    
    expect(platforms['react-native'].styleSheet).toBe(true);
    expect(platforms['react-native'].asyncStorage).toBe(true);
    
    expect(platforms.ionic.ionicVariables).toBe(true);
    expect(platforms.ionic.platformSpecific).toBe(true);
  });
});