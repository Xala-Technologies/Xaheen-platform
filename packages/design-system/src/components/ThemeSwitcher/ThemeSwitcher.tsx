/**
 * Theme Switcher Component
 * Allows switching between industry themes and light/dark modes
 * WCAG AAA compliant with keyboard navigation
 */

import { useState, useEffect } from 'react';
import { themes, applyTheme } from '../../tokens/themes';
import type { ThemeName } from '../../tokens/themes';
import { cn } from '../../utils/cn';

interface ThemeSwitcherProps {
  readonly defaultTheme?: ThemeName;
  readonly defaultMode?: 'light' | 'dark';
  readonly onThemeChange?: (theme: ThemeName, mode: 'light' | 'dark') => void;
  readonly showLabels?: boolean;
  readonly compact?: boolean;
}

export const ThemeSwitcher = ({
  defaultTheme = 'enterprise',
  defaultMode = 'light',
  onThemeChange,
  showLabels = true,
  compact = false,
}: ThemeSwitcherProps): JSX.Element => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(defaultTheme);
  const [mode, setMode] = useState<'light' | 'dark'>(defaultMode);

  // Apply theme on mount and changes
  useEffect(() => {
    const theme = themes[selectedTheme];
    const cssVars = applyTheme(theme, mode);
    
    // Apply CSS variables to root
    const root = document.documentElement;
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Apply mode class
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    
    // Call callback
    onThemeChange?.(selectedTheme, mode);
  }, [selectedTheme, mode, onThemeChange]);

  const handleThemeChange = (theme: ThemeName) => {
    setSelectedTheme(theme);
  };

  const handleModeToggle = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const themeInfo = {
    education: { icon: '🎓', color: 'hsl(211, 100%, 50%)' },
    healthcare: { icon: '🏥', color: 'hsl(170, 60%, 50%)' },
    government: { icon: '🏛️', color: 'hsl(215, 60%, 50%)' },
    enterprise: { icon: '💼', color: 'hsl(220, 60%, 50%)' },
    ai: { icon: '🤖', color: 'hsl(250, 100%, 55%)' },
    private: { icon: '💎', color: 'hsl(30, 40%, 50%)' },
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <select
          value={selectedTheme}
          onChange={(e) => handleThemeChange(e.target.value as ThemeName)}
          className="h-10 px-3 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Select theme"
        >
          {Object.entries(themes).map(([key, theme]) => (
            <option key={key} value={key}>
              {themeInfo[key as ThemeName].icon} {theme.name}
            </option>
          ))}
        </select>
        
        <button
          onClick={handleModeToggle}
          className="h-10 w-10 rounded-lg border border-border bg-surface hover:bg-surface-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
        >
          {mode === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showLabels && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Industry Theme</h3>
          <p className="text-sm text-foreground-tertiary">
            Choose a theme optimized for your industry
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.entries(themes).map(([key, theme]) => {
          const info = themeInfo[key as ThemeName];
          const isSelected = selectedTheme === key;
          
          return (
            <button
              key={key}
              onClick={() => handleThemeChange(key as ThemeName)}
              className={cn(
                'relative p-4 rounded-xl border-2 transition-all duration-200',
                'hover:shadow-lg hover:-translate-y-0.5',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                isSelected
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                  : 'border-border hover:border-primary-300'
              )}
              aria-label={`Select ${theme.name} theme`}
              aria-pressed={isSelected}
            >
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="text-3xl mb-1"
                  style={{ 
                    filter: isSelected ? 'drop-shadow(0 0 8px currentColor)' : 'none',
                    color: info.color 
                  }}
                >
                  {info.icon}
                </div>
                <div className="text-center">
                  <div className="font-medium">{theme.name}</div>
                  <div className="text-xs text-foreground-tertiary mt-1">
                    {theme.industry}
                  </div>
                </div>
              </div>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500" />
              )}
            </button>
          );
        })}
      </div>
      
      <div className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg">
        <div>
          <div className="font-medium">Appearance</div>
          <div className="text-sm text-foreground-tertiary">
            {mode === 'light' ? 'Light mode' : 'Dark mode'}
          </div>
        </div>
        
        <button
          onClick={handleModeToggle}
          className={cn(
            'relative inline-flex h-8 w-14 items-center rounded-full',
            'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
            mode === 'dark' ? 'bg-primary-600' : 'bg-gray-300'
          )}
          role="switch"
          aria-checked={mode === 'dark'}
          aria-label="Toggle dark mode"
        >
          <span
            className={cn(
              'inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200',
              'shadow-md',
              mode === 'dark' ? 'translate-x-7' : 'translate-x-1'
            )}
          >
            <span className="flex items-center justify-center h-full text-xs">
              {mode === 'dark' ? '🌙' : '☀️'}
            </span>
          </span>
        </button>
      </div>
      
      {showLabels && (
        <div className="p-4 bg-surface-tertiary rounded-lg space-y-2">
          <h4 className="font-medium text-sm">Current Theme Details</h4>
          <dl className="text-xs space-y-1">
            <div className="flex justify-between">
              <dt className="text-foreground-tertiary">Theme:</dt>
              <dd className="font-medium">{themes[selectedTheme].name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground-tertiary">Industry:</dt>
              <dd className="font-medium capitalize">{themes[selectedTheme].industry}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground-tertiary">Mode:</dt>
              <dd className="font-medium capitalize">{mode}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground-tertiary">Font Scale:</dt>
              <dd className="font-medium capitalize">{themes[selectedTheme].typography.fontScale || 'default'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground-tertiary">Animations:</dt>
              <dd className="font-medium capitalize">{themes[selectedTheme].effects.animations || 'default'}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
};