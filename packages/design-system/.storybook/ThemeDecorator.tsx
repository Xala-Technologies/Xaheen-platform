/**
 * Storybook Theme Decorator
 * Global theme selector for all stories
 */

import React, { useEffect } from 'react';
import type { Decorator } from '@storybook/react';
import { 
  EnhancedThemeSelector,
  EnhancedIndustryTheme,
  ColorScheme,
  ENHANCED_INDUSTRY_THEMES 
} from '../registry/components/theme-selector/enhanced-theme-selector';

// Global theme state management for Storybook
let globalIndustryTheme: EnhancedIndustryTheme = 'enterprise';
let globalColorScheme: ColorScheme = 'system';
let globalIndustryThemeCallbacks: Array<(theme: EnhancedIndustryTheme) => void> = [];
let globalColorSchemeCallbacks: Array<(scheme: ColorScheme) => void> = [];

const useGlobalTheme = () => {
  const [currentIndustryTheme, setCurrentIndustryTheme] = React.useState(globalIndustryTheme);
  const [currentColorScheme, setCurrentColorScheme] = React.useState(globalColorScheme);

  const setGlobalIndustryTheme = React.useCallback((theme: EnhancedIndustryTheme) => {
    globalIndustryTheme = theme;
    setCurrentIndustryTheme(theme);
    
    // Apply theme to document
    const themeInfo = ENHANCED_INDUSTRY_THEMES[theme];
    document.documentElement.style.setProperty('--theme-primary', themeInfo.primaryColor);
    document.documentElement.setAttribute('data-industry-theme', theme);
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);
    
    // Notify all instances
    globalIndustryThemeCallbacks.forEach(callback => callback(theme));
  }, []);

  const setGlobalColorScheme = React.useCallback((scheme: ColorScheme) => {
    globalColorScheme = scheme;
    setCurrentColorScheme(scheme);
    
    // Apply color scheme to document
    document.documentElement.classList.remove('light', 'dark');
    if (scheme !== 'system') {
      document.documentElement.classList.add(scheme);
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(isDark ? 'dark' : 'light');
    }
    
    // Notify all instances
    globalColorSchemeCallbacks.forEach(callback => callback(scheme));
  }, []);

  useEffect(() => {
    globalIndustryThemeCallbacks.push(setCurrentIndustryTheme);
    globalColorSchemeCallbacks.push(setCurrentColorScheme);
    return () => {
      globalIndustryThemeCallbacks = globalIndustryThemeCallbacks.filter(callback => callback !== setCurrentIndustryTheme);
      globalColorSchemeCallbacks = globalColorSchemeCallbacks.filter(callback => callback !== setCurrentColorScheme);
    };
  }, []);

  return { currentIndustryTheme, currentColorScheme, setGlobalIndustryTheme, setGlobalColorScheme };
};

// Theme Toolbar Component
export const ThemeToolbar: React.FC = () => {
  const { currentIndustryTheme, currentColorScheme, setGlobalIndustryTheme, setGlobalColorScheme } = useGlobalTheme();

  return (
    <div className="fixed top-4 right-4 z-50">
      <EnhancedThemeSelector
        currentIndustryTheme={currentIndustryTheme}
        currentColorScheme={currentColorScheme}
        onIndustryThemeChange={setGlobalIndustryTheme}
        onColorSchemeChange={setGlobalColorScheme}
        variant="compact"
        norwegianLabels={true}
      />
    </div>
  );
};

// Storybook Decorator
export const withTheme: Decorator = (Story, context) => {
  const { currentIndustryTheme, currentColorScheme } = useGlobalTheme();

  // Apply themes on story change
  useEffect(() => {
    const themeInfo = ENHANCED_INDUSTRY_THEMES[currentIndustryTheme];
    document.documentElement.style.setProperty('--theme-primary', themeInfo.primaryColor);
    document.documentElement.setAttribute('data-industry-theme', currentIndustryTheme);
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${currentIndustryTheme}`);
  }, [currentIndustryTheme]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    if (currentColorScheme !== 'system') {
      document.documentElement.classList.add(currentColorScheme);
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(isDark ? 'dark' : 'light');
    }
  }, [currentColorScheme]);

  return (
    <div className="relative">
      <Story />
      <ThemeToolbar />
    </div>
  );
};

// Theme Control for Storybook Controls
export const themeControl = {
  control: {
    type: 'select',
    options: Object.keys(ENHANCED_INDUSTRY_THEMES)
  },
  description: 'Industry theme selector',
  table: {
    type: { summary: 'EnhancedIndustryTheme' },
    defaultValue: { summary: 'enterprise' }
  }
};