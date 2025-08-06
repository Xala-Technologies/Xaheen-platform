/**
 * Theme Selector Component
 * Industry-specific theme switcher with Norwegian labels
 * WCAG AAA compliant with keyboard navigation
 */

import React, { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../button/button';

export type ThemeSelectorIndustry = 'enterprise' | 'finance' | 'healthcare' | 'education' | 'ecommerce' | 'productivity';

export interface ThemeInfo {
  readonly id: ThemeSelectorIndustry;
  readonly name: string;
  readonly description: string;
  readonly primaryColor: string;
  readonly icon: string;
}

export const INDUSTRY_THEMES: Record<ThemeSelectorIndustry, ThemeInfo> = {
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Profesjonelt design for bedrifter',
    primaryColor: '#1e40af',
    icon: '🏢'
  },
  finance: {
    id: 'finance',
    name: 'Finans',
    description: 'Tillit og sikkerhet for finansinstitusjoner',
    primaryColor: '#059669',
    icon: '💰'
  },
  healthcare: {
    id: 'healthcare',
    name: 'Helse',
    description: 'Rent og tilgjengelig for helsevesen',
    primaryColor: '#dc2626',
    icon: '🏥'
  },
  education: {
    id: 'education',
    name: 'Utdanning',
    description: 'Vennlig og inspirerende for læring',
    primaryColor: '#7c3aed',
    icon: '🎓'
  },
  ecommerce: {
    id: 'ecommerce',
    name: 'E-handel',
    description: 'Konverteringsoptimalisert for salg',
    primaryColor: '#ea580c',
    icon: '🛒'
  },
  productivity: {
    id: 'productivity',
    name: 'Produktivitet',
    description: 'Fokusert design for arbeidsflyt',
    primaryColor: '#0891b2',
    icon: '⚡'
  }
};

export interface ThemeSelectorProps {
  readonly currentTheme: ThemeSelectorIndustry;
  readonly onThemeChange: (theme: ThemeSelectorIndustry) => void;
  readonly className?: string;
  readonly variant?: 'dropdown' | 'grid' | 'tabs';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly showDescription?: boolean;
  readonly norwegianLabels?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
  className,
  variant = 'dropdown',
  size = 'md',
  showDescription = true,
  norwegianLabels = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentThemeInfo = INDUSTRY_THEMES[currentTheme];

  const handleThemeSelect = useCallback((theme: ThemeSelectorIndustry) => {
    onThemeChange(theme);
    setIsOpen(false);
  }, [onThemeChange]);

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)}>
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'justify-between min-w-[200px]',
            size === 'sm' && 'h-9 text-sm px-3',
            size === 'md' && 'h-12 px-4',
            size === 'lg' && 'h-14 px-6 text-lg'
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={norwegianLabels ? 'Velg industritema' : 'Select industry theme'}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{currentThemeInfo.icon}</span>
            <div className="text-left">
              <div className="font-medium">{currentThemeInfo.name}</div>
              {showDescription && size !== 'sm' && (
                <div className="text-xs text-muted-foreground">
                  {currentThemeInfo.description}
                </div>
              )}
            </div>
          </div>
          <svg 
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsOpen(false);
              }}
              role="button"
              tabIndex={0}
              aria-label={norwegianLabels ? 'Lukk temavalgmeny' : 'Close theme selector'}
            />
            <div
              className="absolute top-full mt-2 w-full min-w-[300px] max-h-80 overflow-y-auto z-50 rounded-xl border bg-card shadow-xl"
              role="listbox"
              aria-label={norwegianLabels ? 'Industritemaer' : 'Industry themes'}
            >
              {Object.values(INDUSTRY_THEMES).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={cn(
                    'w-full p-4 text-left hover:bg-accent transition-colors',
                    'focus:bg-accent focus:outline-none',
                    'border-b border-border last:border-0',
                    theme.id === currentTheme && 'bg-accent'
                  )}
                  role="option"
                  aria-selected={theme.id === currentTheme}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{theme.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {theme.name}
                        {theme.id === currentTheme && (
                          <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {theme.description}
                      </div>
                      <div 
                        className="h-3 w-12 rounded mt-2"
                        style={{ backgroundColor: theme.primaryColor }}
                        aria-label={`${norwegianLabels ? 'Primærfarge' : 'Primary color'}: ${theme.primaryColor}`}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Grid variant
  if (variant === 'grid') {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-3', className)}>
        {Object.values(INDUSTRY_THEMES).map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme.id)}
            className={cn(
              'p-4 rounded-xl border-2 transition-all text-left',
              'hover:border-primary/50 focus:border-primary focus:outline-none',
              theme.id === currentTheme 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-card hover:bg-accent',
              size === 'sm' && 'p-3',
              size === 'lg' && 'p-6'
            )}
            aria-pressed={theme.id === currentTheme}
          >
            <div className="flex items-start gap-3">
              <span className={cn(
                'text-2xl',
                size === 'sm' && 'text-xl',
                size === 'lg' && 'text-3xl'
              )}>
                {theme.icon}
              </span>
              <div className="flex-1">
                <div className="font-medium">{theme.name}</div>
                {showDescription && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {theme.description}
                  </div>
                )}
                <div 
                  className="h-2 w-8 rounded mt-2"
                  style={{ backgroundColor: theme.primaryColor }}
                />
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  // Tabs variant
  if (variant === 'tabs') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)} role="tablist">
        {Object.values(INDUSTRY_THEMES).map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme.id)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              'hover:bg-accent focus:bg-accent focus:outline-none',
              theme.id === currentTheme 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-card border border-border',
              size === 'sm' && 'px-3 py-1.5 text-sm',
              size === 'lg' && 'px-6 py-3 text-lg'
            )}
            role="tab"
            aria-selected={theme.id === currentTheme}
          >
            <span>{theme.icon}</span>
            <span className="font-medium">{theme.name}</span>
          </button>
        ))}
      </div>
    );
  }

  return null;
};

// Theme Provider Hook for Storybook
export const useThemeSelector = (initialTheme: ThemeSelectorIndustry = 'enterprise') => {
  const [currentTheme, setCurrentTheme] = useState<ThemeSelectorIndustry>(initialTheme);
  
  const applyTheme = useCallback((theme: ThemeSelectorIndustry) => {
    const themeInfo = INDUSTRY_THEMES[theme];
    document.documentElement.style.setProperty('--theme-primary', themeInfo.primaryColor);
    document.documentElement.setAttribute('data-theme', theme);
    setCurrentTheme(theme);
  }, []);

  return { currentTheme, applyTheme };
};