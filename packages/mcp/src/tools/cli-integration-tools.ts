/**
 * @fileoverview CLI Integration Tools for Xala UI System MCP Server
 * @description Seamless integration with Xala CLI for enhanced development workflows
 * @version 6.0.0
 */

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

export interface CliIntegrationResult {
  readonly success: boolean;
  readonly output: string;
  readonly error?: string;
  readonly generatedFiles?: string[];
}

export interface ProjectSetupConfig {
  readonly name: string;
  readonly framework: 'nextjs' | 'react' | 'vue' | 'angular' | 'svelte';
  readonly template?: string;
  readonly features: string[];
  readonly packageManager: 'npm' | 'yarn' | 'pnpm';
}

export class CliIntegrationManager {
  private readonly xalaCliPath: string;

  constructor(xalaCliPath?: string) {
    this.xalaCliPath = xalaCliPath || this.findXalaCli();
  }

  /**
   * Create complete project structure using Xala CLI
   */
  async createProject(config: ProjectSetupConfig): Promise<CliIntegrationResult> {
    const commands = this.buildProjectCommands(config);
    const results: string[] = [];
    const generatedFiles: string[] = [];

    try {
      for (const command of commands) {
        const result = await this.executeCommand(command.cmd, command.cwd);
        results.push(result);
        if (command.generatedFiles) {
          generatedFiles.push(...command.generatedFiles);
        }
      }

      return {
        success: true,
        output: results.join('\n'),
        generatedFiles
      };
    } catch (error: any) {
      return {
        success: false,
        output: results.join('\n'),
        error: error.message
      };
    }
  }

