/**
 * Project Analyzer Service Implementation
 * Single Responsibility: Analyzes project structure and configuration
 */

import path from 'path';
import type {
  IProjectAnalyzer,
  IFileSystem,
  ILogger,
  FrameworkType,
  ProjectStructure,
  ProjectValidation,
} from '../interfaces/index.js';

export class ProjectAnalyzer implements IProjectAnalyzer {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly logger: ILogger
  ) {}

  public async detectFramework(): Promise<FrameworkType> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const exists = await this.fileSystem.exists(packageJsonPath);
      
      if (!exists) {
        this.logger.warn('No package.json found in current directory');
        return 'unknown';
      }

      const content = await this.fileSystem.readFile(packageJsonPath);
      const packageJson = JSON.parse(content);
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Check for frameworks in order of specificity
      if (dependencies['next']) return 'next';
      if (dependencies['@angular/core']) return 'angular';
      if (dependencies['vue']) return 'vue';
      if (dependencies['svelte']) return 'svelte';
      if (dependencies['react']) return 'react';

      return 'unknown';
    } catch (error) {
      this.logger.error('Failed to detect framework', error);
      return 'unknown';
    }
  }

  public async detectTypeScript(): Promise<boolean> {
    try {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      const packageJsonPath = path.join(process.cwd(), 'package.json');

      // Check for tsconfig.json
      if (await this.fileSystem.exists(tsconfigPath)) {
        return true;
      }

      // Check for TypeScript in dependencies
      if (await this.fileSystem.exists(packageJsonPath)) {
        const content = await this.fileSystem.readFile(packageJsonPath);
        const packageJson = JSON.parse(content);
        const dependencies = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        return !!(dependencies['typescript'] || dependencies['@types/node']);
      }

      return false;
    } catch (error) {
      this.logger.error('Failed to detect TypeScript', error);
      return false;
    }
  }

  public async detectStructure(): Promise<ProjectStructure> {
    const framework = await this.detectFramework();
    const usesTypeScript = await this.detectTypeScript();
    const usesStorybook = await this.detectStorybook();
    const usesJest = await this.detectJest();

    const { componentsDir, pagesDir } = this.getDirectoryStructure(framework);

    return {
      framework,
      usesTypeScript,
      usesStorybook,
      usesJest,
      componentsDir,
      pagesDir,
    };
  }

  public async validateProject(): Promise<ProjectValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check for package.json
      const packageJsonExists = await this.fileSystem.exists(
        path.join(process.cwd(), 'package.json')
      );
      if (!packageJsonExists) {
        errors.push('No package.json found in current directory');
      }

      // Check for src directory
      const srcExists = await this.fileSystem.exists(
        path.join(process.cwd(), 'src')
      );
      if (!srcExists) {
        warnings.push('No src directory found - using default structure');
      }

      // Validate framework configuration
      const framework = await this.detectFramework();
      if (framework === 'unknown') {
        warnings.push('Unknown framework detected - some features may not work correctly');
      }

      // Check for TypeScript configuration
      const usesTypeScript = await this.detectTypeScript();
      if (usesTypeScript) {
        const tsconfigExists = await this.fileSystem.exists(
          path.join(process.cwd(), 'tsconfig.json')
        );
        if (!tsconfigExists) {
          errors.push('TypeScript detected but no tsconfig.json found');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      this.logger.error('Failed to validate project', error);
      return {
        isValid: false,
        errors: ['Failed to validate project structure'],
        warnings,
      };
    }
  }

  private async detectStorybook(): Promise<boolean> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const storybookConfigExists = await this.fileSystem.exists(
        path.join(process.cwd(), '.storybook')
      );

      if (storybookConfigExists) return true;

      if (await this.fileSystem.exists(packageJsonPath)) {
        const content = await this.fileSystem.readFile(packageJsonPath);
        const packageJson = JSON.parse(content);
        const dependencies = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        return !!(
          dependencies['@storybook/react'] ||
          dependencies['@storybook/vue'] ||
          dependencies['@storybook/angular'] ||
          dependencies['@storybook/svelte']
        );
      }

      return false;
    } catch {
      return false;
    }
  }

  private async detectJest(): Promise<boolean> {
    try {
      const jestConfigExists = await this.fileSystem.exists(
        path.join(process.cwd(), 'jest.config.js')
      );
      const jestTsConfigExists = await this.fileSystem.exists(
        path.join(process.cwd(), 'jest.config.ts')
      );

      if (jestConfigExists || jestTsConfigExists) return true;

      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (await this.fileSystem.exists(packageJsonPath)) {
        const content = await this.fileSystem.readFile(packageJsonPath);
        const packageJson = JSON.parse(content);
        const dependencies = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        return !!(
          dependencies['jest'] ||
          dependencies['@testing-library/react'] ||
          dependencies['@testing-library/vue'] ||
          dependencies['vitest']
        );
      }

      return false;
    } catch {
      return false;
    }
  }

  private getDirectoryStructure(framework: FrameworkType): {
    componentsDir: string;
    pagesDir?: string;
  } {
    switch (framework) {
      case 'next':
        return {
          componentsDir: 'src/components',
          pagesDir: 'src/app',
        };
      case 'angular':
        return {
          componentsDir: 'src/app/components',
        };
      case 'vue':
        return {
          componentsDir: 'src/components',
        };
      case 'svelte':
        return {
          componentsDir: 'src/lib/components',
        };
      case 'react':
        return {
          componentsDir: 'src/components',
        };
      default:
        return {
          componentsDir: 'src/components',
        };
    }
  }
}