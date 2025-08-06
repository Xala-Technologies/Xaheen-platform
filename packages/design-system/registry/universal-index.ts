/**
 * Universal Registry Index
 * Platform-agnostic exports for all supported frameworks
 */

import { UniversalTokens } from './core/universal-tokens';
import { COMPONENT_REGISTRY } from './core/component-specs';

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
      const pkg = require('../../package.json');
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
      Button: () => import('./platforms/react/button').then(m => m.Button),
      Input: () => import('./platforms/react/input').then(m => m.Input),
    }),
    
    'react-native': () => ({
      Button: () => import('./platforms/react-native/Button').then(m => m.Button),
      Input: () => import('./platforms/react-native/Input').then(m => m.Input),
    }),
    
    vue: () => ({
      Button: () => import('./platforms/vue/Button.vue').then(m => m.default),
      Input: () => import('./platforms/vue/Input.vue').then(m => m.default),
    }),
    
    angular: () => ({
      Button: () => import('./platforms/angular/button.component').then(m => m.ButtonComponent),
      Input: () => import('./platforms/angular/input.component').then(m => m.InputComponent),
    }),
    
    svelte: () => ({
      Button: () => import('./platforms/svelte/Button.svelte').then(m => m.default),
      Input: () => import('./platforms/svelte/Input.svelte').then(m => m.default),
    }),
    
    // Framework variants use their base framework
    nextjs: () => loaders.react(),
    electron: () => loaders.react(),
    nuxt: () => loaders.vue(),
    sveltekit: () => loaders.svelte(),
    expo: () => loaders['react-native'](),
    
    // Fallbacks
    vanilla: () => ({}),
    ionic: () => loaders.react(),
    radix: () => loaders.react(),
    'headless-ui': () => loaders.react()
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
  private componentCache = new Map<string, any>();
  
  constructor(platform?: Platform) {
    this.platform = platform || detectPlatform();
  }
  
  /**
   * Get component for current platform
   */
  async getComponent<T = any>(componentId: ComponentId): Promise<T> {
    const cacheKey = `${this.platform}-${componentId}`;
    
    if (this.componentCache.has(cacheKey)) {
      return this.componentCache.get(cacheKey);
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
  async getAllComponents(): Promise<Record<string, any>> {
    const loader = createPlatformLoader(this.platform);
    const componentLoaders = loader();
    
    const components: Record<string, any> = {};
    
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
    ['react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'sveltekit', 'vanilla'].includes(platform),
  isMobileBased: (platform: Platform) =>
    ['react-native', 'expo', 'ionic'].includes(platform)
};

// Token utilities for all platforms
export const TokenUtils = {
  // Convert tokens for web (CSS custom properties)
  toCSS: (tokens: Record<string, any>, prefix = '--xaheen') => 
    UniversalTokens.converters.toCSSVariables(tokens, prefix),
    
  // Convert tokens for React Native
  toReactNative: (tokens: Record<string, any>) =>
    UniversalTokens.converters.toReactNative(tokens),
    
  // Convert tokens to JavaScript object
  toJS: (tokens: Record<string, any>) =>
    UniversalTokens.converters.toJSTheme(tokens),
    
  // Get platform-specific token format
  forPlatform: (platform: Platform, tokens: Record<string, any>) => {
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