/**
 * Design System Integration Validation Module
 * 
 * Validates that generated projects properly integrate with @xaheen-ai/design-system:
 * - Correct imports and usage
 * - Proper component sizing (Button h-12+, Input h-14+)
 * - TypeScript interfaces are readonly
 * - Design system components are used instead of custom implementations
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { consola } from 'consola';
import type { ValidationResult, DesignSystemValidation } from '../types.js';

export class DesignSystemValidator {
  private static readonly DESIGN_SYSTEM_VALIDATIONS: DesignSystemValidation[] = [
    {
      type: 'import',
      pattern: 'from "@xaheen-ai/design-system"',
      expected: true,
      message: 'Should import components from @xaheen-ai/design-system'
    },
    {
      type: 'import',
      pattern: 'import { Button }',
      expected: true,
      message: 'Should import Button component from design system'
    },
    {
      type: 'usage',
      pattern: '<Button',
      expected: true,
      message: 'Should use design system Button components'
    },
    {
      type: 'styling',
      pattern: 'h-12|h-14|h-16',
      expected: true,
      message: 'Buttons should use professional heights (h-12+)'
    },
    {
      type: 'component',
      pattern: 'className.*h-8.*button|className.*h-10.*button',
      expected: false,
      message: 'Buttons should not use unprofessional heights (h-8, h-10)'
    }
  ];

  private static readonly COMPONENT_PATTERNS = {
    button: {
      import: /import\s*\{\s*Button\s*\}\s*from\s*["']@xaheen\/design-system["']/,
      usage: /<Button\s/g,
      customImplementation: /<button\s+(?![^>]*Button)/g,
      professionalSizing: /className=["'][^"']*h-(1[2-9]|[2-9]\d)/,
      unprofessionalSizing: /className=["'][^"']*h-([1-9]|1[01])\b/
    },
    input: {
      import: /import\s*\{\s*Input\s*\}\s*from\s*["']@xaheen\/design-system["']/,
      usage: /<Input\s/g,
      customImplementation: /<input\s+(?![^>]*Input)/g,
      professionalSizing: /className=["'][^"']*h-(1[4-9]|[2-9]\d)/,
      unprofessionalSizing: /className=["'][^"']*h-(1[0-3])\b/
    },
    card: {
      import: /import\s*\{\s*Card\s*\}\s*from\s*["']@xaheen\/design-system["']/,
      usage: /<Card\s/g,
      customImplementation: /<div\s+className=["'][^"']*(?:bg-white|border|shadow)[^"']*["']/g,
      professionalSizing: /className=["'][^"']*p-([68]|1[02])/,
      unprofessionalSizing: /className=["'][^"']*p-[1-4]\b/
    }
  };

  /**
   * Validate design system integration for a project
   */
  async validateDesignSystemIntegration(projectPath: string): Promise<ValidationResult> {
    consola.debug(`Validating design system integration: ${projectPath}`);
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const startTime = Date.now();

    try {
      // Check package.json for design system dependency
      const packageValidation = await this.validatePackageJsonDependency(projectPath);
      errors.push(...packageValidation.errors);
      warnings.push(...packageValidation.warnings);

      // Find all component files
      const componentFiles = await this.findComponentFiles(projectPath);
      
      if (componentFiles.length === 0) {
        warnings.push('No component files found for design system validation');
      } else {
        // Validate each component file
        for (const file of componentFiles) {
          const fileValidation = await this.validateComponentFile(file);
          errors.push(...fileValidation.errors);
          warnings.push(...fileValidation.warnings);
        }
      }

      // Check for proper design system usage patterns
      const usageValidation = await this.validateDesignSystemUsage(projectPath);
      errors.push(...usageValidation.errors);
      warnings.push(...usageValidation.warnings);

      const success = errors.length === 0;
      consola.debug(`Design system integration validation completed: ${success ? 'PASSED' : 'FAILED'}`);

      return {
        success,
        errors,
        warnings,
        duration: Date.now() - startTime,
        details: {
          filesValidated: componentFiles.length,
          patterns: DesignSystemValidator.COMPONENT_PATTERNS
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Design system integration validation error: ${errorMessage}`);
      
      return {
        success: false,
        errors,
        warnings,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate package.json has design system dependency
   */
  private async validatePackageJsonDependency(projectPath: string): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const packageJsonPath = join(projectPath, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      // Check for @xaheen-ai/design-system dependency
      const hasDesignSystemDep = 
        (packageJson.dependencies && packageJson.dependencies['@xaheen-ai/design-system']) ||
        (packageJson.devDependencies && packageJson.devDependencies['@xaheen-ai/design-system']);

      if (!hasDesignSystemDep) {
        errors.push('package.json: Missing @xaheen-ai/design-system dependency');
      }

      // Check for proper version (if exists)
      const designSystemVersion = packageJson.dependencies?.['@xaheen-ai/design-system'] || 
                                  packageJson.devDependencies?.['@xaheen-ai/design-system'];

      if (designSystemVersion) {
        // Simple version check - in production, use semver
        if (designSystemVersion.includes('file:')) {
          warnings.push('package.json: Using file: dependency for design system (acceptable for development)');
        } else if (!designSystemVersion.match(/[\^~]?\d+\.\d+\.\d+/)) {
          warnings.push(`package.json: Unusual design system version format: ${designSystemVersion}`);
        }
      }

    } catch (error) {
      errors.push(`Failed to validate package.json: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { errors, warnings };
  }

  /**
   * Find all component files in the project
   */
  private async findComponentFiles(projectPath: string): Promise<string[]> {
    const files: string[] = [];
    const extensions = ['.tsx', '.jsx', '.vue', '.svelte'];
    
    const searchDir = async (dirPath: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dirPath, entry.name);
          
          if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
            await searchDir(fullPath);
          } else if (entry.isFile() && this.isComponentFile(entry.name, extensions)) {
            files.push(fullPath);
          }
        }
      } catch {
        // Ignore errors reading directories
      }
    };

    const srcDir = join(projectPath, 'src');
    try {
      await fs.access(srcDir);
      await searchDir(srcDir);
    } catch {
      // No src directory, search in root
      await searchDir(projectPath);
    }

    return files;
  }

  /**
   * Check if directory should be skipped
   */
  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = ['node_modules', '.git', '.next', 'dist', 'build', '.nuxt', '.svelte-kit', 'coverage'];
    return skipDirs.includes(dirName) || dirName.startsWith('.');
  }

  /**
   * Check if file is a component file
   */
  private isComponentFile(fileName: string, extensions: string[]): boolean {
    return extensions.some(ext => fileName.endsWith(ext)) && 
           (fileName[0].toUpperCase() === fileName[0] || fileName.includes('component'));
  }

  /**
   * Validate a single component file
   */
  private async validateComponentFile(filePath: string): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fileName = filePath.split('/').pop() || '';

    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // Check for design system imports
      const hasDesignSystemImport = /from\s+["']@xaheen\/design-system["']/m.test(content);
      
      if (!hasDesignSystemImport && this.hasUIComponents(content)) {
        warnings.push(`${fileName}: Should import UI components from @xaheen-ai/design-system`);
      }

      // Validate each component type
      for (const [componentName, patterns] of Object.entries(DesignSystemValidator.COMPONENT_PATTERNS)) {
        await this.validateComponentUsage(content, fileName, componentName, patterns, errors, warnings);
      }

      // Check for proper TypeScript interfaces (for React/Next.js)
      if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) {
        const interfaceValidation = this.validateTypeScriptInterfaces(content, fileName);
        errors.push(...interfaceValidation.errors);
        warnings.push(...interfaceValidation.warnings);
      }

    } catch (error) {
      errors.push(`${fileName}: Failed to validate file - ${error instanceof Error ? error.message : String(error)}`);
    }

    return { errors, warnings };
  }

  /**
   * Check if content has UI components that should use design system
   */
  private hasUIComponents(content: string): boolean {
    return /<(button|input|select|textarea|div\s+className=["'][^"']*(?:btn|input|card|modal))/i.test(content);
  }

  /**
   * Validate specific component usage patterns
   */
  private async validateComponentUsage(
    content: string, 
    fileName: string, 
    componentName: string, 
    patterns: any, 
    errors: string[], 
    warnings: string[]
  ): Promise<void> {
    const hasImport = patterns.import.test(content);
    const usage = content.match(patterns.usage) || [];
    const customImplementation = content.match(patterns.customImplementation) || [];

    // Check if using custom implementation without design system import
    if (customImplementation.length > 0 && !hasImport) {
      warnings.push(`${fileName}: Consider using design system ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} component instead of custom implementation`);
    }

    // Check sizing for components that are used
    if (usage.length > 0 || customImplementation.length > 0) {
      const hasProfessionalSizing = patterns.professionalSizing.test(content);
      const hasUnprofessionalSizing = patterns.unprofessionalSizing.test(content);

      if (hasUnprofessionalSizing) {
        errors.push(`${fileName}: ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} components use unprofessional sizing (too small)`);
      }

      if (!hasProfessionalSizing && (usage.length > 0 || customImplementation.length > 0)) {
        warnings.push(`${fileName}: ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} components should use professional sizing`);
      }
    }
  }

  /**
   * Validate TypeScript interfaces for readonly props
   */
  private validateTypeScriptInterfaces(content: string, fileName: string): { errors: string[], warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Find interface declarations
    const interfacePattern = /interface\s+(\w+Props)\s*\{([^}]+)\}/g;
    let match;

    while ((match = interfacePattern.exec(content)) !== null) {
      const interfaceName = match[1];
      const interfaceBody = match[2];

      // Check for readonly properties
      const hasReadonlyProps = /readonly\s+\w+/m.test(interfaceBody);
      
      if (!hasReadonlyProps) {
        errors.push(`${fileName}: Interface ${interfaceName} should have readonly properties`);
      }

      // Check for proper prop types (no any)
      const hasAnyType = /:\s*any\b/m.test(interfaceBody);
      
      if (hasAnyType) {
        errors.push(`${fileName}: Interface ${interfaceName} should not use 'any' types`);
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate overall design system usage patterns
   */
  private async validateDesignSystemUsage(projectPath: string): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check for proper directory structure
      const hasComponentsDir = await this.checkPath(join(projectPath, 'src', 'components'));
      const hasUIDir = await this.checkPath(join(projectPath, 'src', 'components', 'ui'));

      if (hasComponentsDir && !hasUIDir) {
        warnings.push('Consider organizing UI components in src/components/ui directory');
      }

      // Check for design system configuration files
      const hasTailwindConfig = await this.checkPath(join(projectPath, 'tailwind.config.js')) ||
                                await this.checkPath(join(projectPath, 'tailwind.config.ts'));

      if (!hasTailwindConfig) {
        warnings.push('Missing tailwind.config.js - required for design system integration');
      } else {
        // Validate Tailwind config content
        const configValidation = await this.validateTailwindConfig(projectPath);
        errors.push(...configValidation.errors);
        warnings.push(...configValidation.warnings);
      }

      // Check for proper TypeScript configuration
      const hasTsConfig = await this.checkPath(join(projectPath, 'tsconfig.json'));
      
      if (!hasTsConfig) {
        errors.push('Missing tsconfig.json - required for TypeScript design system components');
      }

    } catch (error) {
      warnings.push(`Failed to validate design system usage patterns: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { errors, warnings };
  }

  /**
   * Check if a path exists
   */
  private async checkPath(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate Tailwind configuration for design system integration
   */
  private async validateTailwindConfig(projectPath: string): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      let configPath = join(projectPath, 'tailwind.config.js');
      let configExists = await this.checkPath(configPath);
      
      if (!configExists) {
        configPath = join(projectPath, 'tailwind.config.ts');
        configExists = await this.checkPath(configPath);
      }

      if (configExists) {
        const configContent = await fs.readFile(configPath, 'utf-8');

        // Check for design system preset or configuration
        const hasDesignSystemConfig = /preset.*@xaheen|extend.*@xaheen|require.*@xaheen-ai/i.test(configContent);
        
        if (!hasDesignSystemConfig) {
          warnings.push('Tailwind config may not include design system configuration');
        }

        // Check for proper content paths
        const hasProperContentPaths = /content.*src.*\*\*.*\*\.(tsx?|jsx?|vue|svelte)/i.test(configContent);
        
        if (!hasProperContentPaths) {
          warnings.push('Tailwind config should include proper content paths for component files');
        }
      }

    } catch (error) {
      warnings.push(`Failed to validate Tailwind config: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { errors, warnings };
  }
}

export default DesignSystemValidator;