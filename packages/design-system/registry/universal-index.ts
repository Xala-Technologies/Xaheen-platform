/**
 * Universal Registry Index
 * Platform-agnostic exports for all supported frameworks
 */

import { UniversalTokens } from './core/universal-tokens';
import { COMPONENT_REGISTRY, Platform, ComponentId } from './core/component-specs';

// =============================================================================
// CORE EXPORTS (Platform Independent)
// =============================================================================

// Universal specifications
export * from './core/component-specs';
export * from './core/universal-tokens';

// Component generator
export * from './templates/component-generator';

// Metadata and configuration
export { COMPONENT_REGISTRY, type ComponentId } from './core/component-specs';
export type { Platform, BaseComponentSpec, PropSpec, VariantSpec } from './core/component-specs';

// =============================================================================
// PLATFORM-SPECIFIC EXPORTS
// =============================================================================

/**
 * Platform Detection Utility
 */
export const detectPlatform = (): Platform => {
  // Browser environment detection
  if (typeof window !== 'undefined') {
    // Check for framework-specific globals
    if ('Vue' in window) return 'vue';
    if ('angular' in window) return 'angular';
    if ('Svelte' in window || '__SVELTE__' in window) return 'svelte';
    
    // Check for Next.js
    if ('__NEXT_DATA__' in window) return 'nextjs';
    
    // Default to React for browser
    return 'react';
  }
  
  // Node.js environment detection
  if (typeof process !== 'undefined' && process.versions?.node) {
    // Check for React Native
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      return 'react-native';
    }
    
    // Check for Electron
    if (process.versions.electron) return 'electron';
    
    // Check for package.json dependencies (simplified)
    try {
      const pkg = await import('../../package.json');
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (deps['@angular/core']) return 'angular';
      if (deps['vue']) return 'vue';
      if (deps['svelte']) return 'svelte';
      if (deps['next']) return 'nextjs';
      if (deps['nuxt']) return 'nuxt';
      if (deps['@sveltejs/kit']) return 'sveltekit';
      if (deps['react-native']) return 'react-native';
      if (deps['@ionic/react'] || deps['@ionic/angular']) return 'ionic';
      
      // Default to React
      return 'react';
    } catch {
      return 'react';
    }
  }
  
  return 'vanilla';
};

/**
 * Platform-Specific Component Loaders
 */
