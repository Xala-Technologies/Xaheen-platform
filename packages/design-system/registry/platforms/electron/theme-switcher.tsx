/**
 * Electron Theme Switcher
 * Theme switching component with OS integration
 */

import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { ElectronUtils, useDarkMode } from './electron-utils';

// =============================================================================
// THEME TYPES
// =============================================================================

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  readonly theme: Theme;
  readonly accentColor?: string;
  readonly fontSize?: 'small' | 'medium' | 'large';
  readonly reducedMotion?: boolean;
  readonly highContrast?: boolean;
}

// =============================================================================
// THEME SWITCHER COMPONENT
// =============================================================================

export interface ElectronThemeSwitcherProps {
  /**
   * Current theme
   */
  readonly theme?: Theme;
  
  /**
   * Theme change handler
   */
  readonly onThemeChange?: (theme: Theme) => void;
  
  /**
   * Show system option
   */
  readonly showSystem?: boolean;
  
  /**
   * Variant style
   */
  readonly variant?: 'icon' | 'toggle' | 'dropdown';
  
  /**
   * Size
   */
  readonly size?: 'sm' | 'md' | 'lg';
  
  /**
   * Additional CSS classes
   */
  readonly className?: string;
  
  /**
   * Sync with OS theme
   */
  readonly syncWithOS?: boolean;
}

// Theme Icons
const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SystemIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

export const ElectronThemeSwitcher: React.FC<ElectronThemeSwitcherProps> = ({
  theme: themeProp = 'system',
  onThemeChange,
  showSystem = true,
  variant = 'icon',
  size = 'md',
  className,
  syncWithOS = true
}) => {
  const utils = ElectronUtils.getInstance();
  const systemIsDark = useDarkMode();
  const [theme, setTheme] = useState<Theme>(themeProp);
  const [isOpen, setIsOpen] = useState(false);

  // Get effective theme (resolve 'system' to actual theme)
  const effectiveTheme = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    
    // Set color scheme for native elements
    root.style.colorScheme = effectiveTheme;
    
    // Notify Electron of theme change
    if (utils.isElectron()) {
      const api = (window as any).electronAPI;
      api?.setTheme?.(effectiveTheme);
    }
  }, [effectiveTheme, utils]);

  // Handle theme change
  const handleThemeChange = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    onThemeChange?.(newTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Close dropdown if open
    setIsOpen(false);
  }, [onThemeChange]);

  // Cycle through themes (for icon variant)
  const cycleTheme = useCallback(() => {
    const themes: Theme[] = showSystem ? ['light', 'dark', 'system'] : ['light', 'dark'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    handleThemeChange(themes[nextIndex]);
  }, [theme, showSystem, handleThemeChange]);

  // Size classes
  const sizeClasses = {
    sm: { icon: 'h-8 w-8', toggle: 'h-6', dropdown: 'h-8' },
    md: { icon: 'h-10 w-10', toggle: 'h-7', dropdown: 'h-10' },
    lg: { icon: 'h-12 w-12', toggle: 'h-8', dropdown: 'h-12' }
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  // Icon variant
  if (variant === 'icon') {
    return (
      <button
        onClick={cycleTheme}
        className={cn(
          'inline-flex items-center justify-center',
          'rounded-lg transition-all duration-200',
          'hover:bg-accent hover:text-accent-foreground',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
          sizeClasses[size].icon,
          className
        )}
        aria-label={`Switch theme (current: ${theme})`}
      >
        {theme === 'light' && <SunIcon className={iconSizeClasses[size]} />}
        {theme === 'dark' && <MoonIcon className={iconSizeClasses[size]} />}
        {theme === 'system' && <SystemIcon className={iconSizeClasses[size]} />}
      </button>
    );
  }

  // Toggle variant
  if (variant === 'toggle') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <SunIcon className={iconSizeClasses[size]} />
        <button
          onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
          className={cn(
            'relative inline-flex items-center',
            'rounded-full bg-gray-200 dark:bg-gray-700',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
            size === 'sm' && 'w-11 p-0.5',
            size === 'md' && 'w-14 p-1',
            size === 'lg' && 'w-16 p-1'
          )}
          role="switch"
          aria-checked={effectiveTheme === 'dark'}
          aria-label="Toggle dark mode"
        >
          <span
            className={cn(
              'block rounded-full bg-white shadow-md',
              'transition-transform duration-200',
              sizeClasses[size].toggle,
              sizeClasses[size].toggle,
              effectiveTheme === 'dark' && (
                size === 'sm' ? 'translate-x-5' :
                size === 'md' ? 'translate-x-7' :
                'translate-x-8'
              )
            )}
          />
        </button>
        <MoonIcon className={iconSizeClasses[size]} />
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'rounded-lg border-2 border-input bg-background px-3',
          'transition-all duration-200',
          'hover:bg-accent hover:text-accent-foreground',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
          sizeClasses[size].dropdown,
          isOpen && 'ring-2 ring-offset-2 ring-primary'
        )}
        aria-label="Select theme"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {theme === 'light' && (
          <>
            <SunIcon className={iconSizeClasses[size]} />
            <span className="text-sm font-medium">Light</span>
          </>
        )}
        {theme === 'dark' && (
          <>
            <MoonIcon className={iconSizeClasses[size]} />
            <span className="text-sm font-medium">Dark</span>
          </>
        )}
        {theme === 'system' && (
          <>
            <SystemIcon className={iconSizeClasses[size]} />
            <span className="text-sm font-medium">System</span>
          </>
        )}
        <svg
          className={cn(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 z-50 mt-2',
            'min-w-[150px] rounded-lg border bg-popover p-1',
            'shadow-lg animate-in fade-in-0 zoom-in-95'
          )}
          role="listbox"
          aria-label="Theme options"
        >
          <button
            onClick={() => handleThemeChange('light')}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2',
              'text-sm transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              theme === 'light' && 'bg-accent text-accent-foreground'
            )}
            role="option"
            aria-selected={theme === 'light'}
          >
            <SunIcon className="h-4 w-4" />
            <span>Light</span>
          </button>
          
          <button
            onClick={() => handleThemeChange('dark')}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2',
              'text-sm transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              theme === 'dark' && 'bg-accent text-accent-foreground'
            )}
            role="option"
            aria-selected={theme === 'dark'}
          >
            <MoonIcon className="h-4 w-4" />
            <span>Dark</span>
          </button>
          
          {showSystem && (
            <button
              onClick={() => handleThemeChange('system')}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2',
                'text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                theme === 'system' && 'bg-accent text-accent-foreground'
              )}
              role="option"
              aria-selected={theme === 'system'}
            >
              <SystemIcon className="h-4 w-4" />
              <span>System</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// THEME PROVIDER HOOK
// =============================================================================

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Load from localStorage or default to system
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'system';
  });

  const systemIsDark = useDarkMode();
  const effectiveTheme = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;

  const updateTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  return {
    theme,
    effectiveTheme,
    setTheme: updateTheme,
    systemIsDark
  };
}

// =============================================================================
// EXPORT
// =============================================================================

export default ElectronThemeSwitcher;