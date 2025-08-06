/**
 * Storybook Theme Decorator
 * Responds to Storybook toolbar controls and applies full theme system
 */

import React, { useEffect } from 'react';
import type { Decorator } from '@storybook/react';
import { 
  themes,
  applyTheme,
  type ThemeName
} from '../registry/tokens/themes';
import type { ColorScheme } from '../registry/components/theme-selector/enhanced-theme-selector';

// Apply full theme system based on toolbar selections
const applyStorybookTheme = (industryTheme: ThemeName, colorScheme: ColorScheme) => {
  console.log('🎨 applyStorybookTheme called with:', { industryTheme, colorScheme });

  // Determine actual color mode
  const colorMode = colorScheme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : colorScheme === 'dark' ? 'dark' : 'light';

  console.log('🎨 Determined color mode:', colorMode);

  // Get theme configuration
  const themeConfig = themes[industryTheme];
  if (!themeConfig) {
    console.warn(`🚨 Theme ${industryTheme} not found in themes object. Available themes:`, Object.keys(themes));
    console.warn('Using enterprise fallback');
    return;
  }

  console.log('🎨 Theme config found:', {
    themeName: industryTheme,
    industry: themeConfig.industry,
    hasLightColors: !!themeConfig.colors.light,
    hasDarkColors: !!themeConfig.colors.dark
  });

  // Apply all CSS custom properties from the theme
  const cssVars = applyTheme(themeConfig, colorMode);
  console.log('🎨 Generated CSS vars:', {
    count: Object.keys(cssVars).length,
    sampleVars: Object.entries(cssVars).slice(0, 5)
  });

  Object.entries(cssVars).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
    console.log(`🎨 Set ${property}: ${value}`);
  });

  // Set theme attributes and classes
  document.documentElement.setAttribute('data-industry-theme', industryTheme);
  document.documentElement.setAttribute('data-theme-mode', colorMode);
  
  // Apply color scheme classes
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(colorMode);
  
  // Apply theme body class
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add(`theme-${industryTheme}`);

  // Final debug logging
  console.log(`✅ Applied theme: ${industryTheme} (${colorMode})`, {
    theme: industryTheme,
    colorMode,
    cssVarsApplied: Object.keys(cssVars).length,
    documentClasses: document.documentElement.classList.toString(),
    bodyClasses: document.body.classList.toString()
  });
};

// Storybook Decorator that responds to toolbar controls
export const withTheme: Decorator = (Story, context) => {
  // Get theme selections from Storybook toolbar globals
  const industryTheme = (context.globals.industryTheme as ThemeName) || 'enterprise';
  const colorScheme = (context.globals.colorScheme as ColorScheme) || 'light';

  // Debug logging to see what we're receiving
  console.log('🎨 Theme Decorator - Received globals:', {
    industryTheme,
    colorScheme,
    allGlobals: context.globals
  });

  // Apply theme when toolbar selection changes
  useEffect(() => {
    console.log('🎨 Applying theme from toolbar:', { industryTheme, colorScheme });
    applyStorybookTheme(industryTheme, colorScheme);
  }, [industryTheme, colorScheme]);

  // Apply initial theme on mount
  useEffect(() => {
    console.log('🎨 Initial theme application');
    applyStorybookTheme(industryTheme, colorScheme);
  }, []);

  // Also respond to system color scheme changes when in 'system' mode
  useEffect(() => {
    if (colorScheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        console.log('🎨 System color scheme changed');
        applyStorybookTheme(industryTheme, colorScheme);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [colorScheme, industryTheme]);

  return (
    <div 
      className="storybook-theme-wrapper"
      data-industry-theme={industryTheme}
      data-color-scheme={colorScheme}
    >
      {/* Debug theme indicator */}
      <div 
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          backgroundColor: 'var(--color-primary-600, #fallback)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          zIndex: 9999,
          fontFamily: 'monospace'
        }}
      >
        Theme: {industryTheme} | Mode: {colorScheme}
      </div>
      <Story />
    </div>
  );
};

// Theme Control for Storybook Controls (if needed for individual stories)
export const themeControl = {
  control: {
    type: 'select',
    options: Object.keys(themes)
  },
  description: 'Industry theme selector',
  table: {
    type: { summary: 'ThemeName' },
    defaultValue: { summary: 'enterprise' }
  }
};