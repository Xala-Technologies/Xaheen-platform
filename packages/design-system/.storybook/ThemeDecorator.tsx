/**
 * Storybook Theme Decorator
 * Global theme selector for all stories
 */

import React, { useEffect } from 'react';
import type { Decorator } from '@storybook/react';
import { 
  ThemeSelector, 
  ThemeSelectorIndustry, 
  useThemeSelector,
  INDUSTRY_THEMES 
} from '../registry/components/theme-selector/theme-selector';

// Global theme state management for Storybook
let globalTheme: ThemeSelectorIndustry = 'enterprise';
let globalThemeCallbacks: Array<(theme: ThemeSelectorIndustry) => void> = [];

const useGlobalTheme = () => {
  const [currentTheme, setCurrentTheme] = React.useState(globalTheme);

  const setGlobalTheme = React.useCallback((theme: ThemeSelectorIndustry) => {
    globalTheme = theme;
    setCurrentTheme(theme);
    
    // Apply theme to document
    const themeInfo = INDUSTRY_THEMES[theme];
    document.documentElement.style.setProperty('--theme-primary', themeInfo.primaryColor);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-industry-theme', theme);
    
    // Update body class for theme-specific styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);
    
    // Notify all instances
    globalThemeCallbacks.forEach(callback => callback(theme));
  }, []);

  useEffect(() => {
    globalThemeCallbacks.push(setCurrentTheme);
    return () => {
      globalThemeCallbacks = globalThemeCallbacks.filter(callback => callback !== setCurrentTheme);
    };
  }, []);

  return { currentTheme, setGlobalTheme };
};

// Theme Toolbar Component
export const ThemeToolbar: React.FC = () => {
  const { currentTheme, setGlobalTheme } = useGlobalTheme();

  return (
    <div className="fixed top-4 right-4 z-50">
      <ThemeSelector
        currentTheme={currentTheme}
        onThemeChange={setGlobalTheme}
        variant="dropdown"
        size="sm"
        showDescription={false}
        norwegianLabels={true}
      />
    </div>
  );
};

// Storybook Decorator
export const withTheme: Decorator = (Story, context) => {
  const { currentTheme } = useGlobalTheme();

  // Apply theme on story change
  useEffect(() => {
    const themeInfo = INDUSTRY_THEMES[currentTheme];
    document.documentElement.style.setProperty('--theme-primary', themeInfo.primaryColor);
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.setAttribute('data-industry-theme', currentTheme);
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${currentTheme}`);
  }, [currentTheme]);

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
    options: Object.keys(INDUSTRY_THEMES)
  },
  description: 'Industry theme selector',
  table: {
    type: { summary: 'ThemeSelectorIndustry' },
    defaultValue: { summary: 'enterprise' }
  }
};