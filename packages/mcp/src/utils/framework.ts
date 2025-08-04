/**
 * Framework detection utility for xala-mcp
 */

export type SupportedFramework = 'react' | 'vue' | 'angular' | 'svelte' | 'nextjs' | 'nuxt' | 'sveltekit';

/**
 * Detect the current framework based on package.json dependencies
 * Falls back to 'react' if detection fails
 */
export function getFramework(): SupportedFramework {
  try {
    // Try to read package.json from current working directory
    const fs = require('fs');
    const path = require('path');
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Check for framework-specific dependencies
      if (dependencies['next']) return 'nextjs';
      if (dependencies['nuxt']) return 'nuxt';
      if (dependencies['@sveltejs/kit']) return 'sveltekit';
      if (dependencies['svelte']) return 'svelte';
      if (dependencies['@angular/core']) return 'angular';
      if (dependencies['vue']) return 'vue';
      if (dependencies['react']) return 'react';
    }
  } catch (error) {
    // Silently fall back to default
  }
  
  // Default to React
  return 'react';
}

/**
 * Get framework-specific configuration
 */
export function getFrameworkConfig(framework: SupportedFramework) {
  const configs = {
    react: {
      fileExtension: '.tsx',
      componentWrapper: 'React.FC',
      stateManagement: 'React hooks',
      router: 'React Router',
    },
    nextjs: {
      fileExtension: '.tsx',
      componentWrapper: 'Next.js component',
      stateManagement: 'React hooks + Next.js',
      router: 'Next.js App Router',
    },
    vue: {
      fileExtension: '.vue',
      componentWrapper: 'Vue component',
      stateManagement: 'Vue Composition API',
      router: 'Vue Router',
    },
    nuxt: {
      fileExtension: '.vue',
      componentWrapper: 'Nuxt component',
      stateManagement: 'Vue Composition API + Nuxt',
      router: 'Nuxt Router',
    },
    angular: {
      fileExtension: '.component.ts',
      componentWrapper: 'Angular component',
      stateManagement: 'Angular services',
      router: 'Angular Router',
    },
    svelte: {
      fileExtension: '.svelte',
      componentWrapper: 'Svelte component',
      stateManagement: 'Svelte runes',
      router: 'SvelteKit routing',
    },
    sveltekit: {
      fileExtension: '.svelte',
      componentWrapper: 'SvelteKit component',
      stateManagement: 'Svelte runes + SvelteKit',
      router: 'SvelteKit App Router',
    },
  };
  
  return configs[framework] || configs.react;
}