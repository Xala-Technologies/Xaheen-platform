/**
 * Phase 2 Unit Tests - SvelteKit Preset
 * Tests for SvelteKit preset logic with mocked file system
 */

import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { vol } from 'memfs';
import { promises as fs } from 'fs';
import * as prompts from '@clack/prompts';
import { ScaffoldGenerator } from '../../../../src/generators/scaffold.generator';
import type { ScaffoldGeneratorOptions } from '../../../../src/generators/scaffold.generator';

// Mock modules
mock.module('fs', async () => {
  const memfs = await require('memfs');
  return memfs.fs.promises;
});

mock.module('@clack/prompts', () => ({
  intro: mock(() => {}),
  outro: mock(() => {}),
  cancel: mock(() => {}),
  isCancel: mock(() => {}).mockReturnValue(false),
  text: mock(() => {}),
  select: mock(() => {}),
  multiselect: mock(() => {}),
  confirm: mock(() => {}),
  spinner: mock(() => {}).mockReturnValue({
    start: mock(() => {}),
    stop: mock(() => {}),
    message: mock(() => {}),
  }),
}));

describe('Phase 2: SvelteKit Preset Unit Tests', () => {
  beforeEach(() => {
    vol.reset();
    mock.restore();
  });

  afterEach(() => {
    mock.restore();
  });

  describe('SvelteKit Project Generation', () => {
    it('should generate correct SvelteKit project structure', async () => {
      const projectName = 'test-sveltekit-app';
      const projectPath = `/tmp/${projectName}`;

      const options: ScaffoldGeneratorOptions = {
        name: projectName,
        frontend: 'sveltekit',
        typescript: true,
        dryRun: false,
      };

      const generator = new ScaffoldGenerator();
      const result = await generator.generate(options);

      expect(result.success).toBe(true);
      expect(result.filesGenerated).toBeGreaterThan(0);

      // Verify SvelteKit-specific files
      const files = vol.toJSON();
      const expectedFiles = [
        'package.json',
        'svelte.config.js',
        'vite.config.ts',
        'tsconfig.json',
        'src/app.html',
        'src/app.d.ts',
        'src/routes/+page.svelte',
        'src/routes/+layout.svelte',
      ];

      expectedFiles.forEach(file => {
        const fullPath = `${projectPath}/${file}`;
        expect(files[fullPath]).toBeDefined();
      });
    });

    it('should configure SvelteKit with TypeScript', async () => {
      const projectPath = '/tmp/sveltekit-ts';
      await fs.mkdir(projectPath, { recursive: true });

      const svelteConfig = `
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  }
};

export default config;`;

      await fs.writeFile(`${projectPath}/svelte.config.js`, svelteConfig);

      const config = await fs.readFile(`${projectPath}/svelte.config.js`, 'utf-8');
      expect(config).toContain('vitePreprocess');
      expect(config).toContain('@sveltejs/adapter-auto');
    });

    it('should create SvelteKit app.d.ts with proper types', async () => {
      const projectPath = '/tmp/sveltekit-types';
      await fs.mkdir(`${projectPath}/src`, { recursive: true });

      const appTypes = `
/// <reference types="@sveltejs/kit" />

declare global {
  namespace App {
    interface Error {
      message: string;
      code?: string;
    }
    interface Locals {
      user?: {
        id: string;
        email: string;
      };
    }
    interface PageData {}
    interface Platform {}
  }
}

export {};`;

      await fs.writeFile(`${projectPath}/src/app.d.ts`, appTypes);

      const types = await fs.readFile(`${projectPath}/src/app.d.ts`, 'utf-8');
      expect(types).toContain('namespace App');
      expect(types).toContain('interface Locals');
    });

    it('should generate SvelteKit routes with TypeScript', async () => {
      const projectPath = '/tmp/sveltekit-routes';
      await fs.mkdir(`${projectPath}/src/routes`, { recursive: true });

      // +page.svelte
      const pageContent = `
<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  interface ButtonProps {
    readonly label: string;
    readonly onClick?: () => void;
  }
  
  const handleClick = (): void => {
    console.log('Clicked!');
  };
</script>

<div class="max-w-4xl mx-auto p-8">
  <h1 class="text-3xl font-bold mb-6">Welcome to SvelteKit</h1>
  <button 
    on:click={handleClick}
    class="h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
  >
    Get Started
  </button>
</div>`;

      // +page.ts
      const pageLoadContent = `
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  return {
    title: 'Welcome to SvelteKit'
  };
};`;

      await fs.writeFile(`${projectPath}/src/routes/+page.svelte`, pageContent);
      await fs.writeFile(`${projectPath}/src/routes/+page.ts`, pageLoadContent);

      const page = await fs.readFile(`${projectPath}/src/routes/+page.svelte`, 'utf-8');
      const pageLoad = await fs.readFile(`${projectPath}/src/routes/+page.ts`, 'utf-8');

      expect(page).toContain('script lang="ts"');
      expect(page).toContain('export let data: PageData');
      expect(pageLoad).toContain('PageLoad');
    });

    it('should configure SvelteKit layouts', async () => {
      const projectPath = '/tmp/sveltekit-layouts';
      await fs.mkdir(`${projectPath}/src/routes`, { recursive: true });

      const layoutContent = `
<script lang="ts">
  import '../app.css';
  
  interface LayoutData {
    readonly user?: {
      readonly name: string;
      readonly email: string;
    };
  }
  
  export let data: LayoutData;
</script>

<div class="min-h-screen bg-gray-50">
  <nav class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <h1 class="text-xl font-semibold">SvelteKit App</h1>
      {#if data.user}
        <span class="text-gray-600">{data.user.name}</span>
      {/if}
    </div>
  </nav>
  
  <main class="max-w-7xl mx-auto p-8">
    <slot />
  </main>
</div>`;

      await fs.writeFile(`${projectPath}/src/routes/+layout.svelte`, layoutContent);

      const layout = await fs.readFile(`${projectPath}/src/routes/+layout.svelte`, 'utf-8');
      expect(layout).toContain('<slot />');
      expect(layout).toContain('interface LayoutData');
    });
  });

  describe('SvelteKit Features', () => {
    it('should handle SvelteKit adapter selection', async () => {
      (prompts.select as any).mockResolvedValueOnce('adapter-node');

      const options: ScaffoldGeneratorOptions = {
        name: 'sveltekit-node',
        frontend: 'sveltekit',
        adapter: 'node',
        typescript: true,
      };

      const generator = new ScaffoldGenerator();
      const result = await generator.generate(options);

      expect(result.success).toBe(true);
      expect(result.adapter).toBe('node');
    });

    it('should configure SvelteKit with Vitest', async () => {
      const projectPath = '/tmp/sveltekit-vitest';
      await fs.mkdir(projectPath, { recursive: true });

      const viteConfig = `
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});`;

      await fs.writeFile(`${projectPath}/vite.config.ts`, viteConfig);

      const config = await fs.readFile(`${projectPath}/vite.config.ts`, 'utf-8');
      expect(config).toContain('vitest/config');
      expect(config).toContain('test:');
    });
  });

  describe('SvelteKit Server-Side Features', () => {
    it('should generate server-side load functions', async () => {
      const projectPath = '/tmp/sveltekit-ssr';
      await fs.mkdir(`${projectPath}/src/routes/blog`, { recursive: true });

      const serverLoadContent = `
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

interface BlogPost {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly publishedAt: Date;
}

export const load: PageServerLoad = async ({ params, fetch }) => {
  try {
    const response = await fetch(\`/api/posts/\${params.id}\`);
    
    if (!response.ok) {
      throw error(404, 'Post not found');
    }
    
    const post: BlogPost = await response.json();
    
    return {
      post
    };
  } catch (err) {
    throw error(500, 'Failed to load post');
  }
};`;

      await fs.writeFile(
        `${projectPath}/src/routes/blog/[id]/+page.server.ts`,
        serverLoadContent
      );

      const serverLoad = await fs.readFile(
        `${projectPath}/src/routes/blog/[id]/+page.server.ts`,
        'utf-8'
      );

      expect(serverLoad).toContain('PageServerLoad');
      expect(serverLoad).toContain('interface BlogPost');
      expect(serverLoad).toContain('readonly');
    });
  });

  describe('SvelteKit Error Handling', () => {
    it('should validate SvelteKit options', async () => {
      const invalidOptions: ScaffoldGeneratorOptions = {
        name: '',
        frontend: 'sveltekit',
        typescript: true,
      };

      const generator = new ScaffoldGenerator();
      await expect(generator.generate(invalidOptions)).rejects.toThrow();
    });

    it('should generate error page', async () => {
      const projectPath = '/tmp/sveltekit-error';
      await fs.mkdir(`${projectPath}/src/routes`, { recursive: true });

      const errorContent = `
<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="min-h-screen flex items-center justify-center p-8">
  <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
    <h1 class="text-2xl font-bold text-red-600 mb-4">
      {$page.status}: {$page.error?.message}
    </h1>
    <p class="text-gray-600 mb-6">
      Sorry, something went wrong. Please try again later.
    </p>
    <a 
      href="/"
      class="inline-block h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-center leading-12"
    >
      Go Home
    </a>
  </div>
</div>`;

      await fs.writeFile(`${projectPath}/src/routes/+error.svelte`, errorContent);

      const error = await fs.readFile(`${projectPath}/src/routes/+error.svelte`, 'utf-8');
      expect(error).toContain('$page.status');
      expect(error).toContain('$page.error?.message');
    });
  });
});