  /**
   * Generate components using Xala CLI
   */
  async generateComponent(
    type: string,
    name: string,
    options: Record<string, any> = {}
  ): Promise<CliIntegrationResult> {
    const command = this.buildComponentCommand(type, name, options);
    
    try {
      const output = await this.executeCommand(command);
      const generatedFiles = this.extractGeneratedFiles(output);
      
      return {
        success: true,
        output,
        generatedFiles
      };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  /**
   * Analyze project and suggest improvements
   */
  async analyzeProject(projectPath: string): Promise<CliIntegrationResult> {
    const command = `${this.xalaCliPath} analyze ${projectPath} --detailed --migration-strategy`;
    
    try {
      const output = await this.executeCommand(command);
      return {
        success: true,
        output
      };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  /**
   * Execute migration steps
   */
  async executeMigration(
    projectPath: string,
    migrationPlan: string[]
  ): Promise<CliIntegrationResult> {
    const results: string[] = [];
    const generatedFiles: string[] = [];

    try {
      for (const step of migrationPlan) {
        const command = `${this.xalaCliPath} migrate ${step} --project ${projectPath}`;
        const result = await this.executeCommand(command);
        results.push(result);
        
        const files = this.extractGeneratedFiles(result);
        generatedFiles.push(...files);
      }

      return {
        success: true,
        output: results.join('\n'),
        generatedFiles
      };
    } catch (error: any) {
      return {
        success: false,
        output: results.join('\n'),
        error: error.message
      };
    }
  }

  /**
   * Set up development environment
   */
  async setupDevEnvironment(projectPath: string): Promise<CliIntegrationResult> {
    const commands = [
      `${this.xalaCliPath} setup --project ${projectPath}`,
      `cd ${projectPath} && npm install`,
      `cd ${projectPath} && npx husky-init`,
      `${this.xalaCliPath} generate config --eslint --prettier --jest`
    ];

    const results: string[] = [];
    const generatedFiles: string[] = [];

    try {
      for (const command of commands) {
        const result = await this.executeCommand(command);
        results.push(result);
        
        if (command.includes('generate config')) {
          generatedFiles.push('.eslintrc.js', '.prettierrc', 'jest.config.js');
        }
      }

      return {
        success: true,
        output: results.join('\n'),
        generatedFiles
      };
    } catch (error: any) {
      return {
        success: false,
        output: results.join('\n'),
        error: error.message
      };
    }
  }

  /**
   * Generate complete page with components
   */
  async generatePage(
    pageName: string,
    pageType: 'dashboard' | 'landing' | 'auth' | 'settings',
    options: Record<string, any> = {}
  ): Promise<CliIntegrationResult> {
    const commands = this.buildPageCommands(pageName, pageType, options);
    const results: string[] = [];
    const generatedFiles: string[] = [];

    try {
      for (const command of commands) {
        const result = await this.executeCommand(command);
        results.push(result);
        
        const files = this.extractGeneratedFiles(result);
        generatedFiles.push(...files);
      }

      return {
        success: true,
        output: results.join('\n'),
        generatedFiles
      };
    } catch (error: any) {
      return {
        success: false,
        output: results.join('\n'),
        error: error.message
      };
    }
  }

  /**
   * Execute custom CLI workflow
   */
  async executeWorkflow(
    workflowName: string,
    parameters: Record<string, any> = {}
  ): Promise<CliIntegrationResult> {
    const command = this.buildWorkflowCommand(workflowName, parameters);
    
    try {
      const output = await this.executeCommand(command);
      const generatedFiles = this.extractGeneratedFiles(output);
      
      return {
        success: true,
        output,
        generatedFiles
      };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    }
  }

  private findXalaCli(): string {
    // Try to find Xala CLI in common locations
    const possiblePaths = [
      // First try the published package via npx
      'npx @xala-technologies/xala-cli',
      // Then try local installations
      'node_modules/.bin/xala',
      join(process.cwd(), 'node_modules', '.bin', 'xala'),
      // Global installations
      '/usr/local/bin/xala',
      '/usr/bin/xala',
      // Try direct command if in PATH
      'xala'
    ];

    for (const path of possiblePaths) {
      if (path.startsWith('npx') || path === 'xala') {
        return path;
      }
      if (existsSync(path)) {
        return path;
      }
    }

    // Default to using npx with the published package
    return 'npx @xala-technologies/xala-cli';
  }

  private buildProjectCommands(config: ProjectSetupConfig): Array<{
    cmd: string;
    cwd?: string;
    generatedFiles?: string[];
  }> {
    const commands = [];

    // Create project
    commands.push({
      cmd: `${this.xalaCliPath} create ${config.name} --framework ${config.framework} --template ${config.template || 'default'}`,
      generatedFiles: ['package.json', 'tsconfig.json', 'tailwind.config.js']
    });

    // Install Xala UI System
    commands.push({
      cmd: `cd ${config.name} && ${config.packageManager} install @xala-technologies/ui-system`,
      cwd: config.name
    });

    // Add features
    for (const feature of config.features) {
      commands.push({
        cmd: `cd ${config.name} && ${this.xalaCliPath} add ${feature}`,
        cwd: config.name
      });
    }

    return commands;
  }

  private buildComponentCommand(
    type: string,
    name: string,
    options: Record<string, any>
  ): string {
    let command = `${this.xalaCliPath} generate ${type} ${name}`;

    for (const [key, value] of Object.entries(options)) {
      if (typeof value === 'boolean' && value) {
        command += ` --${key}`;
      } else if (typeof value === 'string') {
        command += ` --${key} ${value}`;
      }
    }

    return command;
  }

  private buildPageCommands(
    pageName: string,
    pageType: string,
    options: Record<string, any>
  ): string[] {
    const commands = [];

    // Generate page layout
    commands.push(`${this.xalaCliPath} generate page ${pageName} --type ${pageType}`);

    // Generate required components based on page type
    switch (pageType) {
      case 'dashboard':
        commands.push(
          `${this.xalaCliPath} generate component Sidebar --category navigation`,
          `${this.xalaCliPath} generate component DashboardCard --category data-display`,
          `${this.xalaCliPath} generate component StatsWidget --category data-display`
        );
        break;
      case 'landing':
        commands.push(
          `${this.xalaCliPath} generate component Hero --category marketing`,
          `${this.xalaCliPath} generate component FeatureGrid --category marketing`,
          `${this.xalaCliPath} generate component CTA --category marketing`
        );
        break;
      case 'auth':
        commands.push(
          `${this.xalaCliPath} generate form LoginForm --with-validation`,
          `${this.xalaCliPath} generate form RegisterForm --with-validation`
        );
        break;
    }

    return commands;
  }

  private buildWorkflowCommand(
    workflowName: string,
    parameters: Record<string, any>
  ): string {
    let command = `${this.xalaCliPath} workflow ${workflowName}`;

    for (const [key, value] of Object.entries(parameters)) {
      command += ` --${key} ${value}`;
    }

    return command;
  }

  private async executeCommand(command: string, cwd?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const result = execSync(command, {
          cwd: cwd || process.cwd(),
          encoding: 'utf8',
          stdio: 'pipe'
        });
        resolve(result.toString());
      } catch (error: any) {
        reject(new Error(`Command failed: ${command}\n${error.message}`));
      }
    });
  }

  private extractGeneratedFiles(output: string): string[] {
    const files: string[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      // Look for common patterns indicating file creation
      if (line.includes('Created:') || line.includes('Generated:') || line.includes('✅')) {
        const match = line.match(/(?:Created:|Generated:|✅)\s*(.+\.(tsx?|jsx?|vue|html|css|json|md))/);
        if (match && match[1]) {
          files.push(match[1].trim());
        }
      }
    }

    return files;
  }
}

/**
 * Workflow definitions for common development tasks
 */
export const PREDEFINED_WORKFLOWS = {
  'full-stack-setup': {
    name: 'Full Stack Application Setup',
    description: 'Complete setup for full-stack application with authentication, database, and deployment',
    steps: [
      'create-project',
      'setup-database',
      'add-authentication',
      'configure-deployment',
      'generate-api-routes',
      'setup-testing'
    ]
  },
  'component-library': {
    name: 'Component Library Setup',
    description: 'Set up a component library with Storybook and testing',
    steps: [
      'create-library-project',
      'setup-storybook',
      'configure-build-system',
      'add-documentation',
      'setup-npm-publishing'
    ]
  },
  'migration-assistant': {
    name: 'Migration Assistant',
    description: 'Guided migration from existing UI library to Xala UI System',
    steps: [
      'analyze-existing-code',
      'generate-migration-plan',
      'create-component-mapping',
      'execute-incremental-migration',
      'validate-migration'
    ]
  }
};
