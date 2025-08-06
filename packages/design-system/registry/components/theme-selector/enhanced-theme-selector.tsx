/**
 * Enhanced Theme Selector Component
 * Combines system theme (light/dark/system) with industry themes
 * Based on the existing theme-switcher design pattern
 */

import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../button/button';

export type ColorScheme = 'light' | 'dark' | 'system';
export type EnhancedIndustryTheme = 'enterprise' | 'finance' | 'healthcare' | 'education' | 'ecommerce' | 'productivity';

export interface EnhancedThemeInfo {
  readonly id: EnhancedIndustryTheme;
  readonly name: string;
  readonly description: string;
  readonly primaryColor: string;
  readonly icon: string;
}

export const ENHANCED_INDUSTRY_THEMES: Record<EnhancedIndustryTheme, EnhancedThemeInfo> = {
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

export interface EnhancedThemeSelectorProps {
  readonly currentColorScheme?: ColorScheme;
  readonly currentIndustryTheme?: EnhancedIndustryTheme;
  readonly onColorSchemeChange?: (scheme: ColorScheme) => void;
  readonly onIndustryThemeChange?: (theme: EnhancedIndustryTheme) => void;
  readonly className?: string;
  readonly norwegianLabels?: boolean;
  readonly variant?: 'compact' | 'expanded' | 'dropdown';
  readonly showDescription?: boolean;
  readonly storageKey?: string;
}

// Theme icons from existing theme switcher
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 13a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm7-5a1 1 0 110 2h-1a1 1 0 110-2h1zM4 10a1 1 0 110 2H3a1 1 0 110-2h1zm11.536-5.536a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm-12.02 9.9a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm12.02 1.414a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM4.464 4.464a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM10 7a3 3 0 100 6 3 3 0 000-6zm0 2a1 1 0 100 2 1 1 0 000-2z" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
);

const SystemIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
  </svg>
);

