/**
 * EPIC 7: Integration and Testing - Template Generation Integration Tests
 * 
 * Comprehensive testing suite for validating template generation functionality,
 * including command execution, code compilation, parameter combinations,
 * template inheritance, composition, and error handling.
 * 
 * @author Database Architect with Frontend Framework Integration Testing Expertise
 * @since 2025-01-03
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';
import fs from 'fs-extra';
import { execa } from 'execa';
import { fileURLToPath } from 'node:url';

// Test utilities and helpers
import { TestHelpers } from '../test-helpers';
import { createTestProject, cleanupTestProject, validateGeneratedCode, checkTypeScriptCompilation } from '../utils/test-helpers';

// Import CLI services for direct testing
import { ServiceRegistry } from '../../services/registry/service-registry';
import { TemplateOrchestrator } from '../../services/templates/template-orchestrator';
import { TemplateSelector } from '../../services/templates/template-selector';
import { TemplateInheritance } from '../../services/templates/template-inheritance';
import { TemplateComposition } from '../../services/templates/template-composition';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('EPIC 7: Template Generation Integration Tests', () => {
  let testProjectPath: string;
  let serviceRegistry: ServiceRegistry;
  let templateOrchestrator: TemplateOrchestrator;
  let templateSelector: TemplateSelector;
  let templateInheritance: TemplateInheritance;
  let templateComposition: TemplateComposition;

  beforeEach(async () => {
    // Create isolated test project
    testProjectPath = await createTestProject('template-generation-test');
    
    // Initialize services
    serviceRegistry = new ServiceRegistry();
    templateOrchestrator = new TemplateOrchestrator(serviceRegistry);
    templateSelector = new TemplateSelector();
    templateInheritance = new TemplateInheritance();
    templateComposition = new TemplateComposition();
  });

  afterEach(async () => {
    await cleanupTestProject(testProjectPath);
  });

  describe('Story 5.1.1: Template Generation Commands', () => {
    it('should execute all core template generation commands successfully', async () => {
      const commands = [
        'generate component UserCard',
        'generate page Dashboard',
        'generate layout AdminLayout',
        'generate form ContactForm',
        'generate service UserService',
        'generate model User',
        'generate controller UserController'
      ];

      for (const command of commands) {
        const result = await execa('xaheen', command.split(' '), {
          cwd: testProjectPath,
          stdio: 'pipe'
        });

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('Generated successfully');
      }
    });

    it('should generate React components with proper semantic structure', async () => {
      await execa('xaheen', ['generate', 'component', 'ProductCard', '--platform=react'], {
        cwd: testProjectPath
      });

      const componentPath = path.join(testProjectPath, 'src/components/ProductCard.tsx');
      const componentContent = await fs.readFile(componentPath, 'utf-8');

      // Validate semantic UI System component usage
      expect(componentContent).toContain('import { Container, Stack, Text, Button }');
      expect(componentContent).toContain('interface ProductCardProps');
      expect(componentContent).toContain(': JSX.Element');
      expect(componentContent).toContain('readonly');
      expect(componentContent).not.toContain('<div>');
      expect(componentContent).not.toContain('style=');
      expect(componentContent).toContain('className=');
    });

    it('should generate Vue components with composition API', async () => {
      await execa('xaheen', ['generate', 'component', 'ProductList', '--platform=vue'], {
        cwd: testProjectPath
      });

      const componentPath = path.join(testProjectPath, 'src/components/ProductList.vue');
      const componentContent = await fs.readFile(componentPath, 'utf-8');

      expect(componentContent).toContain('<script setup lang="ts">');
      expect(componentContent).toContain('defineProps');
      expect(componentContent).toContain('defineEmits');
      expect(componentContent).toContain('<template>');
    });

    it('should generate Angular standalone components', async () => {
      await execa('xaheen', ['generate', 'component', 'UserProfile', '--platform=angular'], {
        cwd: testProjectPath
      });

      const componentPath = path.join(testProjectPath, 'src/app/components/user-profile.component.ts');
      const componentContent = await fs.readFile(componentPath, 'utf-8');

      expect(componentContent).toContain('@Component({');
      expect(componentContent).toContain('standalone: true');
      expect(componentContent).toContain('imports: [');
      expect(componentContent).toContain('selector: \'app-user-profile\'');
    });

    it('should handle invalid template generation gracefully', async () => {
      const result = await execa('xaheen', ['generate', 'invalid-type', 'TestName'], {
        cwd: testProjectPath,
        reject: false
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Unknown generator type');
    });
  });

  describe('Story 5.1.2: Code Compilation Validation', () => {
    it('should generate TypeScript code that compiles without errors', async () => {
      // Generate various components
      await execa('xaheen', ['generate', 'component', 'Header', '--platform=react'], {
        cwd: testProjectPath
      });

      await execa('xaheen', ['generate', 'page', 'HomePage', '--template=landing'], {
        cwd: testProjectPath
      });

      await execa('xaheen', ['generate', 'form', 'ContactForm', '--fields=name,email,message'], {
        cwd: testProjectPath
      });

      // Run TypeScript compilation check
      const compilationResult = await checkTypeScriptCompilation(testProjectPath);
      expect(compilationResult.success).toBe(true);
      expect(compilationResult.errors).toHaveLength(0);
    });

    it('should generate code with proper import statements', async () => {
      await execa('xaheen', ['generate', 'component', 'NavigationMenu'], {
        cwd: testProjectPath
      });

      const componentPath = path.join(testProjectPath, 'src/components/NavigationMenu.tsx');
      const componentContent = await fs.readFile(componentPath, 'utf-8');

      // Check for proper imports
      expect(componentContent).toMatch(/import React.*from ['"]react['"]/);
      expect(componentContent).toMatch(/import.*from ['"]@\/ui\/.*['"]/);
      expect(componentContent).not.toContain('import * as React');
      expect(componentContent).not.toContain('import React, * as');
    });

    it('should generate code with proper TypeScript strict mode compliance', async () => {
      await execa('xaheen', ['generate', 'service', 'ApiService', '--strict'], {
        cwd: testProjectPath
      });

      const servicePath = path.join(testProjectPath, 'src/services/ApiService.ts');
      const serviceContent = await fs.readFile(servicePath, 'utf-8');

      // Check strict TypeScript patterns
      expect(serviceContent).not.toContain(': any');
      expect(serviceContent).toContain('readonly');
      expect(serviceContent).toMatch(/: Promise<.*>/);
      expect(serviceContent).toContain('interface');
    });
  });

  describe('Story 5.1.3: Parameter Combinations Testing', () => {
    it('should handle all component parameter combinations', async () => {
      const parameterCombinations = [
        ['--platform=react', '--styled=tailwind'],
        ['--platform=vue', '--composition-api'],
        ['--platform=angular', '--standalone'],
        ['--typescript', '--strict'],
        ['--accessibility', '--wcag-aaa'],
        ['--norwegian-compliance', '--nsm-classification=open'],
        ['--theme=enterprise', '--layout=vertical']
      ];

      for (const params of parameterCombinations) {
        const componentName = `TestComponent${Math.random().toString(36).substring(7)}`;
        const result = await execa('xaheen', ['generate', 'component', componentName, ...params], {
          cwd: testProjectPath,
          reject: false
        });

        expect(result.exitCode).toBe(0);
        
        // Verify generated file exists
        const expectedPaths = [
          path.join(testProjectPath, `src/components/${componentName}.tsx`),
          path.join(testProjectPath, `src/components/${componentName}.vue`),
          path.join(testProjectPath, `src/app/components/${componentName.toLowerCase()}.component.ts`)
        ];

        const fileExists = await Promise.all(
          expectedPaths.map(p => fs.pathExists(p))
        );

        expect(fileExists.some(exists => exists)).toBe(true);
      }
    });

    it('should validate parameter compatibility', async () => {
      // Test incompatible parameters
      const result = await execa('xaheen', [
        'generate', 
        'component', 
        'IncompatibleComponent',
        '--platform=react',
        '--composition-api' // Vue-specific parameter
      ], {
        cwd: testProjectPath,
        reject: false
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('incompatible');
    });

    it('should apply default parameters when none specified', async () => {
      await execa('xaheen', ['generate', 'component', 'DefaultComponent'], {
        cwd: testProjectPath
      });

      const componentPath = path.join(testProjectPath, 'src/components/DefaultComponent.tsx');
      const componentContent = await fs.readFile(componentPath, 'utf-8');

      // Should use default React platform with TypeScript
      expect(componentContent).toContain('interface DefaultComponentProps');
      expect(componentContent).toContain(': JSX.Element');
      expect(componentContent).toContain('export const DefaultComponent');
    });
  });

  describe('Story 5.1.4: Template Inheritance Validation', () => {
    it('should inherit from base component templates correctly', async () => {
      // Generate component that should inherit from base template
      await execa('xaheen', ['generate', 'component', 'ExtendedCard', '--extends=BaseCard'], {
        cwd: testProjectPath
      });

      const componentPath = path.join(testProjectPath, 'src/components/ExtendedCard.tsx');
      const componentContent = await fs.readFile(componentPath, 'utf-8');

      // Validate inheritance patterns
      expect(componentContent).toContain('extends BaseCardProps');
      expect(componentContent).toContain('// Inherited from BaseCard');
      expect(componentContent).toContain('Container');
      expect(componentContent).toContain('Stack');
    });

    it('should resolve template inheritance chains', async () => {
      const inheritanceResult = await templateInheritance.resolveInheritanceChain('FormComponent');
      
      expect(inheritanceResult).toEqual([
        'base-component',
        'form-base',
        'form-component'
      ]);
    });

    it('should prevent circular inheritance dependencies', async () => {
      const result = await execa('xaheen', [
        'generate', 
        'component', 
        'CircularComponent',
        '--extends=CircularComponent' // Self-reference
      ], {
        cwd: testProjectPath,
        reject: false
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('circular dependency');
    });
  });

  describe('Story 5.1.5: Template Composition Testing', () => {
    it('should compose templates with proper slot injection', async () => {
      await execa('xaheen', [
        'generate', 
        'layout', 
        'DashboardLayout',
        '--slots=header,sidebar,content,footer'
      ], {
        cwd: testProjectPath
      });

      const layoutPath = path.join(testProjectPath, 'src/layouts/DashboardLayout.tsx');
      const layoutContent = await fs.readFile(layoutPath, 'utf-8');

      // Validate slot composition
      expect(layoutContent).toContain('{headerSlot}');
      expect(layoutContent).toContain('{sidebarSlot}');
      expect(layoutContent).toContain('{contentSlot}');
      expect(layoutContent).toContain('{footerSlot}');
      expect(layoutContent).toContain('interface DashboardLayoutSlots');
    });

    it('should compose form templates with field validation', async () => {
      await execa('xaheen', [
        'generate',
        'form',
        'UserRegistrationForm',
        '--fields=username:string:required,email:email:required,password:password:required,confirmPassword:password:required'
      ], {
        cwd: testProjectPath
      });

      const formPath = path.join(testProjectPath, 'src/forms/UserRegistrationForm.tsx');
      const formContent = await fs.readFile(formPath, 'utf-8');

      // Validate field composition
      expect(formContent).toContain('username: string');
      expect(formContent).toContain('email: string');
      expect(formContent).toContain('required: true');
      expect(formContent).toContain('type="email"');
      expect(formContent).toContain('type="password"');
    });

    it('should validate template composition compatibility', async () => {
      const compositionResult = await templateComposition.validateComposition({
        baseTemplate: 'react-component',
        mixins: ['accessibility-mixin', 'typescript-mixin'],
        slots: ['content'],
        platform: 'react'
      });

      expect(compositionResult.valid).toBe(true);
      expect(compositionResult.conflicts).toHaveLength(0);
    });
  });

  describe('Story 5.1.6: Template Selection Algorithm', () => {
    it('should select optimal templates based on context', async () => {
      const selectionCriteria = {
        type: 'component',
        platform: 'react',
        complexity: 'medium',
        businessContext: 'ecommerce',
        features: ['accessibility', 'typescript']
      };

      const selectedTemplate = await templateSelector.selectOptimalTemplate(selectionCriteria);

      expect(selectedTemplate).toMatchObject({
        name: expect.stringContaining('react'),
        complexity: 'medium',
        features: expect.arrayContaining(['accessibility', 'typescript'])
      });
    });

    it('should prioritize Norwegian compliance templates when required', async () => {
      const selectionCriteria = {
        type: 'form',
        platform: 'react',
        compliance: ['norwegian', 'gdpr'],
        classification: 'confidential'
      };

      const selectedTemplate = await templateSelector.selectOptimalTemplate(selectionCriteria);

      expect(selectedTemplate.compliance).toContain('norwegian');
      expect(selectedTemplate.classification).toBe('confidential');
      expect(selectedTemplate.features).toContain('audit-trail');
    });

    it('should fallback to base templates when specific ones unavailable', async () => {
      const selectionCriteria = {
        type: 'unknown-component',
        platform: 'unsupported-platform'
      };

      const selectedTemplate = await templateSelector.selectOptimalTemplate(selectionCriteria);

      expect(selectedTemplate.name).toContain('base');
      expect(selectedTemplate.fallback).toBe(true);
    });
  });

  describe('Story 5.1.7: Error Handling for Invalid Templates', () => {
    it('should handle missing template files gracefully', async () => {
      const result = await execa('xaheen', [
        'generate',
        'component',
        'TestComponent',
        '--template=non-existent-template'
      ], {
        cwd: testProjectPath,
        reject: false
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Template not found');
      expect(result.stderr).toContain('non-existent-template');
    });

    it('should validate template syntax before generation', async () => {
      // Create malformed template for testing
      const malformedTemplatePath = path.join(testProjectPath, '.xaheen/templates/malformed.hbs');
      await fs.ensureFile(malformedTemplatePath);
      await fs.writeFile(malformedTemplatePath, '{{unclosed tag');

      const result = await execa('xaheen', [
        'generate',
        'component',
        'TestComponent',
        '--template=malformed'
      ], {
        cwd: testProjectPath,
        reject: false
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Template syntax error');
    });

    it('should provide helpful error messages for template issues', async () => {
      const result = await execa('xaheen', [
        'generate',
        'component',
        'Invalid-Component-Name!@#'
      ], {
        cwd: testProjectPath,
        reject: false
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.stderr).toContain('Invalid component name');
      expect(result.stderr).toContain('must follow PascalCase');
    });

    it('should recover from partial generation failures', async () => {
      // Mock a scenario where generation partially fails
      const mockTemplateOrchestrator = vi.mocked(templateOrchestrator);
      mockTemplateOrchestrator.generateFromTemplate = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true });

      const result = await execa('xaheen', [
        'generate',
        'component',
        'RecoveryComponent',
        '--retry'
      ], {
        cwd: testProjectPath,
        reject: false
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Retrying generation');
      expect(result.stdout).toContain('Generated successfully');
    });
  });

  describe('Integration with CLI Command System', () => {
    it('should integrate with main CLI command parser', async () => {
      const result = await execa('xaheen', ['--help'], {
        cwd: testProjectPath
      });

      expect(result.stdout).toContain('generate');
      expect(result.stdout).toContain('component');
      expect(result.stdout).toContain('page');
      expect(result.stdout).toContain('layout');
    });

    it('should support command aliases', async () => {
      const fullCommand = await execa('xaheen', ['generate', 'component', 'TestComponent1'], {
        cwd: testProjectPath
      });

      const aliasCommand = await execa('xaheen', ['g', 'c', 'TestComponent2'], {
        cwd: testProjectPath
      });

      expect(fullCommand.exitCode).toBe(0);
      expect(aliasCommand.exitCode).toBe(0);
      
      // Both should create components
      const component1Exists = await fs.pathExists(
        path.join(testProjectPath, 'src/components/TestComponent1.tsx')
      );
      const component2Exists = await fs.pathExists(
        path.join(testProjectPath, 'src/components/TestComponent2.tsx')
      );

      expect(component1Exists).toBe(true);
      expect(component2Exists).toBe(true);
    });
  });
});