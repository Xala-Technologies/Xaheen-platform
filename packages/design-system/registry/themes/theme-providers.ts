/**
 * Theme Providers
 * Platform-specific theme provider implementations
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UniversalTheme, ThemeId, THEME_REGISTRY } from '../core/theme-system';
import { ThemeConverters } from '../core/theme-converters';

// =============================================================================
// REACT THEME PROVIDER
// =============================================================================

interface ThemeContextValue {
  theme: UniversalTheme;
  themeId: ThemeId;
  colorMode: 'light' | 'dark' | 'auto';
  setTheme: (themeId: ThemeId) => void;
  setColorMode: (mode: 'light' | 'dark' | 'auto') => void;
  toggleColorMode: () => void;
  isDark: boolean;
  tokens: UniversalTheme['tokens'];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeId;
  defaultColorMode?: 'light' | 'dark' | 'auto';
  storageKey?: string;
  enableSystemTheme?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  defaultColorMode = 'auto',
  storageKey = 'xaheen-theme',
  enableSystemTheme = true
}) => {
  const [themeId, setThemeId] = useState<ThemeId>(defaultTheme);
  const [colorMode, setColorMode] = useState<'light' | 'dark' | 'auto'>(defaultColorMode);
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  // Detect system theme preference
  useEffect(() => {
    if (!enableSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableSystemTheme]);

  // Load theme from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const { themeId: storedTheme, colorMode: storedMode } = JSON.parse(stored);
        if (storedTheme && THEME_REGISTRY[storedTheme]) {
          setThemeId(storedTheme);
        }
        if (storedMode && ['light', 'dark', 'auto'].includes(storedMode)) {
          setColorMode(storedMode);
        }
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error);
    }
  }, [storageKey]);

  // Save theme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ themeId, colorMode }));
    } catch (error) {
      console.warn('Failed to save theme to storage:', error);
    }
  }, [themeId, colorMode, storageKey]);

  // Determine current theme
  const resolvedThemeId = colorMode === 'auto' 
    ? (systemPrefersDark ? 'dark' : 'light')
    : colorMode === 'dark' ? 'dark' : 'light';

  const theme = THEME_REGISTRY[resolvedThemeId];
  const isDark = resolvedThemeId === 'dark';

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(isDark ? 'dark' : 'light');
    
    // Apply CSS variables
    const cssVariables = ThemeConverters.toCSSVariables(theme);
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, [theme, isDark]);

  const handleSetTheme = (newThemeId: ThemeId) => {
    setThemeId(newThemeId);
  };

  const handleSetColorMode = (mode: 'light' | 'dark' | 'auto') => {
    setColorMode(mode);
  };

  const toggleColorMode = () => {
    setColorMode(current => {
      if (current === 'auto') return systemPrefersDark ? 'light' : 'dark';
      return current === 'light' ? 'dark' : 'light';
    });
  };

  const value: ThemeContextValue = {
    theme,
    themeId: resolvedThemeId,
    colorMode,
    setTheme: handleSetTheme,
    setColorMode: handleSetColorMode,
    toggleColorMode,
    isDark,
    tokens: theme.tokens
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// =============================================================================
// VUE THEME COMPOSABLES
// =============================================================================

export const VueThemeComposable = `
import { ref, computed, watch, onMounted } from 'vue';
import { THEME_REGISTRY, type ThemeId, type UniversalTheme } from '../core/theme-system';
import { ThemeConverters } from '../core/theme-converters';

// Global theme state
const themeId = ref<ThemeId>('light');
const colorMode = ref<'light' | 'dark' | 'auto'>('auto');
const systemPrefersDark = ref(false);

export function useTheme() {
  // Computed theme
  const resolvedThemeId = computed(() => {
    if (colorMode.value === 'auto') {
      return systemPrefersDark.value ? 'dark' : 'light';
    }
    return colorMode.value === 'dark' ? 'dark' : 'light';
  });
  
  const theme = computed(() => THEME_REGISTRY[resolvedThemeId.value]);
  const isDark = computed(() => resolvedThemeId.value === 'dark');
  
  // Methods
  const setTheme = (newThemeId: ThemeId) => {
    themeId.value = newThemeId;
  };
  
  const setColorMode = (mode: 'light' | 'dark' | 'auto') => {
    colorMode.value = mode;
  };
  
  const toggleColorMode = () => {
    if (colorMode.value === 'auto') {
      colorMode.value = systemPrefersDark.value ? 'light' : 'dark';
    } else {
      colorMode.value = colorMode.value === 'light' ? 'dark' : 'light';
    }
  };
  
  // System theme detection
  const initSystemTheme = () => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemPrefersDark.value = mediaQuery.matches;
    
    const handleChange = (e: MediaQueryListEvent) => {
      systemPrefersDark.value = e.matches;
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  };
  
  // Apply theme to document
  const applyTheme = () => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(isDark.value ? 'dark' : 'light');
    
    const cssVariables = ThemeConverters.toCSSVariables(theme.value);
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  };
  
  // Watch for theme changes
  watch([theme, isDark], applyTheme, { immediate: true });
  
  onMounted(() => {
    initSystemTheme();
    
    // Load from localStorage
    try {
      const stored = localStorage.getItem('xaheen-theme');
      if (stored) {
        const { themeId: storedTheme, colorMode: storedMode } = JSON.parse(stored);
        if (storedTheme && THEME_REGISTRY[storedTheme]) {
          themeId.value = storedTheme;
        }
        if (storedMode && ['light', 'dark', 'auto'].includes(storedMode)) {
          colorMode.value = storedMode;
        }
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error);
    }
  });
  
  // Save to localStorage
  watch([themeId, colorMode], () => {
    try {
      localStorage.setItem('xaheen-theme', JSON.stringify({
        themeId: themeId.value,
        colorMode: colorMode.value
      }));
    } catch (error) {
      console.warn('Failed to save theme to storage:', error);
    }
  });
  
  return {
    theme,
    themeId: resolvedThemeId,
    colorMode,
    isDark,
    tokens: computed(() => theme.value.tokens),
    setTheme,
    setColorMode,
    toggleColorMode
  };
}
`;

// =============================================================================
// SVELTE THEME STORES
// =============================================================================

export const SvelteThemeStore = `
import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { THEME_REGISTRY, type ThemeId } from '../core/theme-system';
import { ThemeConverters } from '../core/theme-converters';

// Theme stores
export const themeId = writable<ThemeId>('light');
export const colorMode = writable<'light' | 'dark' | 'auto'>('auto');
export const systemPrefersDark = writable(false);

// Derived stores
export const resolvedThemeId = derived([colorMode, systemPrefersDark], ([$colorMode, $systemPrefersDark]) => {
  if ($colorMode === 'auto') {
    return $systemPrefersDark ? 'dark' : 'light';
  }
  return $colorMode === 'dark' ? 'dark' : 'light';
});

export const theme = derived(resolvedThemeId, ($resolvedThemeId) => {
  return THEME_REGISTRY[$resolvedThemeId];
});

export const isDark = derived(resolvedThemeId, ($resolvedThemeId) => {
  return $resolvedThemeId === 'dark';
});

export const tokens = derived(theme, ($theme) => $theme.tokens);

// Theme actions
export const themeActions = {
  setTheme: (newThemeId: ThemeId) => {
    themeId.set(newThemeId);
  },
  
  setColorMode: (mode: 'light' | 'dark' | 'auto') => {
    colorMode.set(mode);
  },
  
  toggleColorMode: () => {
    const currentMode = get(colorMode);
    const currentSystemPrefersDark = get(systemPrefersDark);
    
    if (currentMode === 'auto') {
      colorMode.set(currentSystemPrefersDark ? 'light' : 'dark');
    } else {
      colorMode.set(currentMode === 'light' ? 'dark' : 'light');
    }
  }
};

// Initialize theme system
if (browser) {
  // System theme detection
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemPrefersDark.set(mediaQuery.matches);
  
  mediaQuery.addEventListener('change', (e) => {
    systemPrefersDark.set(e.matches);
  });
  
  // Load from localStorage
  try {
    const stored = localStorage.getItem('xaheen-theme');
    if (stored) {
      const { themeId: storedTheme, colorMode: storedMode } = JSON.parse(stored);
      if (storedTheme && THEME_REGISTRY[storedTheme]) {
        themeId.set(storedTheme);
      }
      if (storedMode && ['light', 'dark', 'auto'].includes(storedMode)) {
        colorMode.set(storedMode);
      }
    }
  } catch (error) {
    console.warn('Failed to load theme from storage:', error);
  }
  
  // Save to localStorage
  themeId.subscribe(() => saveToStorage());
  colorMode.subscribe(() => saveToStorage());
  
  function saveToStorage() {
    try {
      localStorage.setItem('xaheen-theme', JSON.stringify({
        themeId: get(themeId),
        colorMode: get(colorMode)
      }));
    } catch (error) {
      console.warn('Failed to save theme to storage:', error);
    }
  }
  
  // Apply theme to document
  theme.subscribe(($theme) => {
    const root = document.documentElement;
    const $isDark = get(isDark);
    
    root.classList.remove('light', 'dark');
    root.classList.add($isDark ? 'dark' : 'light');
    
    const cssVariables = ThemeConverters.toCSSVariables($theme);
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  });
}
`;

// =============================================================================
// ANGULAR THEME SERVICE
// =============================================================================

export const AngularThemeService = `
import { Injectable, Inject, DOCUMENT } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { THEME_REGISTRY, type ThemeId, type UniversalTheme } from '../core/theme-system';
import { ThemeConverters } from '../core/theme-converters';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly themeIdSubject = new BehaviorSubject<ThemeId>('light');
  private readonly colorModeSubject = new BehaviorSubject<'light' | 'dark' | 'auto'>('auto');
  private readonly systemPrefersDarkSubject = new BehaviorSubject<boolean>(false);
  
  public readonly themeId$ = this.themeIdSubject.asObservable();
  public readonly colorMode$ = this.colorModeSubject.asObservable();
  public readonly systemPrefersDark$ = this.systemPrefersDarkSubject.asObservable();
  
  public readonly resolvedThemeId$: Observable<ThemeId> = combineLatest([
    this.colorMode$,
    this.systemPrefersDark$
  ]).pipe(
    map(([colorMode, systemPrefersDark]) => {
      if (colorMode === 'auto') {
        return systemPrefersDark ? 'dark' : 'light';
      }
      return colorMode === 'dark' ? 'dark' : 'light';
    })
  );
  
  public readonly theme$: Observable<UniversalTheme> = this.resolvedThemeId$.pipe(
    map(themeId => THEME_REGISTRY[themeId])
  );
  
  public readonly isDark$: Observable<boolean> = this.resolvedThemeId$.pipe(
    map(themeId => themeId === 'dark')
  );
  
  public readonly tokens$ = this.theme$.pipe(
    map(theme => theme.tokens)
  );
  
  constructor(@Inject(DOCUMENT) private document: Document) {
    this.initializeThemeSystem();
    this.subscribeToThemeChanges();
  }
  
  setTheme(themeId: ThemeId): void {
    this.themeIdSubject.next(themeId);
    this.saveToStorage();
  }
  
  setColorMode(mode: 'light' | 'dark' | 'auto'): void {
    this.colorModeSubject.next(mode);
    this.saveToStorage();
  }
  
  toggleColorMode(): void {
    const currentMode = this.colorModeSubject.value;
    const systemPrefersDark = this.systemPrefersDarkSubject.value;
    
    if (currentMode === 'auto') {
      this.setColorMode(systemPrefersDark ? 'light' : 'dark');
    } else {
      this.setColorMode(currentMode === 'light' ? 'dark' : 'light');
    }
  }
  
  private initializeThemeSystem(): void {
    // Detect system theme preference
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemPrefersDarkSubject.next(mediaQuery.matches);
      
      mediaQuery.addEventListener('change', (e) => {
        this.systemPrefersDarkSubject.next(e.matches);
      });
    }
    
    // Load from localStorage
    this.loadFromStorage();
  }
  
  private subscribeToThemeChanges(): void {
    this.theme$.subscribe(theme => {
      this.applyThemeToDocument(theme);
    });
  }
  
  private applyThemeToDocument(theme: UniversalTheme): void {
    const root = this.document.documentElement;
    
    this.isDark$.subscribe(isDark => {
      root.classList.remove('light', 'dark');
      root.classList.add(isDark ? 'dark' : 'light');
    });
    
    const cssVariables = ThemeConverters.toCSSVariables(theme);
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }
  
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('xaheen-theme');
      if (stored) {
        const { themeId, colorMode } = JSON.parse(stored);
        if (themeId && THEME_REGISTRY[themeId]) {
          this.themeIdSubject.next(themeId);
        }
        if (colorMode && ['light', 'dark', 'auto'].includes(colorMode)) {
          this.colorModeSubject.next(colorMode);
        }
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error);
    }
  }
  
  private saveToStorage(): void {
    try {
      localStorage.setItem('xaheen-theme', JSON.stringify({
        themeId: this.themeIdSubject.value,
        colorMode: this.colorModeSubject.value
      }));
    } catch (error) {
      console.warn('Failed to save theme to storage:', error);
    }
  }
}
`;

// =============================================================================
// REACT NATIVE THEME PROVIDER
// =============================================================================

export const ReactNativeThemeProvider = `
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';
import { UniversalTheme, ThemeId, THEME_REGISTRY } from '../core/theme-system';
import { ThemeConverters } from '../core/theme-converters';

interface ReactNativeThemeContextValue {
  theme: UniversalTheme;
  themeId: ThemeId;
  colorMode: 'light' | 'dark' | 'auto';
  setTheme: (themeId: ThemeId) => Promise<void>;
  setColorMode: (mode: 'light' | 'dark' | 'auto') => Promise<void>;
  toggleColorMode: () => Promise<void>;
  isDark: boolean;
  nativeTheme: ReturnType<typeof ThemeConverters.toReactNative>;
}

const ReactNativeThemeContext = createContext<ReactNativeThemeContextValue | undefined>(undefined);

interface ReactNativeThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeId;
  defaultColorMode?: 'light' | 'dark' | 'auto';
  storageKey?: string;
}

export const ReactNativeThemeProvider: React.FC<ReactNativeThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  defaultColorMode = 'auto',
  storageKey = '@xaheen-theme'
}) => {
  const [themeId, setThemeId] = useState<ThemeId>(defaultTheme);
  const [colorMode, setColorMode] = useState<'light' | 'dark' | 'auto'>(defaultColorMode);
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  // Load theme from AsyncStorage
  useEffect(() => {
    loadThemeFromStorage();
  }, []);

  const loadThemeFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        const { themeId: storedTheme, colorMode: storedMode } = JSON.parse(stored);
        if (storedTheme && THEME_REGISTRY[storedTheme]) {
          setThemeId(storedTheme);
        }
        if (storedMode && ['light', 'dark', 'auto'].includes(storedMode)) {
          setColorMode(storedMode);
        }
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error);
    }
  };

  const saveThemeToStorage = async (newThemeId: ThemeId, newColorMode: typeof colorMode) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify({
        themeId: newThemeId,
        colorMode: newColorMode
      }));
    } catch (error) {
      console.warn('Failed to save theme to storage:', error);
    }
  };

  // Determine current theme
  const resolvedThemeId = colorMode === 'auto' 
    ? (systemColorScheme === 'dark' ? 'dark' : 'light')
    : colorMode === 'dark' ? 'dark' : 'light';

  const theme = THEME_REGISTRY[resolvedThemeId];
  const isDark = resolvedThemeId === 'dark';
  const nativeTheme = ThemeConverters.toReactNative(theme);

  const handleSetTheme = async (newThemeId: ThemeId) => {
    setThemeId(newThemeId);
    await saveThemeToStorage(newThemeId, colorMode);
  };

  const handleSetColorMode = async (mode: 'light' | 'dark' | 'auto') => {
    setColorMode(mode);
    await saveThemeToStorage(themeId, mode);
  };

  const toggleColorMode = async () => {
    const newMode = colorMode === 'auto' 
      ? (systemColorScheme === 'dark' ? 'light' : 'dark')
      : colorMode === 'light' ? 'dark' : 'light';
    
    await handleSetColorMode(newMode);
  };

  const value: ReactNativeThemeContextValue = {
    theme,
    themeId: resolvedThemeId,
    colorMode,
    setTheme: handleSetTheme,
    setColorMode: handleSetColorMode,
    toggleColorMode,
    isDark,
    nativeTheme
  };

  return (
    <ReactNativeThemeContext.Provider value={value}>
      {children}
    </ReactNativeThemeContext.Provider>
  );
};

export const useReactNativeTheme = (): ReactNativeThemeContextValue => {
  const context = useContext(ReactNativeThemeContext);
  if (!context) {
    throw new Error('useReactNativeTheme must be used within a ReactNativeThemeProvider');
  }
  return context;
};
`;

export default {
  ThemeProvider,
  useTheme,
  VueThemeComposable,
  SvelteThemeStore,
  AngularThemeService,
  ReactNativeThemeProvider
};