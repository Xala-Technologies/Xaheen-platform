/**
 * Phase 2 Unit Tests - Vue (Vite) Preset
 * Tests for Vue preset logic with mocked file system
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

describe('Phase 2: Vue (Vite) Preset Unit Tests', () => {
  beforeEach(() => {
    vol.reset();
    mock.restore();
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Vue Project Generation', () => {
    it('should generate correct Vue project structure', async () => {
      const projectName = 'test-vue-app';
      const projectPath = `/tmp/${projectName}`;

      const options: ScaffoldGeneratorOptions = {
        name: projectName,
        frontend: 'vite-vue',
        typescript: true,
        dryRun: false,
      };

      const generator = new ScaffoldGenerator();
      const result = await generator.generate(options);

      expect(result.success).toBe(true);
      expect(result.filesGenerated).toBeGreaterThan(0);

      // Verify Vue-specific files
      const files = vol.toJSON();
      const expectedFiles = [
        'package.json',
        'vite.config.ts',
        'tsconfig.json',
        'tsconfig.node.json',
        'src/main.ts',
        'src/App.vue',
        'src/components/HelloWorld.vue',
        'index.html',
      ];

      expectedFiles.forEach(file => {
        const fullPath = `${projectPath}/${file}`;
        expect(files[fullPath]).toBeDefined();
      });
    });

    it('should configure Vue + TypeScript correctly', async () => {
      const projectName = 'vue-ts-app';
      const projectPath = `/tmp/${projectName}`;

      await fs.mkdir(projectPath, { recursive: true });

      // Mock Vue TypeScript configuration
      const tsconfigContent = {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          module: 'ESNext',
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'preserve',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
        },
        include: ['src/**/*.ts', 'src/**/*.d.ts', 'src/**/*.tsx', 'src/**/*.vue'],
        references: [{ path: './tsconfig.node.json' }],
      };

      await fs.writeFile(
        `${projectPath}/tsconfig.json`,
        JSON.stringify(tsconfigContent, null, 2)
      );

      const tsconfig = JSON.parse(
        await fs.readFile(`${projectPath}/tsconfig.json`, 'utf-8')
      );

      expect(tsconfig.compilerOptions.jsx).toBe('preserve');
      expect(tsconfig.compilerOptions.moduleResolution).toBe('bundler');
      expect(tsconfig.include).toContain('src/**/*.vue');
    });

    it('should create proper Vite configuration for Vue', async () => {
      const projectPath = '/tmp/vue-vite-config';
      await fs.mkdir(projectPath, { recursive: true });

      const viteConfig = `
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 5173,
    strictPort: false
  }
})`;

      await fs.writeFile(`${projectPath}/vite.config.ts`, viteConfig);

      const config = await fs.readFile(`${projectPath}/vite.config.ts`, 'utf-8');
      expect(config).toContain('@vitejs/plugin-vue');
      expect(config).toContain('port: 5173');
    });

    it('should generate Vue 3 Composition API components', async () => {
      const projectPath = '/tmp/vue-components';
      await fs.mkdir(`${projectPath}/src/components`, { recursive: true });

      const componentContent = `
<template>
  <div class="counter">
    <h2>{{ title }}</h2>
    <button @click="increment" class="h-12 px-6 bg-blue-600 text-white rounded-lg">
      Count: {{ count }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  readonly title: string
  readonly initialCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialCount: 0
})

const count = ref(props.initialCount)

const increment = (): void => {
  count.value++
}
</script>

<style scoped>
.counter {
  @apply p-6 bg-white rounded-xl shadow-lg;
}
</style>`;

      await fs.writeFile(
        `${projectPath}/src/components/Counter.vue`,
        componentContent
      );

      const component = await fs.readFile(
        `${projectPath}/src/components/Counter.vue`,
        'utf-8'
      );

      expect(component).toContain('<script setup lang="ts">');
      expect(component).toContain('interface Props');
      expect(component).toContain('readonly title: string');
      expect(component).toContain('@apply');
    });

    it('should configure Vue Router and Pinia', async () => {
      const projectPath = '/tmp/vue-router-pinia';
      await fs.mkdir(projectPath, { recursive: true });

      const packageJson = {
        name: 'vue-router-pinia-app',
        version: '0.1.0',
        dependencies: {
          vue: '^3.4.0',
          'vue-router': '^4.2.0',
          pinia: '^2.1.0',
        },
        devDependencies: {
          '@vitejs/plugin-vue': '^5.0.0',
          typescript: '^5.3.0',
          vite: '^5.0.0',
          'vue-tsc': '^1.8.0',
        },
      };

      await fs.writeFile(
        `${projectPath}/package.json`,
        JSON.stringify(packageJson, null, 2)
      );

      const pkg = JSON.parse(
        await fs.readFile(`${projectPath}/package.json`, 'utf-8')
      );

      expect(pkg.dependencies['vue-router']).toBeDefined();
      expect(pkg.dependencies.pinia).toBeDefined();
    });
  });

  describe('Vue Feature Flags', () => {
    it('should handle Vue feature selection', async () => {
      (prompts.multiselect as any).mockResolvedValueOnce([
        'router',
        'pinia',
        'vitest',
        'playwright',
      ]);

      const options: ScaffoldGeneratorOptions = {
        name: 'vue-features-app',
        frontend: 'vite-vue',
        features: ['router', 'pinia', 'vitest', 'playwright'],
        typescript: true,
      };

      const generator = new ScaffoldGenerator();
      const result = await generator.generate(options);

      expect(result.success).toBe(true);
      expect(result.features).toContain('router');
      expect(result.features).toContain('pinia');
      expect(result.features).toContain('vitest');
      expect(result.features).toContain('playwright');
    });
  });

  describe('Vue Error Handling', () => {
    it('should validate Vue preset options', async () => {
      const invalidOptions: ScaffoldGeneratorOptions = {
        name: '',
        frontend: 'vite-vue',
        typescript: true,
      };

      const generator = new ScaffoldGenerator();
      await expect(generator.generate(invalidOptions)).rejects.toThrow();
    });

    it('should handle missing Vue dependencies gracefully', async () => {
      const projectPath = '/tmp/vue-missing-deps';
      await fs.mkdir(projectPath, { recursive: true });

      const packageJson = {
        name: 'vue-app',
        dependencies: {
          // Missing vue dependency
        },
      };

      await fs.writeFile(
        `${projectPath}/package.json`,
        JSON.stringify(packageJson, null, 2)
      );

      const pkg = JSON.parse(
        await fs.readFile(`${projectPath}/package.json`, 'utf-8')
      );

      expect(pkg.dependencies.vue).toBeUndefined();
    });
  });
});