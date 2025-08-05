/**
 * Framework Configuration for Phase 2 Testing
 * Defines framework-specific settings and expectations
 */

export interface FrameworkConfig {
  readonly name: string;
  readonly preset: string;
  readonly displayName: string;
  readonly buildTool: string;
  readonly devPort: number;
  readonly buildCommand: string;
  readonly devCommand: string;
  readonly startCommand?: string;
  readonly expectedFiles: readonly string[];
  readonly expectedDependencies: readonly string[];
  readonly expectedDevDependencies: readonly string[];
  readonly serverReadyPattern: RegExp;
  readonly features: readonly string[];
}

export const FRAMEWORK_CONFIGS: readonly FrameworkConfig[] = [
  {
    name: 'vue',
    preset: 'vite-vue',
    displayName: 'Vue 3 + Vite',
    buildTool: 'vite',
    devPort: 5173,
    buildCommand: 'build',
    devCommand: 'dev',
    expectedFiles: [
      'package.json',
      'vite.config.ts',
      'tsconfig.json',
      'tsconfig.node.json',
      'src/main.ts',
      'src/App.vue',
      'src/components/HelloWorld.vue',
      'src/style.css',
      'index.html',
      'public/vite.svg',
    ],
    expectedDependencies: [
      'vue',
      '@vitejs/plugin-vue',
    ],
    expectedDevDependencies: [
      'typescript',
      'vite',
      'vue-tsc',
      '@vue/tsconfig',
    ],
    serverReadyPattern: /Local:\s+http:\/\/localhost:\d+/,
    features: ['typescript', 'jsx', 'css-modules', 'hot-reload'],
  },
  {
    name: 'svelte',
    preset: 'sveltekit',
    displayName: 'SvelteKit',
    buildTool: 'vite',
    devPort: 5174,
    buildCommand: 'build',
    devCommand: 'dev',
    startCommand: 'preview',
    expectedFiles: [
      'package.json',
      'svelte.config.js',
      'vite.config.ts',
      'tsconfig.json',
      'src/app.html',
      'src/app.d.ts',
      'src/lib/index.ts',
      'src/routes/+page.svelte',
      'src/routes/+layout.svelte',
      'static/favicon.png',
    ],
    expectedDependencies: [
      '@sveltejs/kit',
      'svelte',
    ],
    expectedDevDependencies: [
      '@sveltejs/adapter-auto',
      '@sveltejs/vite-plugin-svelte',
      'typescript',
      'vite',
      'svelte-check',
      'tslib',
    ],
    serverReadyPattern: /Local:\s+http:\/\/localhost:\d+/,
    features: ['typescript', 'ssr', 'routing', 'layouts', 'hot-reload'],
  },
  {
    name: 'angular',
    preset: 'angular',
    displayName: 'Angular',
    buildTool: 'angular-cli',
    devPort: 4200,
    buildCommand: 'build',
    devCommand: 'serve',
    expectedFiles: [
      'package.json',
      'angular.json',
      'tsconfig.json',
      'tsconfig.app.json',
      'tsconfig.spec.json',
      'src/main.ts',
      'src/app/app.module.ts',
      'src/app/app.component.ts',
      'src/app/app.component.html',
      'src/app/app.component.css',
      'src/index.html',
      'src/styles.css',
    ],
    expectedDependencies: [
      '@angular/animations',
      '@angular/common',
      '@angular/compiler',
      '@angular/core',
      '@angular/forms',
      '@angular/platform-browser',
      '@angular/platform-browser-dynamic',
      '@angular/router',
      'rxjs',
      'tslib',
      'zone.js',
    ],
    expectedDevDependencies: [
      '@angular-devkit/build-angular',
      '@angular/cli',
      '@angular/compiler-cli',
      '@types/jasmine',
      'jasmine-core',
      'karma',
      'karma-chrome-launcher',
      'karma-coverage',
      'karma-jasmine',
      'karma-jasmine-html-reporter',
      'typescript',
    ],
    serverReadyPattern: /Angular Live Development Server.*?listening on localhost:\d+/,
    features: ['typescript', 'rxjs', 'dependency-injection', 'modules', 'hot-reload'],
  },
  {
    name: 'solid',
    preset: 'solid-vite',
    displayName: 'Solid + Vite',
    buildTool: 'vite',
    devPort: 5175,
    buildCommand: 'build',
    devCommand: 'dev',
    expectedFiles: [
      'package.json',
      'vite.config.ts',
      'tsconfig.json',
      'src/index.tsx',
      'src/App.tsx',
      'src/App.module.css',
      'src/logo.svg',
      'index.html',
    ],
    expectedDependencies: [
      'solid-js',
    ],
    expectedDevDependencies: [
      'typescript',
      'vite',
      'vite-plugin-solid',
      'solid-devtools',
    ],
    serverReadyPattern: /Local:\s+http:\/\/localhost:\d+/,
    features: ['typescript', 'jsx', 'fine-grained-reactivity', 'hot-reload'],
  },
  {
    name: 'remix',
    preset: 'remix',
    displayName: 'Remix',
    buildTool: 'remix',
    devPort: 3000,
    buildCommand: 'build',
    devCommand: 'dev',
    startCommand: 'start',
    expectedFiles: [
      'package.json',
      'remix.config.js',
      'tsconfig.json',
      'app/entry.client.tsx',
      'app/entry.server.tsx',
      'app/root.tsx',
      'app/routes/_index.tsx',
      'public/favicon.ico',
    ],
    expectedDependencies: [
      '@remix-run/node',
      '@remix-run/react',
      '@remix-run/serve',
      'isbot',
      'react',
      'react-dom',
    ],
    expectedDevDependencies: [
      '@remix-run/dev',
      '@types/react',
      '@types/react-dom',
      'typescript',
      'vite',
      'vite-tsconfig-paths',
    ],
    serverReadyPattern: /Remix App Server started at http:\/\/localhost:\d+/,
    features: ['typescript', 'ssr', 'nested-routing', 'data-loading', 'progressive-enhancement'],
  },
];

export function getFrameworkConfig(preset: string): FrameworkConfig | undefined {
  return FRAMEWORK_CONFIGS.find(config => config.preset === preset);
}

export function getAllFrameworkPresets(): readonly string[] {
  return FRAMEWORK_CONFIGS.map(config => config.preset);
}