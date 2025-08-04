import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';
import { MultiPlatformGenerator } from './multi-platform-generator.js';
import { TemplateEngine } from '../services/template-engine.js';

export interface ProjectConfig {
  readonly name: string;
  readonly platform: string;
  readonly template: string;
  readonly directory: string;
  readonly theme: string;
  readonly locale: string;
  readonly compliance: string;
  readonly features: ReadonlyArray<string>;
}

export interface GeneratorOptions {
  readonly outputDir: string;
  readonly skipInstall: boolean;
  readonly force: boolean;
}

export class ProjectGenerator {
  private readonly templateEngine: TemplateEngine;
  private readonly platformGenerator: MultiPlatformGenerator;

  constructor() {
    this.templateEngine = new TemplateEngine();
    this.platformGenerator = new MultiPlatformGenerator();
  }

  async generate(config: ProjectConfig, options: GeneratorOptions): Promise<void> {
    logger.info(`Generating ${config.platform} project: ${config.name}`);

    // Create project structure
    await this.createProjectStructure(config, options);
    
    // Generate platform-specific files
    await this.platformGenerator.generate(config.platform, {
      ...config,
      outputDir: options.outputDir
    });
    
    // Generate configuration files
    await this.generateConfigFiles(config, options);
    
    // Generate package.json
    await this.generatePackageJson(config, options);
    
    // Generate README
    await this.generateReadme(config, options);
    
    // Install dependencies if requested
    if (!options.skipInstall) {
      await this.installDependencies(options.outputDir);
    }
    
    logger.success('Project generation completed');
  }

  private async createProjectStructure(config: ProjectConfig, options: GeneratorOptions): Promise<void> {
    const dirs = this.getDirectoryStructure(config.platform);
    
    for (const dir of dirs) {
      const fullPath = join(options.outputDir, dir);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
    }
  }

  private getDirectoryStructure(platform: string): ReadonlyArray<string> {
    const commonDirs = [
      'src',
      'src/components',
      'src/hooks',
      'src/utils',
      'src/types',
      'src/styles',
      'src/assets',
      'src/locales',
      'public',
      'docs'
    ];

    switch (platform) {
      case 'react':
      case 'vue':
      case 'angular':
        return [
          ...commonDirs,
          'src/pages',
          'src/layouts',
          'src/services',
          'src/contexts'
        ];
      
      case 'flutter':
        return [
          'lib',
          'lib/models',
          'lib/views',
          'lib/controllers',
          'lib/services',
          'lib/widgets',
          'lib/utils',
          'assets',
          'assets/images',
          'assets/fonts'
        ];
      
      case 'ios':
        return [
          'Sources',
          'Sources/Models',
          'Sources/Views',
          'Sources/Controllers',
          'Sources/Services',
          'Sources/Utils',
          'Resources',
          'Resources/Assets.xcassets',
          'Resources/Localizable.strings'
        ];
      
      case 'android':
        return [
          'app/src/main/java',
          'app/src/main/res',
          'app/src/main/res/layout',
          'app/src/main/res/values',
          'app/src/main/res/drawable',
          'app/src/main/assets'
        ];
      
      default:
        return commonDirs;
    }
  }

  private async generateConfigFiles(config: ProjectConfig, options: GeneratorOptions): Promise<void> {
    // TypeScript config for web platforms
    if (['react', 'vue', 'angular'].includes(config.platform)) {
      const tsConfig = this.templateEngine.render('configs/tsconfig.json.hbs', config);
      writeFileSync(join(options.outputDir, 'tsconfig.json'), tsConfig);
    }

    // ESLint config
    const eslintConfig = this.templateEngine.render('configs/eslint.config.js.hbs', config);
    writeFileSync(join(options.outputDir, 'eslint.config.js'), eslintConfig);

    // Prettier config
    const prettierConfig = this.templateEngine.render('configs/.prettierrc.hbs', config);
    writeFileSync(join(options.outputDir, '.prettierrc'), prettierConfig);

    // Design system config
    const xalaConfig = this.templateEngine.render('configs/xala.config.js.hbs', config);
    writeFileSync(join(options.outputDir, 'xala.config.js'), xalaConfig);
  }