export const createPlatformLoader = (platform: Platform) => {
  const loaders = {
    react: () => ({
      Accordion: () => import('./platforms/react/accordion').then(m => m.Accordion),
      Alert: () => import('./components/alert/alert').then(m => m.Alert),
      AspectRatio: () => import('./components/aspect-ratio/aspect-ratio').then(m => m.AspectRatio),
      Avatar: () => import('./components/avatar/avatar').then(m => m.Avatar),
      Badge: () => import('./components/badge/badge').then(m => m.Badge),
      Breadcrumb: () => import('./components/breadcrumb/breadcrumb').then(m => m.Breadcrumb),
      Button: () => import('./platforms/react/button').then(m => m.Button),
      Calendar: () => import('./components/calendar/calendar').then(m => m.Calendar),
      Card: () => import('./platforms/react/card').then(m => m.Card),
      Chart: () => import('./components/chart/chart').then(m => m.Chart),
      Checkbox: () => import('./components/checkbox/checkbox').then(m => m.Checkbox),
      Collapsible: () => import('./components/collapsible/collapsible').then(m => m.Collapsible),
      Combobox: () => import('./components/combobox/combobox').then(m => m.Combobox),
      Dialog: () => import('./components/dialog/dialog').then(m => m.Dialog),
      DropdownMenu: () => import('./components/dropdown-menu/dropdown-menu').then(m => m.DropdownMenu),
      Form: () => import('./components/form/form').then(m => m.Form),
      HoverCard: () => import('./components/hover-card/hover-card').then(m => m.HoverCard),
      Input: () => import('./platforms/react/input').then(m => m.Input),
      Label: () => import('./components/label/label').then(m => m.Label),
      NavigationMenu: () => import('./components/navigation-menu/navigation-menu').then(m => m.NavigationMenu),
      Pagination: () => import('./components/pagination/pagination').then(m => m.Pagination),
      Popover: () => import('./components/popover/popover').then(m => m.Popover),
      Progress: () => import('./components/progress/progress').then(m => m.Progress),
      RadioGroup: () => import('./components/radio-group/radio-group').then(m => m.RadioGroup),
      Select: () => import('./components/select/select').then(m => m.Select),
      Separator: () => import('./components/separator/separator').then(m => m.Separator),
      Sheet: () => import('./components/sheet/sheet').then(m => m.Sheet),
      Skeleton: () => import('./components/skeleton/skeleton').then(m => m.Skeleton),
      Slider: () => import('./components/slider/slider').then(m => m.Slider),
      Switch: () => import('./components/switch/switch').then(m => m.Switch),
      Table: () => import('./components/table/table').then(m => m.Table),
      Tabs: () => import('./components/tabs/tabs').then(m => m.Tabs),
      Textarea: () => import('./components/textarea/textarea').then(m => m.Textarea),
      Toast: () => import('./components/toast/toast').then(m => m.Toast),
      Toggle: () => import('./components/toggle/toggle').then(m => m.Toggle),
      Tooltip: () => import('./components/tooltip/tooltip').then(m => m.Tooltip),
      // Blocks
      LoginForm: () => import('./blocks/login-form/login-form').then(m => m.LoginForm),
      Authentication01: () => import('./blocks/authentication-01/authentication-01').then(m => m.Authentication01),
      Authentication02: () => import('./blocks/authentication-02/authentication-02').then(m => m.Authentication02),
      CommandPalette: () => import('./blocks/command-palette/command-palette').then(m => m.CommandPalette),
      DataTableAdvanced: () => import('./blocks/data-table-advanced/data-table-advanced').then(m => m.DataTableAdvanced),
      Profile01: () => import('./blocks/profile-01/profile-01').then(m => m.Profile01),
      Settings01: () => import('./blocks/settings-01/settings-01').then(m => m.Settings01),
    }),
    
    'react-native': () => ({
      Accordion: () => import('./platforms/react-native/Accordion').then(m => m.Accordion),
      Button: () => import('./platforms/react-native/Button').then(m => m.Button),
      Input: () => import('./platforms/react-native/Input').then(m => m.Input),
      Card: () => import('./platforms/react-native/Card').then(m => m.Card),
    }),
    
    vue: () => ({
      Accordion: () => import('./platforms/vue/Accordion.vue').then(m => m.default),
      Button: () => import('./platforms/vue/Button.vue').then(m => m.default),
      Input: () => import('./platforms/vue/Input.vue').then(m => m.default),
      Card: () => import('./platforms/vue/Card.vue').then(m => m.default),
    }),
    
    angular: () => ({
      Accordion: () => import('./platforms/angular/accordion.component').then(m => m.AccordionComponent),
      Button: () => import('./platforms/angular/button.component').then(m => m.ButtonComponent),
      Input: () => import('./platforms/angular/input.component').then(m => m.InputComponent),
      Card: () => import('./platforms/angular/card.component').then(m => m.CardComponent),
    }),
    
    svelte: () => ({
      Accordion: () => import('./platforms/svelte/Accordion.svelte').then(m => m.default),
      Button: () => import('./platforms/svelte/Button.svelte').then(m => m.default),
      Input: () => import('./platforms/svelte/Input.svelte').then(m => m.default),
      Card: () => import('./platforms/svelte/Card.svelte').then(m => m.default),
    }),
    
    // Platform-specific implementations
    electron: () => ({
      Accordion: () => import('./platforms/electron/accordion').then(m => m.Accordion),
      Button: () => import('./platforms/electron/button').then(m => m.Button),
      Input: () => import('./platforms/electron/input').then(m => m.Input),
      Card: () => import('./platforms/electron/card').then(m => m.Card),
      WindowControls: () => import('./platforms/electron/window-controls').then(m => m.WindowControls),
      NativeMenus: () => import('./platforms/electron/native-menus').then(m => m.NativeMenus),
      FileSystemAccess: () => import('./platforms/electron/file-system-access').then(m => m.FileSystemAccess),
    }),
    
    ionic: () => ({
      Accordion: () => import('./platforms/ionic/accordion').then(m => m.Accordion),
      Button: () => import('./platforms/ionic/button').then(m => m.Button),
      Input: () => import('./platforms/ionic/input').then(m => m.Input),
      Card: () => import('./platforms/ionic/card').then(m => m.Card),
      Provider: () => import('./platforms/ionic/provider').then(m => m.IonicProvider),
    }),
    
    vanilla: () => ({
      Accordion: () => import('./platforms/vanilla/accordion').then(m => m.Accordion),
      Button: () => import('./platforms/vanilla/button').then(m => m.Button),
      Input: () => import('./platforms/vanilla/input').then(m => m.Input),
      Card: () => import('./platforms/vanilla/card').then(m => m.Card),
    }),
    
    'headless-ui': () => ({
      Accordion: () => import('./platforms/headless-ui/accordion').then(m => m.Accordion),
      Button: () => import('./platforms/headless-ui/button').then(m => m.Button),
      Input: () => import('./platforms/headless-ui/input').then(m => m.Input),
      Card: () => import('./platforms/headless-ui/card').then(m => m.Card),
    }),
    
    radix: () => ({
      Accordion: () => import('./platforms/radix/accordion').then(m => m.Accordion),
      Button: () => import('./platforms/radix/button').then(m => m.Button),
      Input: () => import('./platforms/radix/input').then(m => m.Input),
      Card: () => import('./platforms/radix/card').then(m => m.Card),
    }),
    
    // Framework variants use their base framework
    nextjs: () => loaders.react(),
    nuxt: () => loaders.vue(),
    sveltekit: () => loaders.svelte(),
    expo: () => loaders['react-native'](),
  };
  
  return loaders[platform] || loaders.vanilla;
};

/**
 * Auto-detect platform and load appropriate components
 */
