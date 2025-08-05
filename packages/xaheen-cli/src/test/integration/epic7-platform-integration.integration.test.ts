/**
 * EPIC 7: Integration and Testing - Platform Integration Tests
 * 
 * Comprehensive testing suite for validating cross-platform template generation,
 * platform-specific optimizations, consistency across frameworks, and performance.
 * 
 * @author Database Architect with Cross-Platform Framework Integration Expertise
 * @since 2025-01-03
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';
import fs from 'fs-extra';
import { execa } from 'execa';
import { performance } from 'perf_hooks';

// Test utilities and helpers
import { createTestProject, cleanupTestProject, validateGeneratedCode, checkTypeScriptCompilation } from '../utils/test-helpers';
import { PlatformAdapter } from '../../services/templates/platform-adapter';
import { MultiPlatformBuilder } from '../../services/multi-platform-builder';

// Platform-specific validators
interface PlatformValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  performance: {
    generationTime: number;
    fileSize: number;
    compilationTime: number;
  };
}

class PlatformValidator {
  static async validateReactComponent(filePath: string): Promise<PlatformValidationResult> {
    const content = await fs.readFile(filePath, 'utf-8');
    const errors: string[] = [];
    const warnings: string[] = [];

    // React-specific validations
    if (!content.includes('import React')) {
      if (!content.includes(': JSX.Element') && !content.includes(': React.FC')) {
        errors.push('Missing React import or JSX.Element return type');
      }
    }

    if (!content.includes('interface ') && !content.includes('type ')) {
      errors.push('Missing TypeScript interface/type definitions');
    }

    if (content.includes('class ') && !content.includes('extends React.Component')) {
      warnings.push('Consider using functional components instead of class components');
    }

    if (!content.includes('export const ') && !content.includes('export default ')) {
      errors.push('Missing component export');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      performance: {
        generationTime: 0,
        fileSize: content.length,
        compilationTime: 0
      }
    };
  }

  static async validateVueComponent(filePath: string): Promise<PlatformValidationResult> {
    const content = await fs.readFile(filePath, 'utf-8');
    const errors: string[] = [];
    const warnings: string[] = [];

    // Vue-specific validations
    if (!content.includes('<template>')) {
      errors.push('Missing Vue template section');
    }

    if (!content.includes('<script setup lang="ts">') && !content.includes('<script lang="ts">')) {
      errors.push('Missing TypeScript script section');
    }

    if (content.includes('defineComponent') && content.includes('<script setup')) {
      warnings.push('Consider using composition API consistently');
    }

    if (!content.includes('defineProps') && content.includes('<script setup')) {
      warnings.push('Consider using defineProps for prop definitions');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      performance: {
        generationTime: 0,
        fileSize: content.length,
        compilationTime: 0
      }
    };
  }

  static async validateAngularComponent(filePath: string): Promise<PlatformValidationResult> {
    const content = await fs.readFile(filePath, 'utf-8');
    const errors: string[] = [];
    const warnings: string[] = [];

    // Angular-specific validations
    if (!content.includes('@Component({')) {
      errors.push('Missing Angular @Component decorator');
    }

    if (!content.includes('standalone: true')) {
      warnings.push('Consider using standalone components for better tree-shaking');
    }

    if (!content.includes('selector: ')) {
      errors.push('Missing component selector');
    }

    if (!content.includes('templateUrl: ') && !content.includes('template: ')) {
      errors.push('Missing component template');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      performance: {
        generationTime: 0,
        fileSize: content.length,
        compilationTime: 0
      }
    };
  }
}

describe('EPIC 7: Platform Integration Tests', () => {
  let testProjectPath: string;
  let platformAdapter: PlatformAdapter;
  let multiPlatformBuilder: MultiPlatformBuilder;

  beforeEach(async () => {
    testProjectPath = await createTestProject('platform-integration-test');
    platformAdapter = new PlatformAdapter();
    multiPlatformBuilder = new MultiPlatformBuilder();
  });

  afterEach(async () => {
    await cleanupTestProject(testProjectPath);
  });

  describe('Story 5.1.2-1: React Template Generation with All Variants', () => {
    it('should generate functional React components with hooks', async () => {
      const startTime = performance.now();
      
      await execa('xaheen', [
        'generate', 'component', 'HooksComponent',
        '--platform=react',
        '--variant=functional',
        '--hooks=useState,useEffect,useCallback'
      ], { cwd: testProjectPath });

      const generationTime = performance.now() - startTime;
      
      const componentPath = path.join(testProjectPath, 'src/components/HooksComponent.tsx');
      const validation = await PlatformValidator.validateReactComponent(componentPath);
      validation.performance.generationTime = generationTime;

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      const content = await fs.readFile(componentPath, 'utf-8');
      expect(content).toContain('useState');
      expect(content).toContain('useEffect');
      expect(content).toContain('useCallback');
      expect(content).toContain(': JSX.Element');
      expect(content).toContain('interface HooksComponentProps');
    });

    it('should generate React components with Context API integration', async () => {
      await execa('xaheen', [
        'generate', 'component', 'ContextComponent',
        '--platform=react',
        '--context=theme,user',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/ContextComponent.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('useContext');
      expect(content).toContain('ThemeContext');
      expect(content).toContain('UserContext');
      expect(content).toContain('createContext');
    });

    it('should generate React components with custom hooks', async () => {
      await execa('xaheen', [
        'generate', 'component', 'CustomHookComponent',
        '--platform=react',
        '--custom-hooks=useLocalStorage,useApi',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/CustomHookComponent.tsx');
      const hooksPath = path.join(testProjectPath, 'src/hooks');

      expect(await fs.pathExists(componentPath)).toBe(true);
      expect(await fs.pathExists(hooksPath)).toBe(true);

      const content = await fs.readFile(componentPath, 'utf-8');
      expect(content).toContain('useLocalStorage');
      expect(content).toContain('useApi');
    });

    it('should generate React components with performance optimizations', async () => {
      await execa('xaheen', [
        'generate', 'component', 'OptimizedComponent',
        '--platform=react',
        '--optimization=memo,lazy,suspense',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/OptimizedComponent.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('React.memo');
      expect(content).toContain('React.lazy');
      expect(content).toContain('Suspense');
      expect(content).toContain('fallback=');
    });
  });

  describe('Story 5.1.2-2: Vue Template Generation with Composition API', () => {
    it('should generate Vue 3 components with Composition API', async () => {
      const startTime = performance.now();

      await execa('xaheen', [
        'generate', 'component', 'VueCompositionComponent',
        '--platform=vue',
        '--composition-api',
        '--typescript'
      ], { cwd: testProjectPath });

      const generationTime = performance.now() - startTime;

      const componentPath = path.join(testProjectPath, 'src/components/VueCompositionComponent.vue');
      const validation = await PlatformValidator.validateVueComponent(componentPath);
      validation.performance.generationTime = generationTime;

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      const content = await fs.readFile(componentPath, 'utf-8');
      expect(content).toContain('<script setup lang="ts">');
      expect(content).toContain('defineProps');
      expect(content).toContain('defineEmits');
      expect(content).toContain('ref');
      expect(content).toContain('computed');
    });

    it('should generate Vue components with composables', async () => {
      await execa('xaheen', [
        'generate', 'component', 'VueComposableComponent',
        '--platform=vue',
        '--composables=useCounter,useApi',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/VueComposableComponent.vue');
      const composablesPath = path.join(testProjectPath, 'src/composables');

      expect(await fs.pathExists(componentPath)).toBe(true);
      expect(await fs.pathExists(composablesPath)).toBe(true);

      const content = await fs.readFile(componentPath, 'utf-8');
      expect(content).toContain('useCounter');
      expect(content).toContain('useApi');
    });

    it('should generate Vue components with Pinia store integration', async () => {
      await execa('xaheen', [
        'generate', 'component', 'VuePiniaComponent',
        '--platform=vue',
        '--store=pinia',
        '--store-modules=user,products',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/VuePiniaComponent.vue');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('useUserStore');
      expect(content).toContain('useProductsStore');
      expect(content).toContain('storeToRefs');
    });

    it('should generate Vue components with proper reactivity', async () => {
      await execa('xaheen', [
        'generate', 'component', 'VueReactiveComponent',
        '--platform=vue',
        '--reactive=ref,reactive,computed,watch',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/VueReactiveComponent.vue');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('ref(');
      expect(content).toContain('reactive(');
      expect(content).toContain('computed(');
      expect(content).toContain('watch(');
    });
  });

  describe('Story 5.1.2-3: Angular Template Generation with Standalone Components', () => {
    it('should generate Angular standalone components', async () => {
      const startTime = performance.now();

      await execa('xaheen', [
        'generate', 'component', 'AngularStandaloneComponent',
        '--platform=angular',
        '--standalone',
        '--typescript'
      ], { cwd: testProjectPath });

      const generationTime = performance.now() - startTime;

      const componentPath = path.join(testProjectPath, 'src/app/components/angular-standalone-component.component.ts');
      const validation = await PlatformValidator.validateAngularComponent(componentPath);
      validation.performance.generationTime = generationTime;

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      const content = await fs.readFile(componentPath, 'utf-8');
      expect(content).toContain('standalone: true');
      expect(content).toContain('imports: [');
      expect(content).toContain('@Component({');
      expect(content).toContain('selector: ');
    });

    it('should generate Angular components with signals', async () => {
      await execa('xaheen', [
        'generate', 'component', 'AngularSignalsComponent',
        '--platform=angular',
        '--signals',
        '--standalone',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/app/components/angular-signals-component.component.ts');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('signal(');
      expect(content).toContain('computed(');
      expect(content).toContain('effect(');
      expect(content).toContain('import { signal, computed, effect }');
    });

    it('should generate Angular components with dependency injection', async () => {
      await execa('xaheen', [
        'generate', 'component', 'AngularDIComponent',
        '--platform=angular',
        '--services=UserService,ApiService',
        '--standalone',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/app/components/angular-di-component.component.ts');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('inject(UserService)');
      expect(content).toContain('inject(ApiService)');
      expect(content).toContain('private userService');
      expect(content).toContain('private apiService');
    });

    it('should generate Angular components with reactive forms', async () => {
      await execa('xaheen', [
        'generate', 'component', 'AngularFormsComponent',
        '--platform=angular',
        '--reactive-forms',
        '--form-fields=name,email,password',
        '--standalone',
        '--typescript'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/app/components/angular-forms-component.component.ts');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('FormBuilder');
      expect(content).toContain('FormGroup');
      expect(content).toContain('Validators');
      expect(content).toContain('ReactiveFormsModule');
    });
  });

  describe('Story 5.1.2-4: Cross-Platform Template Consistency', () => {
    it('should generate consistent component structure across platforms', async () => {
      const platforms = ['react', 'vue', 'angular'];
      const componentStructures: Record<string, any> = {};

      for (const platform of platforms) {
        await execa('xaheen', [
          'generate', 'component', 'ConsistentComponent',
          `--platform=${platform}`,
          '--typescript',
          '--props=title:string,count:number,onAction:function'
        ], { cwd: testProjectPath });

        const expectedPaths = {
          react: 'src/components/ConsistentComponent.tsx',
          vue: 'src/components/ConsistentComponent.vue',
          angular: 'src/app/components/consistent-component.component.ts'
        };

        const componentPath = path.join(testProjectPath, expectedPaths[platform]);
        const content = await fs.readFile(componentPath, 'utf-8');
        
        componentStructures[platform] = {
          hasTypeDefinitions: content.includes('title') && content.includes('string'),
          hasEventHandlers: content.includes('onAction') || content.includes('Action'),
          hasPropsInterface: content.includes('interface') || content.includes('Props') || content.includes('defineProps'),
          usesTypeScript: content.includes('lang="ts"') || content.includes('.ts') || path.extname(componentPath) === '.ts'
        };
      }

      // Validate consistency across platforms
      const reactStructure = componentStructures.react;
      const vueStructure = componentStructures.vue;
      const angularStructure = componentStructures.angular;

      expect(reactStructure.hasTypeDefinitions).toBe(true);
      expect(vueStructure.hasTypeDefinitions).toBe(true);
      expect(angularStructure.hasTypeDefinitions).toBe(true);

      expect(reactStructure.usesTypeScript).toBe(true);
      expect(vueStructure.usesTypeScript).toBe(true);
      expect(angularStructure.usesTypeScript).toBe(true);
    });

    it('should maintain semantic UI System consistency across platforms', async () => {
      const platforms = ['react', 'vue', 'angular'];
      const semanticUsage: Record<string, boolean> = {};

      for (const platform of platforms) {
        await execa('xaheen', [
          'generate', 'component', 'SemanticComponent',
          `--platform=${platform}`,
          '--semantic-ui',
          '--elements=Container,Stack,Text,Button'
        ], { cwd: testProjectPath });

        const expectedPaths = {
          react: 'src/components/SemanticComponent.tsx',
          vue: 'src/components/SemanticComponent.vue',
          angular: 'src/app/components/semantic-component.component.ts'
        };

        const componentPath = path.join(testProjectPath, expectedPaths[platform]);
        const content = await fs.readFile(componentPath, 'utf-8');

        semanticUsage[platform] = 
          content.includes('Container') &&
          content.includes('Stack') &&
          content.includes('Text') &&
          content.includes('Button') &&
          !content.includes('<div>') &&
          !content.includes('<span>');
      }

      expect(semanticUsage.react).toBe(true);
      expect(semanticUsage.vue).toBe(true);
      expect(semanticUsage.angular).toBe(true);
    });
  });

  describe('Story 5.1.2-5: Platform-Specific Optimizations', () => {
    it('should apply React-specific optimizations', async () => {
      await execa('xaheen', [
        'generate', 'component', 'ReactOptimizedComponent',
        '--platform=react',
        '--optimize',
        '--bundle-analysis',
        '--code-splitting'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/ReactOptimizedComponent.tsx');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('React.memo');
      expect(content).toContain('useMemo');
      expect(content).toContain('useCallback');
      expect(content).toContain('React.lazy');
    });

    it('should apply Vue-specific optimizations', async () => {
      await execa('xaheen', [
        'generate', 'component', 'VueOptimizedComponent',
        '--platform=vue',
        '--optimize',
        '--vue-optimization'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/components/VueOptimizedComponent.vue');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('v-memo');
      expect(content).toContain('shallowRef');
      expect(content).toContain('defineAsyncComponent');
    });

    it('should apply Angular-specific optimizations', async () => {
      await execa('xaheen', [
        'generate', 'component', 'AngularOptimizedComponent',
        '--platform=angular',
        '--optimize',
        '--change-detection=OnPush'
      ], { cwd: testProjectPath });

      const componentPath = path.join(testProjectPath, 'src/app/components/angular-optimized-component.component.ts');
      const content = await fs.readFile(componentPath, 'utf-8');

      expect(content).toContain('ChangeDetectionStrategy.OnPush');
      expect(content).toContain('trackBy');
      expect(content).toContain('OnInit');
    });
  });

  describe('Story 5.1.2-6: Template Generation Performance Across Platforms', () => {
    it('should meet performance benchmarks for all platforms', async () => {
      const platforms = ['react', 'vue', 'angular'];
      const performanceResults: Record<string, number> = {};

      for (const platform of platforms) {
        const startTime = performance.now();

        await execa('xaheen', [
          'generate', 'component', `PerformanceComponent${platform}`,
          `--platform=${platform}`,
          '--typescript',
          '--complex-template'
        ], { cwd: testProjectPath });

        const endTime = performance.now();
        performanceResults[platform] = endTime - startTime;
      }

      // Performance benchmarks (in milliseconds)
      const maxGenerationTime = 2000; // 2 seconds
      
      expect(performanceResults.react).toBeLessThan(maxGenerationTime);
      expect(performanceResults.vue).toBeLessThan(maxGenerationTime);
      expect(performanceResults.angular).toBeLessThan(maxGenerationTime);

      // React should be fastest (simplest structure)
      expect(performanceResults.react).toBeLessThan(performanceResults.angular);
    });

    it('should handle concurrent generation across platforms', async () => {
      const platforms = ['react', 'vue', 'angular'];
      const startTime = performance.now();

      const generateCommand = (platform: string, index: number) => 
        execa('xaheen', [
          'generate', 'component', `ConcurrentComponent${index}`,
          `--platform=${platform}`,
          '--typescript'
        ], { cwd: testProjectPath });

      const promises = platforms.map((platform, index) => 
        generateCommand(platform, index)
      );

      await Promise.all(promises);
      
      const totalTime = performance.now() - startTime;
      const maxConcurrentTime = 3000; // 3 seconds for all platforms

      expect(totalTime).toBeLessThan(maxConcurrentTime);
    });
  });

  describe('Story 5.1.2-7: Platform-Specific Error Handling', () => {
    it('should handle React-specific errors gracefully', async () => {
      const result = await execa('xaheen', [
        'generate', 'component', 'ReactErrorComponent',
        '--platform=react',
        '--invalid-react-option=true'
      ], { cwd: testProjectPath, reject: false });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Invalid React option');
      expect(result.stderr).toContain('invalid-react-option');
    });

    it('should handle Vue-specific errors gracefully', async () => {
      const result = await execa('xaheen', [
        'generate', 'component', 'VueErrorComponent',
        '--platform=vue',
        '--options-api', // Conflicting with composition API
        '--composition-api'
      ], { cwd: testProjectPath, reject: false });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Conflicting Vue API options');
    });

    it('should handle Angular-specific errors gracefully', async () => {
      const result = await execa('xaheen', [
        'generate', 'component', 'AngularErrorComponent',
        '--platform=angular',
        '--invalid-selector=123invalid'
      ], { cwd: testProjectPath, reject: false });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Invalid Angular selector');
    });

    it('should provide platform-specific error recovery suggestions', async () => {
      const result = await execa('xaheen', [
        'generate', 'component', 'ErrorRecoveryComponent',
        '--platform=react',
        '--class-component', // Deprecated approach
        '--hooks=useState'   // Conflicting options
      ], { cwd: testProjectPath, reject: false });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Consider using functional components');
      expect(result.stderr).toContain('Remove --class-component flag');
    });
  });

  describe('Multi-Platform Generation', () => {
    it('should generate components for multiple platforms simultaneously', async () => {
      await execa('xaheen', [
        'generate', 'component', 'MultiPlatformComponent',
        '--platforms=react,vue,angular',
        '--typescript',
        '--semantic-ui'
      ], { cwd: testProjectPath });

      const reactPath = path.join(testProjectPath, 'src/components/MultiPlatformComponent.tsx');
      const vuePath = path.join(testProjectPath, 'src/components/MultiPlatformComponent.vue');
      const angularPath = path.join(testProjectPath, 'src/app/components/multi-platform-component.component.ts');

      expect(await fs.pathExists(reactPath)).toBe(true);
      expect(await fs.pathExists(vuePath)).toBe(true);
      expect(await fs.pathExists(angularPath)).toBe(true);

      // Validate each platform-specific implementation
      const reactValidation = await PlatformValidator.validateReactComponent(reactPath);
      const vueValidation = await PlatformValidator.validateVueComponent(vuePath);
      const angularValidation = await PlatformValidator.validateAngularComponent(angularPath);

      expect(reactValidation.valid).toBe(true);
      expect(vueValidation.valid).toBe(true);
      expect(angularValidation.valid).toBe(true);
    });

    it('should maintain consistency in multi-platform generation', async () => {
      const multiPlatformConfig = {
        componentName: 'ConsistencyTestComponent',
        platforms: ['react', 'vue', 'angular'],
        props: {
          title: 'string',
          items: 'array',
          onSelect: 'function'
        },
        features: ['typescript', 'semantic-ui', 'accessibility']
      };

      const result = await multiPlatformBuilder.generateMultiPlatform(
        multiPlatformConfig,
        testProjectPath
      );

      expect(result.success).toBe(true);
      expect(result.platforms).toHaveLength(3);
      expect(result.consistency.score).toBeGreaterThan(0.9); // 90% consistency
    });
  });
});