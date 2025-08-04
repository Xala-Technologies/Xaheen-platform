# Theming Architecture Documentation

## Table of Contents

- [Overview](#overview)
- [Theme System Architecture](#theme-system-architecture)
- [Token-Based Theming](#token-based-theming)
- [Theme Management](#theme-management)
- [Dynamic Theme Switching](#dynamic-theme-switching)
- [Multi-Tenant Theming](#multi-tenant-theming)
- [Platform-Specific Themes](#platform-specific-themes)
- [Theme Customization](#theme-customization)
- [Performance Optimization](#performance-optimization)
- [Norwegian Compliance](#norwegian-compliance)

## Overview

The UI System v5.0 theming architecture is built on a **token-based design system** that enables dynamic theme switching, multi-tenant customization, and platform-specific adaptations. The system is designed for enterprise-scale applications with Norwegian compliance requirements.

### Key Features

- **🎨 Token-Based Design**: All styling driven by design tokens
- **🔄 Dynamic Switching**: Runtime theme changes without rebuilds
- **🏢 Multi-Tenant Support**: Isolated theming per tenant/brand
- **📱 Platform Adaptation**: Automatic platform-specific adjustments
- **🛡️ Norwegian Compliance**: NSM security classification and WCAG AAA support
- **⚡ Performance Optimized**: Sub-100ms theme switching with minimal memory usage

### Architecture Principles

- **Separation of Concerns**: Theme logic separated from component implementation
- **Token-First Approach**: Visual properties derived from tokens, not hardcoded
- **Immutable Themes**: Themes are immutable objects with versioning support
- **Context-Aware**: Themes adapt to context (platform, user preferences, compliance)
- **Performance-Focused**: Optimized for rapid theme switching and minimal bundle impact

## Theme System Architecture

### Core Theme Architecture

The theming system follows a layered architecture:

```
┌─────────────────────────────────────────┐
│          Theme Application Layer        │  ← Component styling
├─────────────────────────────────────────┤
│         Theme Resolution Layer          │  ← Dynamic resolution
├─────────────────────────────────────────┤
│        Theme Management Layer           │  ← State & switching
├─────────────────────────────────────────┤
│        Token Transformation Layer       │  ← Token processing
├─────────────────────────────────────────┤
│         Theme Storage Layer             │  ← Theme definitions
└─────────────────────────────────────────┘
```

### Theme Data Structure

Themes are structured as immutable objects with comprehensive metadata:

```typescript
export interface Theme {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly mode: 'light' | 'dark' | 'auto';
  readonly tokens: DesignTokens;
  readonly metadata: ThemeMetadata;
  readonly compliance?: ComplianceConfig;
  readonly platforms?: PlatformConfig;
  readonly customizations?: ThemeCustomizations;
}

export interface ThemeMetadata {
  readonly description?: string;
  readonly author?: string;
  readonly category?: 'default' | 'branded' | 'seasonal' | 'accessibility';
  readonly tags?: string[];
  readonly preview?: string;
  readonly created: number;
  readonly updated: number;
  readonly deprecated?: boolean;
  readonly successor?: string;
}

export interface ComplianceConfig {
  readonly nsmClassification?: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly wcagLevel?: 'A' | 'AA' | 'AAA';
  readonly gdprCompliant?: boolean;
  readonly auditTrail?: boolean;
  readonly dataClassification?: Record<string, string>;
}

export interface PlatformConfig {
  readonly desktop?: Partial<DesignTokens>;
  readonly mobile?: Partial<DesignTokens>;
  readonly tablet?: Partial<DesignTokens>;
  readonly web?: Partial<DesignTokens>;
}

export interface ThemeCustomizations {
  readonly components?: Record<string, ComponentTokens>;
  readonly overrides?: Partial<DesignTokens>;
  readonly extensions?: Record<string, any>;
}
```

### Theme Registry

Central registry for theme management:

```typescript
export class ThemeRegistry {
  private themes = new Map<string, Theme>();
  private activeTheme: string = 'light';
  private subscribers = new Set<ThemeSubscriber>();

  register(theme: Theme): void {
    this.validateTheme(theme);
    this.themes.set(theme.id, Object.freeze(theme));
    this.notifySubscribers('theme_registered', theme);
  }

  unregister(themeId: string): void {
    const theme = this.themes.get(themeId);
    if (theme) {
      this.themes.delete(themeId);
      this.notifySubscribers('theme_unregistered', theme);
    }
  }

  get(themeId: string): Theme | undefined {
    return this.themes.get(themeId);
  }

  getActive(): Theme {
    const theme = this.themes.get(this.activeTheme);
    if (!theme) {
      throw new Error(`Active theme '${this.activeTheme}' not found`);
    }
    return theme;
  }

  setActive(themeId: string): void {
    const theme = this.themes.get(themeId);
    if (!theme) {
      throw new Error(`Theme '${themeId}' not found`);
    }
    
    const previousTheme = this.getActive();
    this.activeTheme = themeId;
    
    this.notifySubscribers('theme_changed', {
      previous: previousTheme,
      current: theme,
    });
  }

  list(): Theme[] {
    return Array.from(this.themes.values());
  }

  subscribe(subscriber: ThemeSubscriber): () => void {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }

  private validateTheme(theme: Theme): void {
    if (!theme.id || !theme.name || !theme.tokens) {
      throw new Error('Invalid theme: missing required fields');
    }

    if (this.themes.has(theme.id)) {
      const existing = this.themes.get(theme.id)!;
      if (existing.version === theme.version) {
        throw new Error(`Theme '${theme.id}' version '${theme.version}' already exists`);
      }
    }
  }

  private notifySubscribers(event: string, data: any): void {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(event, data);
      } catch (error) {
        console.error('Theme subscriber error:', error);
      }
    });
  }
}

type ThemeSubscriber = (event: string, data: any) => void;

// Global theme registry
export const themeRegistry = new ThemeRegistry();
```

## Token-Based Theming

### Token Resolution System

Dynamic token resolution based on theme, platform, and context:

```typescript
export interface TokenResolutionContext {
  readonly theme: Theme;
  readonly platform: 'desktop' | 'mobile' | 'tablet' | 'web';
  readonly locale?: string;
  readonly userPreferences?: UserPreferences;
  readonly complianceRequirements?: ComplianceConfig;
}

export interface UserPreferences {
  readonly reducedMotion?: boolean;
  readonly highContrast?: boolean;
  readonly fontSize?: 'small' | 'medium' | 'large';
  readonly colorBlindness?: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
}

export class TokenResolver {
  resolve(context: TokenResolutionContext): ResolvedTokens {
    const { theme, platform, locale, userPreferences, complianceRequirements } = context;
    
    // Start with base theme tokens
    let resolvedTokens = this.cloneTokens(theme.tokens);
    
    // Apply platform-specific overrides
    if (theme.platforms?.[platform]) {
      resolvedTokens = this.mergeTokens(resolvedTokens, theme.platforms[platform]);
    }
    
    // Apply user preference adjustments
    if (userPreferences) {
      resolvedTokens = this.applyUserPreferences(resolvedTokens, userPreferences);
    }
    
    // Apply compliance requirements
    if (complianceRequirements) {
      resolvedTokens = this.applyComplianceRequirements(resolvedTokens, complianceRequirements);
    }
    
    // Apply locale-specific adjustments
    if (locale) {
      resolvedTokens = this.applyLocaleAdjustments(resolvedTokens, locale);
    }
    
    // Resolve token references
    resolvedTokens = this.resolveReferences(resolvedTokens);
    
    // Validate resolved tokens
    this.validateResolvedTokens(resolvedTokens);
    
    return Object.freeze(resolvedTokens);
  }

  private applyUserPreferences(
    tokens: DesignTokens,
    preferences: UserPreferences
  ): DesignTokens {
    let result = { ...tokens };
    
    // High contrast adjustments
    if (preferences.highContrast) {
      result = this.enhanceContrast(result);
    }
    
    // Font size adjustments
    if (preferences.fontSize && preferences.fontSize !== 'medium') {
      result = this.adjustFontSizes(result, preferences.fontSize);
    }
    
    // Reduced motion
    if (preferences.reducedMotion) {
      result = this.reduceMotion(result);
    }
    
    // Color blindness adjustments
    if (preferences.colorBlindness && preferences.colorBlindness !== 'none') {
      result = this.adjustForColorBlindness(result, preferences.colorBlindness);
    }
    
    return result;
  }

  private applyComplianceRequirements(
    tokens: DesignTokens,
    requirements: ComplianceConfig
  ): DesignTokens {
    let result = { ...tokens };
    
    // WCAG compliance adjustments
    if (requirements.wcagLevel) {
      result = this.enforceWCAGCompliance(result, requirements.wcagLevel);
    }
    
    // NSM classification visual indicators
    if (requirements.nsmClassification) {
      result = this.addSecurityClassificationIndicators(result, requirements.nsmClassification);
    }
    
    return result;
  }

  private enhanceContrast(tokens: DesignTokens): DesignTokens {
    const result = { ...tokens };
    
    // Increase contrast ratios for text
    if (result.colors?.text) {
      result.colors.text = {
        ...result.colors.text,
        primary: this.increaseContrast(result.colors.text.primary, result.colors.background.primary),
        secondary: this.increaseContrast(result.colors.text.secondary, result.colors.background.primary),
      };
    }
    
    // Enhance border visibility
    if (result.colors?.border) {
      result.colors.border = {
        ...result.colors.border,
        primary: this.enhanceBorderContrast(result.colors.border.primary),
      };
    }
    
    return result;
  }

  private adjustFontSizes(
    tokens: DesignTokens,
    size: 'small' | 'large'
  ): DesignTokens {
    const result = { ...tokens };
    const multiplier = size === 'small' ? 0.875 : 1.125;
    
    if (result.typography?.fontSize) {
      const adjustedFontSizes = {};
      Object.entries(result.typography.fontSize).forEach(([key, value]) => {
        if (typeof value === 'object' && 'size' in value) {
          adjustedFontSizes[key] = {
            ...value,
            size: this.scaleFontSize(value.size, multiplier),
          };
        } else if (typeof value === 'string') {
          adjustedFontSizes[key] = this.scaleFontSize(value, multiplier);
        }
      });
      result.typography.fontSize = adjustedFontSizes;
    }
    
    return result;
  }

  private resolveReferences(tokens: DesignTokens): DesignTokens {
    const flatTokens = this.flattenTokens(tokens);
    const resolved = {};
    
    Object.entries(flatTokens).forEach(([key, value]) => {
      resolved[key] = this.resolveTokenValue(value, flatTokens);
    });
    
    return this.unflattenTokens(resolved);
  }

  private resolveTokenValue(value: any, tokenMap: Record<string, any>): any {
    if (typeof value !== 'string') {
      return value;
    }
    
    // Match token references like {colors.primary.500}
    const referenceMatch = value.match(/^\{([^}]+)\}$/);
    if (referenceMatch) {
      const referencePath = referenceMatch[1];
      const referencedValue = tokenMap[referencePath];
      
      if (referencedValue === undefined) {
        console.warn(`Token reference not found: ${referencePath}`);
        return value;
      }
      
      // Recursively resolve references
      return this.resolveTokenValue(referencedValue, tokenMap);
    }
    
    return value;
  }
}

export const tokenResolver = new TokenResolver();
```

### Theme Token Processing

Processing and transformation of theme tokens:

```typescript
export class ThemeProcessor {
  process(theme: Theme, context: TokenResolutionContext): ProcessedTheme {
    const resolvedTokens = tokenResolver.resolve(context);
    
    return {
      ...theme,
      tokens: resolvedTokens,
      cssVariables: this.generateCSSVariables(resolvedTokens),
      componentStyles: this.generateComponentStyles(resolvedTokens),
      utilities: this.generateUtilityClasses(resolvedTokens),
      metadata: {
        ...theme.metadata,
        processed: true,
        processedAt: Date.now(),
        context: this.serializeContext(context),
      },
    };
  }

  private generateCSSVariables(tokens: DesignTokens): Record<string, string> {
    const variables: Record<string, string> = {};
    const flatTokens = this.flattenTokens(tokens);
    
    Object.entries(flatTokens).forEach(([path, value]) => {
      const cssVarName = `--${path.replace(/\./g, '-')}`;
      variables[cssVarName] = String(value);
    });
    
    return variables;
  }

  private generateComponentStyles(tokens: DesignTokens): Record<string, any> {
    const styles: Record<string, any> = {};
    
    if (tokens.components) {
      Object.entries(tokens.components).forEach(([component, componentTokens]) => {
        styles[component] = this.processComponentTokens(componentTokens);
      });
    }
    
    return styles;
  }

  private generateUtilityClasses(tokens: DesignTokens): Record<string, string> {
    const utilities: Record<string, string> = {};
    
    // Generate spacing utilities
    if (tokens.spacing) {
      Object.entries(tokens.spacing).forEach(([key, value]) => {
        utilities[`p-${key}`] = `padding: ${value}`;
        utilities[`m-${key}`] = `margin: ${value}`;
        utilities[`px-${key}`] = `padding-left: ${value}; padding-right: ${value}`;
        utilities[`py-${key}`] = `padding-top: ${value}; padding-bottom: ${value}`;
      });
    }
    
    // Generate color utilities
    if (tokens.colors) {
      const flatColors = this.flattenTokens(tokens.colors);
      Object.entries(flatColors).forEach(([path, value]) => {
        const className = path.replace(/\./g, '-');
        utilities[`text-${className}`] = `color: ${value}`;
        utilities[`bg-${className}`] = `background-color: ${value}`;
        utilities[`border-${className}`] = `border-color: ${value}`;
      });
    }
    
    return utilities;
  }
}

export const themeProcessor = new ThemeProcessor();
```

## Theme Management

### Theme Provider System

React context system for theme management:

```typescript
export interface ThemeContextValue {
  readonly theme: Theme;
  readonly tokens: ResolvedTokens;
  readonly setTheme: (themeId: string) => void;
  readonly availableThemes: Theme[];
  readonly isLoading: boolean;
  readonly error?: Error;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  readonly children: React.ReactNode;
  readonly defaultTheme?: string;
  readonly themes?: Theme[];
  readonly onThemeChange?: (theme: Theme) => void;
  readonly platform?: 'desktop' | 'mobile' | 'tablet' | 'web';
  readonly userPreferences?: UserPreferences;
  readonly complianceRequirements?: ComplianceConfig;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  themes = [],
  onThemeChange,
  platform = 'desktop',
  userPreferences,
  complianceRequirements,
}) => {
  const [currentThemeId, setCurrentThemeId] = useState(defaultTheme);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();

  // Register themes with registry
  useEffect(() => {
    themes.forEach(theme => {
      try {
        themeRegistry.register(theme);
      } catch (err) {
        console.warn(`Failed to register theme ${theme.id}:`, err);
      }
    });
  }, [themes]);

  // Get current theme
  const currentTheme = useMemo(() => {
    try {
      return themeRegistry.get(currentThemeId) || themeRegistry.getActive();
    } catch (err) {
      console.error('Failed to get current theme:', err);
      return createDefaultTheme();
    }
  }, [currentThemeId]);

  // Resolve tokens based on context
  const resolvedTokens = useMemo(() => {
    try {
      return tokenResolver.resolve({
        theme: currentTheme,
        platform,
        userPreferences,
        complianceRequirements,
      });
    } catch (err) {
      console.error('Failed to resolve tokens:', err);
      return currentTheme.tokens;
    }
  }, [currentTheme, platform, userPreferences, complianceRequirements]);

  // Theme change handler
  const setTheme = useCallback(async (themeId: string) => {
    try {
      setIsLoading(true);
      setError(undefined);

      const theme = themeRegistry.get(themeId);
      if (!theme) {
        throw new Error(`Theme '${themeId}' not found`);
      }

      setCurrentThemeId(themeId);
      themeRegistry.setActive(themeId);
      
      onThemeChange?.(theme);

      // Persist theme preference
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ui-system-theme', themeId);
      }
    } catch (err) {
      setError(err as Error);
      console.error('Failed to set theme:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onThemeChange]);

  // Load persisted theme on mount
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const persistedTheme = localStorage.getItem('ui-system-theme');
      if (persistedTheme && persistedTheme !== currentThemeId) {
        setTheme(persistedTheme);
      }
    }
  }, []);

  const contextValue: ThemeContextValue = useMemo(() => ({
    theme: currentTheme,
    tokens: resolvedTokens,
    setTheme,
    availableThemes: themeRegistry.list(),
    isLoading,
    error,
  }), [currentTheme, resolvedTokens, setTheme, isLoading, error]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {/* Inject CSS variables */}
      <style dangerouslySetInnerHTML={{
        __html: generateThemeCSS(resolvedTokens)
      }} />
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

function generateThemeCSS(tokens: ResolvedTokens): string {
  const processor = new ThemeProcessor();
  const cssVariables = processor.generateCSSVariables(tokens);
  
  const cssRules = Object.entries(cssVariables)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n');
  
  return `
    :root {
    ${cssRules}
    }
  `;
}
```

### Theme Hooks

Specialized hooks for theme interaction:

```typescript
export function useTokens(): ResolvedTokens {
  const { tokens } = useTheme();
  return tokens;
}

export function useThemeMode(): {
  mode: 'light' | 'dark' | 'auto';
  setMode: (mode: 'light' | 'dark' | 'auto') => void;
  effectiveMode: 'light' | 'dark';
} {
  const { theme, setTheme, availableThemes } = useTheme();
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>('light');

  // Listen to system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemMode = () => {
      setSystemMode(mediaQuery.matches ? 'dark' : 'light');
    };

    updateSystemMode();
    mediaQuery.addEventListener('change', updateSystemMode);

    return () => mediaQuery.removeEventListener('change', updateSystemMode);
  }, []);

  const setMode = useCallback((mode: 'light' | 'dark' | 'auto') => {
    const targetThemeId = mode === 'auto' 
      ? (systemMode === 'dark' ? 'dark' : 'light')
      : mode;
    
    const targetTheme = availableThemes.find(t => t.mode === targetThemeId);
    if (targetTheme) {
      setTheme(targetTheme.id);
    }
  }, [systemMode, availableThemes, setTheme]);

  const effectiveMode = theme.mode === 'auto' ? systemMode : theme.mode;

  return {
    mode: theme.mode,
    setMode,
    effectiveMode,
  };
}

export function useThemePreview(): {
  previewTheme: (themeId: string) => void;
  clearPreview: () => void;
  isPreviewActive: boolean;
  previewedTheme?: Theme;
} {
  const [previewedThemeId, setPreviewedThemeId] = useState<string>();
  const { availableThemes } = useTheme();

  const previewTheme = useCallback((themeId: string) => {
    setPreviewedThemeId(themeId);
    
    // Auto-clear preview after 5 seconds
    setTimeout(() => {
      setPreviewedThemeId(undefined);
    }, 5000);
  }, []);

  const clearPreview = useCallback(() => {
    setPreviewedThemeId(undefined);
  }, []);

  const previewedTheme = previewedThemeId 
    ? availableThemes.find(t => t.id === previewedThemeId)
    : undefined;

  return {
    previewTheme,
    clearPreview,
    isPreviewActive: !!previewedThemeId,
    previewedTheme,
  };
}
```

## Dynamic Theme Switching

### Transition System

Smooth transitions between themes:

```typescript
export interface ThemeTransitionOptions {
  readonly duration: number;
  readonly easing: string;
  readonly properties: string[];
  readonly onStart?: () => void;
  readonly onComplete?: () => void;
}

export class ThemeTransitionManager {
  private activeTransitions = new Set<HTMLElement>();
  private defaultOptions: ThemeTransitionOptions = {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    properties: ['background-color', 'color', 'border-color', 'fill', 'stroke'],
  };

  applyTransition(
    element: HTMLElement = document.documentElement,
    options: Partial<ThemeTransitionOptions> = {}
  ): Promise<void> {
    const opts = { ...this.defaultOptions, ...options };
    
    return new Promise((resolve) => {
      if (this.activeTransitions.has(element)) {
        this.cleanupTransition(element);
      }

      this.activeTransitions.add(element);
      opts.onStart?.();

      // Apply transition styles
      const transitionValue = opts.properties
        .map(prop => `${prop} ${opts.duration}ms ${opts.easing}`)
        .join(', ');

      const originalTransition = element.style.transition;
      element.style.transition = transitionValue;

      // Clean up after transition
      const cleanup = () => {
        element.style.transition = originalTransition;
        this.activeTransitions.delete(element);
        opts.onComplete?.();
        resolve();
      };

      setTimeout(cleanup, opts.duration);
    });
  }

  private cleanupTransition(element: HTMLElement): void {
    this.activeTransitions.delete(element);
    element.style.transition = '';
  }
}

export const themeTransitionManager = new ThemeTransitionManager();

// Hook for smooth theme transitions
export function useThemeTransition(options?: Partial<ThemeTransitionOptions>) {
  const { theme } = useTheme();
  const previousThemeRef = useRef<Theme>(theme);

  useEffect(() => {
    if (previousThemeRef.current.id !== theme.id) {
      themeTransitionManager.applyTransition(document.documentElement, options);
      previousThemeRef.current = theme;
    }
  }, [theme, options]);
}
```

### Real-Time Theme Updates

System for propagating theme changes across the application:

```typescript
export class ThemeUpdateBroadcaster {
  private broadcastChannel?: BroadcastChannel;
  private subscribers = new Set<(theme: Theme) => void>();

  constructor() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('ui-system-theme');
      this.broadcastChannel.addEventListener('message', this.handleBroadcastMessage.bind(this));
    }
  }

  broadcast(theme: Theme): void {
    // Broadcast to other tabs/windows
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'theme-change',
        theme: this.serializeTheme(theme),
        timestamp: Date.now(),
      });
    }

    // Notify local subscribers
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(theme);
      } catch (error) {
        console.error('Theme update subscriber error:', error);
      }
    });
  }

  subscribe(callback: (theme: Theme) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private handleBroadcastMessage(event: MessageEvent): void {
    if (event.data.type === 'theme-change') {
      const theme = this.deserializeTheme(event.data.theme);
      if (theme) {
        // Update local theme without triggering another broadcast
        themeRegistry.setActive(theme.id);
      }
    }
  }

  private serializeTheme(theme: Theme): any {
    return {
      id: theme.id,
      name: theme.name,
      mode: theme.mode,
      // Only serialize essential data for broadcast
    };
  }

  private deserializeTheme(data: any): Theme | null {
    try {
      return themeRegistry.get(data.id) || null;
    } catch {
      return null;
    }
  }
}

export const themeBroadcaster = new ThemeUpdateBroadcaster();

// Hook for cross-tab theme synchronization
export function useThemeSync(): void {
  const { setTheme } = useTheme();

  useEffect(() => {
    return themeBroadcaster.subscribe((theme) => {
      setTheme(theme.id);
    });
  }, [setTheme]);
}
```

## Multi-Tenant Theming

### Tenant Theme System

Support for multiple tenants with isolated theming:

```typescript
export interface TenantConfig {
  readonly id: string;
  readonly name: string;
  readonly theme: string;
  readonly customTokens?: Partial<DesignTokens>;
  readonly branding?: BrandingConfig;
  readonly compliance?: ComplianceConfig;
  readonly features?: string[];
}

export interface BrandingConfig {
  readonly logo?: string;
  readonly favicon?: string;
  readonly primaryColor?: string;
  readonly secondaryColor?: string;
  readonly fontFamily?: string;
  readonly customCSS?: string;
}

export class TenantThemeManager {
  private tenantConfigs = new Map<string, TenantConfig>();
  private activeTenant?: string;

  registerTenant(config: TenantConfig): void {
    this.validateTenantConfig(config);
    this.tenantConfigs.set(config.id, Object.freeze(config));
    
    // Create tenant-specific theme
    this.createTenantTheme(config);
  }

  setActiveTenant(tenantId: string): void {
    const config = this.tenantConfigs.get(tenantId);
    if (!config) {
      throw new Error(`Tenant '${tenantId}' not found`);
    }

    this.activeTenant = tenantId;
    
    // Apply tenant theme
    const tenantThemeId = `${config.theme}-${tenantId}`;
    themeRegistry.setActive(tenantThemeId);
    
    // Apply branding
    if (config.branding) {
      this.applyBranding(config.branding);
    }
  }

  getTenantConfig(tenantId: string): TenantConfig | undefined {
    return this.tenantConfigs.get(tenantId);
  }

  getActiveTenant(): TenantConfig | undefined {
    return this.activeTenant ? this.tenantConfigs.get(this.activeTenant) : undefined;
  }

  private createTenantTheme(config: TenantConfig): void {
    const baseTheme = themeRegistry.get(config.theme);
    if (!baseTheme) {
      throw new Error(`Base theme '${config.theme}' not found for tenant '${config.id}'`);
    }

    // Merge base theme with tenant customizations
    const tenantTokens = config.customTokens 
      ? this.mergeTokens(baseTheme.tokens, config.customTokens)
      : baseTheme.tokens;

    // Generate tenant-specific colors from branding
    if (config.branding?.primaryColor || config.branding?.secondaryColor) {
      tenantTokens.colors = this.generateBrandColors(
        tenantTokens.colors,
        config.branding
      );
    }

    const tenantTheme: Theme = {
      ...baseTheme,
      id: `${baseTheme.id}-${config.id}`,
      name: `${baseTheme.name} (${config.name})`,
      tokens: tenantTokens,
      metadata: {
        ...baseTheme.metadata,
        category: 'branded',
        tags: [...(baseTheme.metadata.tags || []), 'tenant', config.id],
      },
      compliance: config.compliance || baseTheme.compliance,
    };

    themeRegistry.register(tenantTheme);
  }

  private generateBrandColors(
    baseColors: any,
    branding: BrandingConfig
  ): any {
    const colors = { ...baseColors };

    if (branding.primaryColor) {
      colors.primary = this.generateColorScale(branding.primaryColor);
      colors.action.primary = {
        background: branding.primaryColor,
        text: this.getContrastColor(branding.primaryColor),
        hover: this.darkenColor(branding.primaryColor, 0.1),
      };
    }

    if (branding.secondaryColor) {
      colors.secondary = this.generateColorScale(branding.secondaryColor);
    }

    return colors;
  }

  private applyBranding(branding: BrandingConfig): void {
    if (typeof document === 'undefined') return;

    // Update favicon
    if (branding.favicon) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = branding.favicon;
      }
    }

    // Inject custom CSS
    if (branding.customCSS) {
      const existingStyle = document.getElementById('tenant-custom-css');
      if (existingStyle) {
        existingStyle.remove();
      }

      const style = document.createElement('style');
      style.id = 'tenant-custom-css';
      style.textContent = branding.customCSS;
      document.head.appendChild(style);
    }
  }
}

export const tenantThemeManager = new TenantThemeManager();

// Hook for tenant theming
export function useTenantTheme(): {
  tenant?: TenantConfig;
  setTenant: (tenantId: string) => void;
  availableTenants: TenantConfig[];
} {
  const [currentTenant, setCurrentTenant] = useState<TenantConfig>();

  const setTenant = useCallback((tenantId: string) => {
    tenantThemeManager.setActiveTenant(tenantId);
    setCurrentTenant(tenantThemeManager.getActiveTenant());
  }, []);

  const availableTenants = useMemo(() => {
    return Array.from(tenantThemeManager['tenantConfigs'].values());
  }, []);

  useEffect(() => {
    setCurrentTenant(tenantThemeManager.getActiveTenant());
  }, []);

  return {
    tenant: currentTenant,
    setTenant,
    availableTenants,
  };
}
```

## Platform-Specific Themes

### Platform Adaptation System

Automatic theme adaptation based on platform:

```typescript
export interface PlatformThemeAdapter {
  adapt(theme: Theme, platform: string): Theme;
  getPlatformSpecificTokens(platform: string): Partial<DesignTokens>;
}

export class DefaultPlatformAdapter implements PlatformThemeAdapter {
  adapt(theme: Theme, platform: string): Theme {
    const platformTokens = this.getPlatformSpecificTokens(platform);
    
    if (Object.keys(platformTokens).length === 0) {
      return theme;
    }

    return {
      ...theme,
      tokens: this.mergeTokens(theme.tokens, platformTokens),
      metadata: {
        ...theme.metadata,
        tags: [...(theme.metadata.tags || []), `platform-${platform}`],
      },
    };
  }

  getPlatformSpecificTokens(platform: string): Partial<DesignTokens> {
    switch (platform) {
      case 'mobile':
        return {
          spacing: {
            xs: '6px',
            sm: '12px',
            md: '20px',
            lg: '28px',
            xl: '36px',
          },
          typography: {
            fontSize: {
              sm: { size: '16px', lineHeight: '24px' }, // Larger for mobile
              base: { size: '18px', lineHeight: '26px' },
              lg: { size: '20px', lineHeight: '28px' },
            },
          },
          components: {
            button: {
              minHeight: '48px', // Touch target
              padding: '12px 20px',
            },
          },
        };

      case 'tablet':
        return {
          spacing: {
            xs: '5px',
            sm: '10px',
            md: '18px',
            lg: '26px',
            xl: '34px',
          },
          typography: {
            fontSize: {
              sm: { size: '15px', lineHeight: '22px' },
              base: { size: '17px', lineHeight: '25px' },
              lg: { size: '19px', lineHeight: '27px' },
            },
          },
        };

      case 'desktop':
      default:
        return {}; // Use base theme as-is
    }
  }

  private mergeTokens(base: DesignTokens, override: Partial<DesignTokens>): DesignTokens {
    // Deep merge implementation
    return this.deepMerge(base, override);
  }
}

export const platformAdapter = new DefaultPlatformAdapter();

// Hook for platform-aware theming
export function usePlatformTheme(): {
  platform: string;
  adaptedTheme: Theme;
} {
  const { theme } = useTheme();
  const [platform, setPlatform] = useState('desktop');

  // Detect platform
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detectPlatform = (): string => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      if (/ipad|tablet/.test(userAgent)) return 'tablet';
      if (/iphone|ipod|android.*mobile/.test(userAgent)) return 'mobile';
      return 'desktop';
    };

    setPlatform(detectPlatform());

    // Listen for orientation changes
    const handleOrientationChange = () => {
      setPlatform(detectPlatform());
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  const adaptedTheme = useMemo(() => {
    return platformAdapter.adapt(theme, platform);
  }, [theme, platform]);

  return { platform, adaptedTheme };
}
```

## Theme Customization

### Visual Theme Editor

System for visual theme customization:

```typescript
export interface ThemeEditorState {
  readonly baseTheme: Theme;
  readonly modifications: Partial<DesignTokens>;
  readonly previewMode: boolean;
}

export class VisualThemeEditor {
  private state: ThemeEditorState;
  private subscribers = new Set<(state: ThemeEditorState) => void>();

  constructor(baseTheme: Theme) {
    this.state = {
      baseTheme,
      modifications: {},
      previewMode: false,
    };
  }

  updateColor(path: string, color: string): void {
    const modifications = { ...this.state.modifications };
    this.setNestedValue(modifications, path, color);
    
    this.updateState({
      modifications,
    });
  }

  updateSpacing(scale: number): void {
    const baseSpacing = this.state.baseTheme.tokens.spacing;
    const scaledSpacing = {};
    
    Object.entries(baseSpacing).forEach(([key, value]) => {
      const numericValue = parseFloat(value);
      const unit = value.replace(numericValue.toString(), '');
      scaledSpacing[key] = `${numericValue * scale}${unit}`;
    });

    this.updateState({
      modifications: {
        ...this.state.modifications,
        spacing: scaledSpacing,
      },
    });
  }

  updateTypography(fontFamily: string, sizeScale: number): void {
    const baseFontSizes = this.state.baseTheme.tokens.typography.fontSize;
    const scaledFontSizes = {};
    
    Object.entries(baseFontSizes).forEach(([key, value]) => {
      if (typeof value === 'object' && 'size' in value) {
        const numericSize = parseFloat(value.size);
        const unit = value.size.replace(numericSize.toString(), '');
        scaledFontSizes[key] = {
          ...value,
          size: `${numericSize * sizeScale}${unit}`,
        };
      }
    });

    this.updateState({
      modifications: {
        ...this.state.modifications,
        typography: {
          ...this.state.modifications.typography,
          fontFamily: { sans: [fontFamily, 'sans-serif'] },
          fontSize: scaledFontSizes,
        },
      },
    });
  }

  setPreviewMode(enabled: boolean): void {
    this.updateState({ previewMode: enabled });
  }

  exportTheme(): Theme {
    const mergedTokens = this.mergeTokens(
      this.state.baseTheme.tokens,
      this.state.modifications
    );

    return {
      ...this.state.baseTheme,
      id: `${this.state.baseTheme.id}-custom`,
      name: `${this.state.baseTheme.name} (Custom)`,
      tokens: mergedTokens,
      metadata: {
        ...this.state.baseTheme.metadata,
        category: 'custom',
        created: Date.now(),
        updated: Date.now(),
      },
    };
  }

  reset(): void {
    this.updateState({
      modifications: {},
      previewMode: false,
    });
  }

  subscribe(callback: (state: ThemeEditorState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private updateState(updates: Partial<ThemeEditorState>): void {
    this.state = { ...this.state, ...updates };
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Theme editor subscriber error:', error);
      }
    });
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }
}

// Hook for theme editing
export function useThemeEditor(baseTheme?: Theme): {
  editor: VisualThemeEditor;
  state: ThemeEditorState;
  previewTheme: Theme;
} {
  const { theme } = useTheme();
  const [editor] = useState(() => new VisualThemeEditor(baseTheme || theme));
  const [state, setState] = useState<ThemeEditorState>(editor['state']);

  useEffect(() => {
    return editor.subscribe(setState);
  }, [editor]);

  const previewTheme = useMemo(() => {
    if (Object.keys(state.modifications).length === 0) {
      return state.baseTheme;
    }
    
    return {
      ...state.baseTheme,
      tokens: editor['mergeTokens'](state.baseTheme.tokens, state.modifications),
    };
  }, [editor, state]);

  return { editor, state, previewTheme };
}
```

## Performance Optimization

### Theme Caching

Efficient caching system for resolved themes:

```typescript
export interface ThemeCacheEntry {
  readonly theme: Theme;
  readonly tokens: ResolvedTokens;
  readonly context: TokenResolutionContext;
  readonly timestamp: number;
  readonly accessCount: number;
}

export class ThemeCache {
  private cache = new Map<string, ThemeCacheEntry>();
  private maxSize = 50;
  private ttl = 5 * 60 * 1000; // 5 minutes

  get(key: string): ThemeCacheEntry | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;
    
    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    // Update access count
    this.cache.set(key, {
      ...entry,
      accessCount: entry.accessCount + 1,
    });
    
    return entry;
  }

  set(key: string, entry: Omit<ThemeCacheEntry, 'timestamp' | 'accessCount'>): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed();
    }
    
    this.cache.set(key, {
      ...entry,
      timestamp: Date.now(),
      accessCount: 1,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = Infinity;
    let lowestAccess = Infinity;
    
    this.cache.forEach((entry, key) => {
      if (entry.accessCount < lowestAccess || 
          (entry.accessCount === lowestAccess && entry.timestamp < oldestTime)) {
        oldestKey = key;
        oldestTime = entry.timestamp;
        lowestAccess = entry.accessCount;
      }
    });
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  getCacheKey(theme: Theme, context: TokenResolutionContext): string {
    const contextHash = this.hashContext(context);
    return `${theme.id}:${theme.version}:${contextHash}`;
  }

  private hashContext(context: TokenResolutionContext): string {
    const serialized = JSON.stringify({
      platform: context.platform,
      locale: context.locale,
      userPreferences: context.userPreferences,
      complianceRequirements: context.complianceRequirements,
    });
    
    // Simple hash implementation
    let hash = 0;
    for (let i = 0; i < serialized.length; i++) {
      const char = serialized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return hash.toString(36);
  }
}

export const themeCache = new ThemeCache();

// Enhanced token resolver with caching
export class CachedTokenResolver extends TokenResolver {
  resolve(context: TokenResolutionContext): ResolvedTokens {
    const cacheKey = themeCache.getCacheKey(context.theme, context);
    const cached = themeCache.get(cacheKey);
    
    if (cached) {
      return cached.tokens;
    }
    
    const resolvedTokens = super.resolve(context);
    
    themeCache.set(cacheKey, {
      theme: context.theme,
      tokens: resolvedTokens,
      context,
    });
    
    return resolvedTokens;
  }
}
```

## Norwegian Compliance

### Security Classification Integration

NSM security classification integration:

```typescript
export interface SecurityClassificationConfig {
  readonly level: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly marking?: string;
  readonly handling?: string[];
  readonly visualization?: {
    readonly backgroundColor?: string;
    readonly textColor?: string;
    readonly borderColor?: string;
    readonly watermark?: boolean;
  };
}

export function createSecurityCompliantTheme(
  baseTheme: Theme,
  classification: SecurityClassificationConfig
): Theme {
  const securityTokens: Partial<DesignTokens> = {};
  
  // Apply security classification visual indicators
  if (classification.visualization) {
    const viz = classification.visualization;
    
    securityTokens.colors = {
      ...baseTheme.tokens.colors,
      security: {
        classification: {
          background: viz.backgroundColor || getClassificationColor(classification.level),
          text: viz.textColor || getClassificationTextColor(classification.level),
          border: viz.borderColor || getClassificationBorderColor(classification.level),
        },
      },
    };
  }
  
  // Add security-specific component tokens
  securityTokens.components = {
    ...baseTheme.tokens.components,
    securityBanner: {
      background: securityTokens.colors?.security?.classification?.background,
      text: securityTokens.colors?.security?.classification?.text,
      height: '32px',
      fontSize: '14px',
      fontWeight: 'bold',
    },
  };
  
  return {
    ...baseTheme,
    id: `${baseTheme.id}-${classification.level.toLowerCase()}`,
    name: `${baseTheme.name} (${classification.level})`,
    tokens: mergeDeep(baseTheme.tokens, securityTokens),
    compliance: {
      ...baseTheme.compliance,
      nsmClassification: classification.level,
      auditTrail: classification.level !== 'OPEN',
    },
    metadata: {
      ...baseTheme.metadata,
      tags: [...(baseTheme.metadata.tags || []), 'security', classification.level],
    },
  };
}

function getClassificationColor(level: string): string {
  switch (level) {
    case 'SECRET': return '#ff0000';
    case 'CONFIDENTIAL': return '#ff6600';
    case 'RESTRICTED': return '#ffcc00';
    case 'OPEN': 
    default: return '#00cc00';
  }
}

// Hook for security-compliant theming
export function useSecurityCompliantTheme(): {
  setClassification: (config: SecurityClassificationConfig) => void;
  classification?: SecurityClassificationConfig;
  isSecurityCompliant: boolean;
} {
  const { theme, setTheme } = useTheme();
  const [classification, setClassificationState] = useState<SecurityClassificationConfig>();

  const setClassification = useCallback((config: SecurityClassificationConfig) => {
    const secureTheme = createSecurityCompliantTheme(theme, config);
    themeRegistry.register(secureTheme);
    setTheme(secureTheme.id);
    setClassificationState(config);
  }, [theme, setTheme]);

  const isSecurityCompliant = useMemo(() => {
    return !!theme.compliance?.nsmClassification;
  }, [theme]);

  return {
    setClassification,
    classification,
    isSecurityCompliant,
  };
}
```

## Conclusion

The UI System v5.0 theming architecture provides a comprehensive, enterprise-grade solution for dynamic theming with Norwegian compliance support. The token-based approach ensures consistency, performance, and flexibility while meeting the strictest enterprise and regulatory requirements.

### Key Benefits

- **🎨 Dynamic Theming**: Runtime theme switching without rebuilds
- **🏢 Multi-Tenant Support**: Isolated, branded themes per tenant
- **📱 Platform Adaptation**: Automatic platform-specific optimizations
- **🛡️ Compliance Ready**: Built-in Norwegian regulatory compliance
- **⚡ High Performance**: Optimized for enterprise-scale applications
- **🔧 Developer Friendly**: Intuitive APIs and comprehensive tooling

The architecture scales from simple theme switching to complex multi-tenant scenarios while maintaining performance and compliance standards throughout.