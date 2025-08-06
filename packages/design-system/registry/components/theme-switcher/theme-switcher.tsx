/**
 * Theme Switcher Component - System theme detection and switching
 * WCAG AAA: Proper focus management and keyboard navigation
 * Norwegian language support with localized labels
 */

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/button';
import { cn } from '@/utils/cn';

// Icon components (replace with your icon library)
const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 13a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm7-5a1 1 0 110 2h-1a1 1 0 110-2h1zM4 10a1 1 0 110 2H3a1 1 0 110-2h1zm11.536-5.536a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm-12.02 9.9a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm12.02 1.414a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM4.464 4.464a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM10 7a3 3 0 100 6 3 3 0 000-6zm0 2a1 1 0 100 2 1 1 0 000-2z" />
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
);

const SystemIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
  </svg>
);

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeSwitcherProps {
  readonly defaultTheme?: Theme;
  readonly storageKey?: string;
  readonly className?: string;
  readonly norwegianLabels?: boolean;
  readonly showLabel?: boolean;
  readonly variant?: 'dropdown' | 'toggle' | 'buttons';
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  defaultTheme = 'system',
  storageKey = 'xaheen-theme',
  className,
  norwegianLabels = true,
  showLabel = false,
  variant = 'dropdown'
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Labels in Norwegian and English
  const labels = {
    light: norwegianLabels ? 'Lys' : 'Light',
    dark: norwegianLabels ? 'Mørk' : 'Dark',
    system: norwegianLabels ? 'System' : 'System',
    switchTheme: norwegianLabels ? 'Bytt tema' : 'Switch theme',
    currentTheme: norwegianLabels ? 'Nåværende tema' : 'Current theme'
  };

  // Apply theme on mount and changes
  useEffect(() => {
    setMounted(true);
    
    // Get stored theme or use default
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    root.classList.add(effectiveTheme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Toggle variant (simple light/dark toggle)
  if (variant === 'toggle') {
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={`${labels.switchTheme}: ${isDark ? labels.light : labels.dark}`}
        className={className}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </Button>
    );
  }

  // Buttons variant (three separate buttons)
  if (variant === 'buttons') {
    return (
      <div className={cn('flex gap-2', className)} role="group" aria-label={labels.switchTheme}>
        <Button
          variant={theme === 'light' ? 'primary' : 'outline'}
          size={showLabel ? 'md' : 'icon'}
          onClick={() => setTheme('light')}
          aria-pressed={theme === 'light'}
          aria-label={showLabel ? undefined : labels.light}
        >
          <SunIcon />
          {showLabel && <span className="ml-2">{labels.light}</span>}
        </Button>
        <Button
          variant={theme === 'dark' ? 'primary' : 'outline'}
          size={showLabel ? 'md' : 'icon'}
          onClick={() => setTheme('dark')}
          aria-pressed={theme === 'dark'}
          aria-label={showLabel ? undefined : labels.dark}
        >
          <MoonIcon />
          {showLabel && <span className="ml-2">{labels.dark}</span>}
        </Button>
        <Button
          variant={theme === 'system' ? 'primary' : 'outline'}
          size={showLabel ? 'md' : 'icon'}
          onClick={() => setTheme('system')}
          aria-pressed={theme === 'system'}
          aria-label={showLabel ? undefined : labels.system}
        >
          <SystemIcon />
          {showLabel && <span className="ml-2">{labels.system}</span>}
        </Button>
      </div>
    );
  }

  // Dropdown variant (default)
  const currentIcon = theme === 'light' ? <SunIcon /> : theme === 'dark' ? <MoonIcon /> : <SystemIcon />;
  
  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        size={showLabel ? 'md' : 'icon'}
        aria-label={`${labels.currentTheme}: ${labels[theme]}`}
        aria-haspopup="menu"
        aria-expanded="false"
        className="peer"
      >
        {currentIcon}
        {showLabel && <span className="ml-2">{labels[theme]}</span>}
      </Button>
      
      {/* Dropdown menu (simplified for this example) */}
      <div 
        className="absolute right-0 mt-2 w-48 rounded-lg border bg-popover p-1 shadow-lg opacity-0 invisible peer-focus:opacity-100 peer-focus:visible hover:opacity-100 hover:visible transition-all"
        role="menu"
        aria-label={labels.switchTheme}
      >
        {(['light', 'dark', 'system'] as Theme[]).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'focus:bg-accent focus:text-accent-foreground focus:outline-none',
              theme === t && 'bg-accent text-accent-foreground'
            )}
            role="menuitem"
            aria-current={theme === t ? 'true' : undefined}
          >
            {t === 'light' && <SunIcon />}
            {t === 'dark' && <MoonIcon />}
            {t === 'system' && <SystemIcon />}
            <span>{labels[t]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

ThemeSwitcher.displayName = 'ThemeSwitcher';

// Export theme type
export type { Theme as ThemeType };