  private async generatePackageJson(config: ProjectConfig, options: GeneratorOptions): Promise<void> {
    const packageJson = {
      name: config.name,
      version: '0.1.0',
      private: true,
      description: `${config.template} application built with Xala Design System`,
      keywords: ['xala', 'design-system', config.platform, config.template],
      scripts: this.getScripts(config.platform),
      dependencies: this.getDependencies(config),
      devDependencies: this.getDevDependencies(config),
      engines: {
        node: '>=18.0.0'
      }
    };

    writeFileSync(
      join(options.outputDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  private getScripts(platform: string): Record<string, string> {
    switch (platform) {
      case 'react':
        return {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'eslint . --ext .ts,.tsx',
          'lint:fix': 'eslint . --ext .ts,.tsx --fix',
          test: 'jest',
          'test:watch': 'jest --watch',
          'type-check': 'tsc --noEmit',
          'xala:tokens': 'xala tokens generate',
          'xala:build': 'xala build react --optimize'
        };
      
      case 'vue':
        return {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
          lint: 'eslint . --ext .ts,.vue',
          'lint:fix': 'eslint . --ext .ts,.vue --fix',
          test: 'vitest',
          'type-check': 'vue-tsc --noEmit'
        };
      
      case 'angular':
        return {
          dev: 'ng serve',
          build: 'ng build',
          test: 'ng test',
          lint: 'ng lint',
          e2e: 'ng e2e'
        };
      
      default:
        return {
          start: 'echo "Platform-specific scripts not configured"'
        };
    }
  }

  private getDependencies(config: ProjectConfig): Record<string, string> {
    const baseDependencies = {
      '@xala-technologies/ui-system': '^1.0.0',
      '@xala-technologies/design-tokens': '^1.0.0'
    };

    switch (config.platform) {
      case 'react':
        return {
          ...baseDependencies,
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          'next': '^14.0.0',
          'tailwindcss': '^3.3.0'
        };
      
      case 'vue':
        return {
          ...baseDependencies,
          'vue': '^3.3.0',
          'vue-router': '^4.2.0',
          'pinia': '^2.1.0',
          'vite': '^4.4.0'
        };
      
      case 'angular':
        return {
          ...baseDependencies,
          '@angular/core': '^16.0.0',
          '@angular/common': '^16.0.0',
          '@angular/router': '^16.0.0',
          '@angular/forms': '^16.0.0'
        };
      
      default:
        return baseDependencies;
    }
  }

  private getDevDependencies(config: ProjectConfig): Record<string, string> {
    const baseDevDependencies = {
      '@xala-technologies/xala-cli': '^1.0.0',
      'typescript': '^5.2.0',
      'eslint': '^8.52.0',
      'prettier': '^3.0.0'
    };

    switch (config.platform) {
      case 'react':
        return {
          ...baseDevDependencies,
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
          '@types/node': '^20.8.0',
          'jest': '^29.7.0',
          '@testing-library/react': '^13.4.0'
        };
      
      case 'vue':
        return {
          ...baseDevDependencies,
          '@vitejs/plugin-vue': '^4.4.0',
          'vue-tsc': '^1.8.0',
          'vitest': '^0.34.0',
          '@vue/test-utils': '^2.4.0'
        };
      
      default:
        return baseDevDependencies;
    }
  }

  private async generateReadme(config: ProjectConfig, options: GeneratorOptions): Promise<void> {
    const readme = this.templateEngine.render('docs/README.md.hbs', {
      ...config,
      generatedDate: new Date().toISOString()
    });
    
    writeFileSync(join(options.outputDir, 'README.md'), readme);
  }

  private async installDependencies(outputDir: string): Promise<void> {
    logger.info('Installing dependencies...');
    // Implementation for dependency installation
    // This would use child_process to run npm/yarn/pnpm install
  }
}