/**
 * Registry Configuration
 * Defines registry URLs and fallback mechanisms
 */

export interface RegistryConfig {
  readonly primary: string;
  readonly fallback: string;
  readonly local?: string;
  readonly npm?: string;
  readonly timeout: number;
}

export const REGISTRY_CONFIG: RegistryConfig = {
  // Primary registry URL - Use unpkg CDN for published package
  primary: 'https://unpkg.com/@xaheen-ai/design-system/public/r',
  
  // Fallback registry URL - Direct GitHub raw content
  fallback: 'https://raw.githubusercontent.com/xaheen/design-system/main/packages/design-system/public/r',
  
  // Local development registry (when developing)
  local: process.env.XAHEEN_LOCAL_REGISTRY,
  
  // NPM package registry for direct imports
  npm: '@xaheen-ai/design-system',
  
  // Request timeout in milliseconds
  timeout: 10000,
};

/**
 * Get the appropriate registry URL based on environment
 */
export function getRegistryUrl(): string {
  // Check for local development
  if (process.env.NODE_ENV === 'development' && REGISTRY_CONFIG.local) {
    return REGISTRY_CONFIG.local;
  }
  
  // Check for custom registry URL from environment
  if (process.env.XAHEEN_REGISTRY_URL) {
    return process.env.XAHEEN_REGISTRY_URL;
  }
  
  // Use primary registry by default
  return REGISTRY_CONFIG.primary;
}

/**
 * Registry endpoints
 */
export const REGISTRY_ENDPOINTS = {
  index: '/index.json',
  component: (name: string) => `/${name}.json`,
  platform: (platform: string, component: string) => `/platforms/${platform}/${component}.json`,
  platformIndex: (platform: string) => `/platforms/${platform}/index.json`,
} as const;