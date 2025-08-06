/**
 * Project Structure Validation Module
 * 
 * Validates that generated projects have the correct structure,
 * dependencies, and configuration files.
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { consola } from 'consola';
import type { 
  ProjectCreationTest, 
  ValidationResult, 
  ProjectStructure,
  FileValidation,
  PackageJsonCheck 
} from '../types.js';

export class ProjectValidator {
  private static readonly FRAMEWORK_STRUCTURES: Record<string, ProjectStructure> = {
    react: {
      framework: 'react',
      template: 'default',
      requiredFiles: [
        'package.json',
        'tsconfig.json',
        'tailwind.config.js',
        'src/index.tsx',
        'src/App.tsx',
        'src/components/ui/button.tsx',
        'public/index.html'
      ],
      requiredDirectories: [
        'src',
        'src/components',
        'src/components/ui',
        'public',
        'node_modules'
      ],
      packageJsonChecks: [
        { field: 'dependencies.react', expected: '^18.0.0', type: 'version-range', message: 'React version should be 18+' },
        { field: 'dependencies.typescript', expected: true, type: 'exists', message: 'TypeScript should be included' },
        { field: 'dependencies.@xaheen-ai/design-system', expected: true, type: 'exists', message: 'Design system should be included' },
        { field: 'dependencies.tailwindcss', expected: true, type: 'exists', message: 'Tailwind CSS should be included' }
      ],
      codeChecks: [
        {
          filePattern: 'src/**/*.tsx',
          validations: [
            { type: 'contains', pattern: ': JSX.Element', message: 'Components should have explicit JSX.Element return type', severity: 'error' },
            { type: 'not-contains', pattern: ': any', message: 'No any types allowed', severity: 'error' },
            { type: 'contains', pattern: 'readonly', message: 'Props interfaces should be readonly', severity: 'warning' }
          ]
        }
      ]
    },
    nextjs: {
      framework: 'nextjs',
      template: 'saas',
      requiredFiles: [
        'package.json',
        'tsconfig.json',
        'tailwind.config.js',
        'next.config.js',
        'src/app/page.tsx',
        'src/app/layout.tsx',
        'src/components/ui/button.tsx'
      ],
      requiredDirectories: [
        'src',
        'src/app',
        'src/components',
        'src/components/ui',
        'public'
      ],
      packageJsonChecks: [
        { field: 'dependencies.next', expected: '^14.0.0', type: 'version-range', message: 'Next.js version should be 14+' },
        { field: 'dependencies.react', expected: '^18.0.0', type: 'version-range', message: 'React version should be 18+' },
        { field: 'dependencies.@xaheen-ai/design-system', expected: true, type: 'exists', message: 'Design system should be included' }
      ],
      codeChecks: [
        {
          filePattern: 'src/**/*.tsx',
          validations: [
            { type: 'contains', pattern: ': JSX.Element', message: 'Components should have explicit JSX.Element return type', severity: 'error' },
            { type: 'not-contains', pattern: ': any', message: 'No any types allowed', severity: 'error' }
          ]
        }
      ]
    },
    vue: {
      framework: 'vue',
      template: 'default',
      requiredFiles: [
        'package.json',
        'tsconfig.json',
        'tailwind.config.js',
        'vite.config.ts',
        'src/main.ts',
        'src/App.vue',
        'src/components/ui/Button.vue'
      ],
      requiredDirectories: [
        'src',
        'src/components',
        'src/components/ui',
        'public'
      ],
      packageJsonChecks: [
        { field: 'dependencies.vue', expected: '^3.0.0', type: 'version-range', message: 'Vue version should be 3+' },
        { field: 'devDependencies.@vitejs/plugin-vue', expected: true, type: 'exists', message: 'Vite Vue plugin should be included' },
        { field: 'dependencies.@xaheen-ai/design-system', expected: true, type: 'exists', message: 'Design system should be included' }
      ],
      codeChecks: [
        {
          filePattern: 'src/**/*.vue',
          validations: [
            { type: 'contains', pattern: '<script setup lang="ts">', message: 'Vue components should use TypeScript setup syntax', severity: 'error' },
            { type: 'contains', pattern: 'defineProps<', message: 'Props should use TypeScript generics', severity: 'warning' }
          ]
        }
      ]
    },
    angular: {
      framework: 'angular',
      template: 'enterprise',
      requiredFiles: [
        'package.json',
        'tsconfig.json',
        'angular.json',
        'tailwind.config.js',
        'src/main.ts',
        'src/app/app.component.ts',
        'src/app/components/ui/button/button.component.ts'
      ],
      requiredDirectories: [
        'src',
        'src/app',
        'src/app/components',
        'src/app/components/ui'
      ],
      packageJsonChecks: [
        { field: 'dependencies.@angular/core', expected: '^17.0.0', type: 'version-range', message: 'Angular version should be 17+' },
        { field: 'dependencies.@xaheen-ai/design-system', expected: true, type: 'exists', message: 'Design system should be included' },
        { field: 'devDependencies.tailwindcss', expected: true, type: 'exists', message: 'Tailwind CSS should be included' }
      ],
      codeChecks: [
        {
          filePattern: 'src/**/*.component.ts',
          validations: [
            { type: 'contains', pattern: 'readonly', message: 'Component properties should be readonly when appropriate', severity: 'warning' },
            { type: 'not-contains', pattern: ': any', message: 'No any types allowed', severity: 'error' }
          ]
        }
      ]
    },
    svelte: {
      framework: 'svelte',
      template: 'fullstack',
      requiredFiles: [
        'package.json',
        'tsconfig.json',
        'tailwind.config.js',
        'vite.config.js',
        'src/main.ts',
        'src/App.svelte',
        'src/lib/components/ui/Button.svelte'
      ],
      requiredDirectories: [
        'src',
        'src/lib',
        'src/lib/components',
        'src/lib/components/ui'
      ],
      packageJsonChecks: [
        { field: 'devDependencies.svelte', expected: '^4.0.0', type: 'version-range', message: 'Svelte version should be 4+' },
        { field: 'devDependencies.@sveltejs/vite-plugin-svelte', expected: true, type: 'exists', message: 'Svelte Vite plugin should be included' },
        { field: 'dependencies.@xaheen-ai/design-system', expected: true, type: 'exists', message: 'Design system should be included' }
      ],
      codeChecks: [
        {
          filePattern: 'src/**/*.svelte',
          validations: [
            { type: 'contains', pattern: '<script lang="ts">', message: 'Svelte components should use TypeScript', severity: 'error' },
            { type: 'contains', pattern: 'export let', message: 'Props should be properly exported', severity: 'warning' }
          ]
        }
      ]
    }
  };

  /**
   * Validate project structure against expected structure
   */
  async validateProjectStructure(projectPath: string, scenario: ProjectCreationTest): ValidationResult {
    consola.debug(`Validating project structure: ${projectPath}`);
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const startTime = Date.now();

    try {
      // Get expected structure for framework
      const expectedStructure = this.getExpectedStructure(scenario.framework, scenario.template);
      if (!expectedStructure) {
        errors.push(`No expected structure defined for framework: ${scenario.framework}`);
        return { success: false, errors, warnings, duration: Date.now() - startTime };
      }

      // Check if project directory exists
      const projectExists = await this.checkPathExists(projectPath);
      if (!projectExists) {
        errors.push(`Project directory does not exist: ${projectPath}`);
        return { success: false, errors, warnings, duration: Date.now() - startTime };
      }

      // Validate required files
      const fileValidation = await this.validateRequiredFiles(projectPath, expectedStructure.requiredFiles);
      errors.push(...fileValidation.errors);
      warnings.push(...fileValidation.warnings);

      // Validate required directories
      const dirValidation = await this.validateRequiredDirectories(projectPath, expectedStructure.requiredDirectories);
      errors.push(...dirValidation.errors);
      warnings.push(...dirValidation.warnings);

      // Validate package.json
      const packageValidation = await this.validatePackageJson(projectPath, expectedStructure.packageJsonChecks);
      errors.push(...packageValidation.errors);
      warnings.push(...packageValidation.warnings);

      // Validate code structure
      const codeValidation = await this.validateCodeStructure(projectPath, expectedStructure.codeChecks);
      errors.push(...codeValidation.errors);
      warnings.push(...codeValidation.warnings);

      const success = errors.length === 0;
      consola.debug(`Project validation completed: ${success ? 'PASSED' : 'FAILED'}`);

      return {
        success,
        errors,
        warnings,
        duration: Date.now() - startTime,
        details: {
          projectPath,
          framework: scenario.framework,
          template: scenario.template,
          expectedStructure
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Validation error: ${errorMessage}`);
      
      return {
        success: false,
        errors,
        warnings,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Get expected structure for a framework and template combination
   */
  private getExpectedStructure(framework: string, template: string): ProjectStructure | undefined {
    return ProjectValidator.FRAMEWORK_STRUCTURES[framework];
  }

  /**
   * Check if a path exists
   */
  private async checkPathExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate required files exist
   */
  private async validateRequiredFiles(projectPath: string, requiredFiles: readonly string[]): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const file of requiredFiles) {
      const filePath = join(projectPath, file);
      const exists = await this.checkPathExists(filePath);
      
      if (!exists) {
        errors.push(`Required file missing: ${file}`);
      } else {
        // Check if file is empty (warning)
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          if (content.trim().length === 0) {
            warnings.push(`Required file is empty: ${file}`);
          }
        } catch {
          warnings.push(`Could not read required file: ${file}`);
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate required directories exist
   */
  private async validateRequiredDirectories(projectPath: string, requiredDirectories: readonly string[]): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const dir of requiredDirectories) {
      const dirPath = join(projectPath, dir);
      const exists = await this.checkPathExists(dirPath);
      
      if (!exists) {
        errors.push(`Required directory missing: ${dir}`);
      } else {
        // Check if directory is empty (warning, except node_modules)
        if (dir !== 'node_modules') {
          try {
            const entries = await fs.readdir(dirPath);
            if (entries.length === 0) {
              warnings.push(`Required directory is empty: ${dir}`);
            }
          } catch {
            warnings.push(`Could not read required directory: ${dir}`);
          }
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate package.json structure and dependencies
   */
  private async validatePackageJson(projectPath: string, checks: readonly PackageJsonCheck[]): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const packageJsonPath = join(projectPath, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      for (const check of checks) {
        const result = this.validatePackageJsonField(packageJson, check);
        if (!result.success) {
          errors.push(result.message);
        } else if (result.warning) {
          warnings.push(result.warning);
        }
      }

    } catch (error) {
      errors.push(`Failed to validate package.json: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { errors, warnings };
  }

  /**
   * Validate a single package.json field
   */
  private validatePackageJsonField(packageJson: any, check: PackageJsonCheck): { success: boolean, message: string, warning?: string } {
    const fieldPath = check.field.split('.');
    let current = packageJson;
    
    // Navigate to the field
    for (const segment of fieldPath) {
      if (current && typeof current === 'object' && segment in current) {
        current = current[segment];
      } else {
        return { success: false, message: `${check.message} (Field not found: ${check.field})` };
      }
    }

    // Validate based on check type
    switch (check.type) {
      case 'exists':
        return { success: current !== undefined, message: check.message };
        
      case 'equals':
        return { 
          success: current === check.expected, 
          message: `${check.message} (Expected: ${check.expected}, Got: ${current})` 
        };
        
      case 'contains':
        if (Array.isArray(current)) {
          return { 
            success: current.includes(check.expected), 
            message: `${check.message} (Expected array to contain: ${check.expected})` 
          };
        }
        if (typeof current === 'string') {
          return { 
            success: current.includes(String(check.expected)), 
            message: `${check.message} (Expected string to contain: ${check.expected})` 
          };
        }
        return { success: false, message: `${check.message} (Field is not array or string)` };
        
      case 'version-range':
        // Simple version validation - in a real implementation, you'd use semver
        if (typeof current === 'string') {
          const hasVersion = current.match(/\d+\.\d+\.\d+/);
          return { 
            success: hasVersion !== null, 
            message: check.message,
            warning: hasVersion ? undefined : `Version format may not match expected range: ${check.expected}`
          };
        }
        return { success: false, message: `${check.message} (Version field is not a string)` };
        
      default:
        return { success: false, message: `Unknown check type: ${check.type}` };
    }
  }

  /**
   * Validate code structure and patterns
   */
  private async validateCodeStructure(projectPath: string, codeChecks: readonly any[]): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const check of codeChecks) {
      try {
        const files = await this.findFilesByPattern(projectPath, check.filePattern);
        
        for (const file of files) {
          const content = await fs.readFile(file, 'utf-8');
          
          for (const validation of check.validations) {
            const result = this.validateContent(content, validation, file);
            
            if (!result.success) {
              if (validation.severity === 'error') {
                errors.push(`${file}: ${result.message}`);
              } else {
                warnings.push(`${file}: ${result.message}`);
              }
            }
          }
        }
      } catch (error) {
        warnings.push(`Failed to validate code pattern ${check.filePattern}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return { errors, warnings };
  }

  /**
   * Find files matching a pattern (simplified glob implementation)
   */
  private async findFilesByPattern(basePath: string, pattern: string): Promise<string[]> {
    const files: string[] = [];
    
    // Simple pattern matching - in a real implementation, you'd use a proper glob library
    const isRecursive = pattern.includes('**');
    const fileExtension = pattern.split('.').pop();
    
    const searchDir = async (dirPath: string, recursive = false): Promise<void> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dirPath, entry.name);
          
          if (entry.isDirectory() && (recursive || !entry.name.startsWith('.'))) {
            if (isRecursive) {
              await searchDir(fullPath, true);
            }
          } else if (entry.isFile()) {
            if (fileExtension && entry.name.endsWith(`.${fileExtension}`)) {
              files.push(fullPath);
            }
          }
        }
      } catch {
        // Ignore errors reading directories
      }
    };

    await searchDir(basePath, isRecursive);
    return files;
  }

  /**
   * Validate content against a validation rule
   */
  private validateContent(content: string, validation: any, filePath: string): { success: boolean, message: string } {
    switch (validation.type) {
      case 'contains':
        const contains = typeof validation.pattern === 'string' 
          ? content.includes(validation.pattern)
          : validation.pattern.test(content);
        return {
          success: contains,
          message: contains ? '' : validation.message
        };
        
      case 'not-contains':
        const notContains = typeof validation.pattern === 'string'
          ? !content.includes(validation.pattern)
          : !validation.pattern.test(content);
        return {
          success: notContains,
          message: notContains ? '' : validation.message
        };
        
      case 'matches':
        const matches = typeof validation.pattern === 'string'
          ? content === validation.pattern
          : validation.pattern.test(content);
        return {
          success: matches,
          message: matches ? '' : validation.message
        };
        
      default:
        return {
          success: false,
          message: `Unknown validation type: ${validation.type}`
        };
    }
  }
}

export default ProjectValidator;