export const createAutoLoader = () => {
  const platform = detectPlatform();
  return createPlatformLoader(platform);
};

// =============================================================================
// UNIVERSAL COMPONENT FACTORY
// =============================================================================

/**
 * Universal Component Factory
 * Creates components for the current platform automatically
 */
export class UniversalComponentFactory {
  private platform: Platform;
  private componentCache = new Map<string, unknown>();
  
  constructor(platform?: Platform) {
    this.platform = platform || detectPlatform();
  }
  
  /**
   * Get component for current platform
   */
  async getComponent<T = unknown>(componentId: ComponentId): Promise<T> {
    const cacheKey = `${this.platform}-${componentId}`;
    
    if (this.componentCache.has(cacheKey)) {
      return this.componentCache.get(cacheKey) as T;
    }
    
    const loader = createPlatformLoader(this.platform);
    const componentLoaders = loader();
    
    if (componentId in componentLoaders) {
      const componentLoader = componentLoaders[componentId as keyof typeof componentLoaders];
      const component = await componentLoader();
      
      this.componentCache.set(cacheKey, component);
      return component;
    }
    
    throw new Error(`Component '${componentId}' not found for platform '${this.platform}'`);
  }
  
  /**
   * Get all available components for current platform
   */
  async getAllComponents(): Promise<Record<string, unknown>> {
    const loader = createPlatformLoader(this.platform);
    const componentLoaders = loader();
    
    const components: Record<string, unknown> = {};
    
    for (const [name, loader] of Object.entries(componentLoaders)) {
      try {
        components[name] = await loader();
      } catch (error) {
        console.warn(`Failed to load component '${name}' for platform '${this.platform}':`, error);
      }
    }
    
    return components;
  }
  
  /**
   * Check if component is available for current platform
   */
  isComponentAvailable(componentId: ComponentId): boolean {
    const spec = COMPONENT_REGISTRY[componentId];
    return spec ? spec.platforms.includes(this.platform) : false;
  }
  
  /**
   * Get platform information
   */
  getPlatformInfo() {
    return {
      current: this.platform,
      available: Object.keys(createPlatformLoader(this.platform)()) as ComponentId[],
      supported: Object.values(COMPONENT_REGISTRY).filter(spec => 
        spec.platforms.includes(this.platform)
      ).map(spec => spec.id as ComponentId)
    };
  }
}

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

// Create default factory instance
export const componentFactory = new UniversalComponentFactory();

// Platform-specific utilities
export const PlatformUtils = {
  detect: detectPlatform,
  createLoader: createPlatformLoader,
  createAutoLoader,
  isReactBased: (platform: Platform) => 
    ['react', 'nextjs', 'electron', 'react-native', 'expo', 'ionic', 'radix', 'headless-ui'].includes(platform),
  isWebBased: (platform: Platform) =>
    ['react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'sveltekit', 'vanilla', 'electron', 'ionic', 'radix', 'headless-ui'].includes(platform),
  isMobileBased: (platform: Platform) =>
    ['react-native', 'expo', 'ionic'].includes(platform),
  isDesktopBased: (platform: Platform) =>
    ['electron'].includes(platform),
  isVanillaBased: (platform: Platform) =>
    ['vanilla'].includes(platform),
  getBasePlatform: (platform: Platform) => {
    const baseMappings: Record<string, Platform> = {
      'nextjs': 'react',
      'nuxt': 'vue',
      'sveltekit': 'svelte',
      'expo': 'react-native',
      'headless-ui': 'react',
      'radix': 'react'
    };
    return baseMappings[platform] || platform;
  },
  getSupportedComponents: (platform: Platform) => {
    const loader = createPlatformLoader(platform);
    return Object.keys(loader());
  }
};

// Token utilities for all platforms
export const TokenUtils = {
  // Convert tokens for web (CSS custom properties)
  toCSS: (tokens: Record<string, unknown>, prefix = '--xaheen') => 
    UniversalTokens.converters.toCSSVariables(tokens, prefix),
    
  // Convert tokens for React Native
  toReactNative: (tokens: Record<string, unknown>) =>
    UniversalTokens.converters.toReactNative(tokens as any),
    
  // Convert tokens to JavaScript object
  toJS: (tokens: Record<string, unknown>) =>
    UniversalTokens.converters.toJSTheme(tokens as any),
    
  // Get platform-specific token format
  forPlatform: (platform: Platform, tokens: Record<string, unknown>) => {
    if (PlatformUtils.isMobileBased(platform)) {
      return TokenUtils.toReactNative(tokens);
    }
    
    if (PlatformUtils.isWebBased(platform)) {
      return TokenUtils.toCSS(tokens);
    }
    
    return TokenUtils.toJS(tokens);
  }
};

// =============================================================================
// DEFAULT EXPORTS
// =============================================================================

export default {
  componentFactory,
  PlatformUtils,
  TokenUtils,
  UniversalTokens,
  COMPONENT_REGISTRY,
  ComponentGenerator: () => import('./templates/component-generator').then(m => m.ComponentGenerator)
};