export const EnhancedThemeSelector: React.FC<EnhancedThemeSelectorProps> = ({
  currentColorScheme = 'system',
  currentIndustryTheme = 'enterprise',
  onColorSchemeChange,
  onIndustryThemeChange,
  className,
  norwegianLabels = true,
  variant = 'compact',
  showDescription = true,
  storageKey = 'xaheen-theme'
}) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(currentColorScheme);
  const [industryTheme, setIndustryTheme] = useState<EnhancedIndustryTheme>(currentIndustryTheme);
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const labels = norwegianLabels ? {
    light: 'Lys',
    dark: 'Mørk',
    system: 'System',
    industryTheme: 'Bransjemma',
    colorScheme: 'Fargeskjema'
  } : {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    industryTheme: 'Industry Theme',
    colorScheme: 'Color Scheme'
  };

  // Hydration fix
  useEffect(() => {
    setMounted(true);
    
    // Load from localStorage if provided
    if (storageKey && typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const { colorScheme: cs, industryTheme: it } = JSON.parse(stored);
          if (cs) setColorScheme(cs);
          if (it) setIndustryTheme(it);
        } catch (e) {
          console.warn('Failed to parse stored theme:', e);
        }
      }
    }
  }, [storageKey]);

  const handleColorSchemeChange = useCallback((scheme: ColorScheme) => {
    setColorScheme(scheme);
    onColorSchemeChange?.(scheme);
    
    // Apply to DOM
    document.documentElement.classList.remove('light', 'dark');
    if (scheme !== 'system') {
      document.documentElement.classList.add(scheme);
    } else {
      // Use system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(isDark ? 'dark' : 'light');
    }
    
    // Save to localStorage
    if (storageKey) {
      const currentTheme = { colorScheme: scheme, industryTheme };
      localStorage.setItem(storageKey, JSON.stringify(currentTheme));
    }
  }, [onColorSchemeChange, industryTheme, storageKey]);

  const handleIndustryThemeChange = useCallback((theme: EnhancedIndustryTheme) => {
    setIndustryTheme(theme);
    onIndustryThemeChange?.(theme);
    
    // Apply theme colors to CSS custom properties
    const themeInfo = ENHANCED_INDUSTRY_THEMES[theme];
    document.documentElement.style.setProperty('--theme-primary', themeInfo.primaryColor);
    document.documentElement.setAttribute('data-industry-theme', theme);
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);
    
    // Save to localStorage
    if (storageKey) {
      const currentTheme = { colorScheme, industryTheme: theme };
      localStorage.setItem(storageKey, JSON.stringify(currentTheme));
    }
  }, [onIndustryThemeChange, colorScheme, storageKey]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const currentThemeInfo = ENHANCED_INDUSTRY_THEMES[industryTheme];
  const colorSchemeIcon = colorScheme === 'light' ? <SunIcon /> : colorScheme === 'dark' ? <MoonIcon /> : <SystemIcon />;

  // Compact variant - small button group
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3 p-3 bg-card rounded-lg border', className)}>
        {/* Color Scheme Toggle */}
        <div className="flex gap-1" role="group" aria-label={labels.colorScheme}>
          {(['light', 'dark', 'system'] as ColorScheme[]).map((scheme) => {
            const Icon = scheme === 'light' ? SunIcon : scheme === 'dark' ? MoonIcon : SystemIcon;
            return (
              <Button
                key={scheme}
                variant={colorScheme === scheme ? 'primary' : 'ghost'}
                size="icon"
                onClick={() => handleColorSchemeChange(scheme)}
                aria-pressed={colorScheme === scheme}
                aria-label={labels[scheme]}
              >
                <Icon />
              </Button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-border" />

        {/* Industry Theme Selector */}
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentThemeInfo.icon}</span>
          <select
            value={industryTheme}
            onChange={(e) => handleIndustryThemeChange(e.target.value as EnhancedIndustryTheme)}
            className="bg-transparent border-none text-sm font-medium focus:outline-none"
            aria-label={labels.industryTheme}
          >
            {Object.values(ENHANCED_INDUSTRY_THEMES).map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)}>
        <Button
          variant="outline"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="justify-between min-w-[200px]"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
        >
          <div className="flex items-center gap-2">
            {colorSchemeIcon}
            <span className="text-lg">{currentThemeInfo.icon}</span>
            <span className="font-medium">{currentThemeInfo.name}</span>
          </div>
          <svg 
            className={cn('h-4 w-4 transition-transform', isDropdownOpen && 'rotate-180')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>

        {isDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute top-full mt-2 w-80 z-50 rounded-xl border bg-card shadow-xl p-4 space-y-4">
              {/* Color Scheme Section */}
              <div>
                <h4 className="font-medium text-sm mb-2">{labels.colorScheme}</h4>
                <div className="flex gap-2" role="group">
                  {(['light', 'dark', 'system'] as ColorScheme[]).map((scheme) => {
                    const Icon = scheme === 'light' ? SunIcon : scheme === 'dark' ? MoonIcon : SystemIcon;
                    return (
                      <Button
                        key={scheme}
                        variant={colorScheme === scheme ? 'primary' : 'outline'}
                        size="md"
                        onClick={() => handleColorSchemeChange(scheme)}
                        aria-pressed={colorScheme === scheme}
                        className="flex-1"
                      >
                        <Icon />
                        <span className="ml-1">{labels[scheme]}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Industry Theme Section */}
              <div>
                <h4 className="font-medium text-sm mb-2">{labels.industryTheme}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(ENHANCED_INDUSTRY_THEMES).map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        handleIndustryThemeChange(theme.id);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        'p-3 rounded-lg border text-left transition-colors',
                        'hover:bg-accent focus:bg-accent focus:outline-none',
                        theme.id === industryTheme ? 'border-primary bg-primary/5' : 'border-border'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{theme.icon}</span>
                        <span className="font-medium text-sm">{theme.name}</span>
                      </div>
                      {showDescription && (
                        <p className="text-xs text-muted-foreground">{theme.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Expanded variant - full layout
  return (
    <div className={cn('space-y-6 p-6 bg-card rounded-lg border', className)}>
      {/* Color Scheme Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3">{labels.colorScheme}</h3>
        <div className="flex gap-3" role="group">
          {(['light', 'dark', 'system'] as ColorScheme[]).map((scheme) => {
            const Icon = scheme === 'light' ? SunIcon : scheme === 'dark' ? MoonIcon : SystemIcon;
            return (
              <Button
                key={scheme}
                variant={colorScheme === scheme ? 'primary' : 'outline'}
                onClick={() => handleColorSchemeChange(scheme)}
                aria-pressed={colorScheme === scheme}
                className="flex-1"
              >
                <Icon />
                <span className="ml-2">{labels[scheme]}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Industry Theme Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3">{labels.industryTheme}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.values(ENHANCED_INDUSTRY_THEMES).map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleIndustryThemeChange(theme.id)}
              className={cn(
                'p-4 rounded-xl border-2 transition-all text-left',
                'hover:border-primary/50 focus:border-primary focus:outline-none',
                theme.id === industryTheme 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-card hover:bg-accent'
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{theme.icon}</span>
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
      </div>
    </div>
  );
};