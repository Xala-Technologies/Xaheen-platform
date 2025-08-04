import type { CLICommand } from '../../types/index.js';
import { CLIError } from '../../types/index.js';
import { ConfigManager } from '../../core/config-manager/index.js';
import { MCPClientService } from '../../services/mcp/mcp-client.service.js';
import { logger, cliLogger } from '../../utils/logger.js';
import chalk from 'chalk';

export default class MCPDomain {
  private mcpClient: MCPClientService;
  private configManager: ConfigManager;

  constructor() {
    this.configManager = new ConfigManager();
    // Initialize with default config, will load actual config when needed
    this.mcpClient = new MCPClientService({
      version: '3.0.0',
      project: {
        name: 'default',
        framework: 'unknown',
        packageManager: 'bun'
      }
    });
  }

  public async connect(command: CLICommand): Promise<void> {
    try {
      const server = command.options.server || command.target || 'claude-code';
      const success = await this.mcpClient.connect(server);
      
      if (success) {
        const capabilities = this.mcpClient.getCapabilities();
        cliLogger.info(chalk.green('🎉 MCP connection established!'));
        cliLogger.info(chalk.blue('Available capabilities:'));
        capabilities.forEach(cap => {
          cliLogger.info(`  • ${chalk.cyan(cap.name)}: ${chalk.gray(cap.description)}`);
        });
      } else {
        throw new Error('Connection failed');
      }
      
    } catch (error) {
      throw new CLIError(`MCP connection failed: ${error}`, 'MCP_CONNECT_FAILED', 'mcp', 'connect');
    }
  }

  public async analyze(command: CLICommand): Promise<void> {
    try {
      if (!this.mcpClient.isConnected()) {
        cliLogger.info('MCP not connected. Connecting to default server...');
        await this.mcpClient.connect();
      }

      const projectPath = command.options.path || process.cwd();
      
      // Build project context
      const context = await this.mcpClient.buildProjectContext(projectPath);
      
      // Perform intelligent analysis
      const analysis = await this.mcpClient.analyzeCodebase();
      
      // Display results
      this.displayAnalysisResults(analysis);
      
    } catch (error) {
      throw new CLIError(`MCP analysis failed: ${error}`, 'MCP_ANALYSIS_FAILED', 'mcp', 'analyze');
    }
  }

  public async suggestions(command: CLICommand): Promise<void> {
    try {
      if (!this.mcpClient.isConnected()) {
        await this.mcpClient.connect();
      }

      const category = command.options.category || command.target;
      const suggestions = await this.mcpClient.getSuggestions(category);
      
      if (suggestions.length === 0) {
        cliLogger.info(chalk.green('🎉 No suggestions found. Your codebase looks great!'));
        return;
      }

      cliLogger.info(chalk.blue(`\n🤖 MCP Suggestions${category ? ` (${category})` : ''}:\n`));
      
      suggestions.forEach((suggestion, index) => {
        const priorityColor = suggestion.priority === 'critical' ? 'red' : 
                             suggestion.priority === 'high' ? 'yellow' : 
                             suggestion.priority === 'medium' ? 'cyan' : 'gray';
        
        cliLogger.info(`${index + 1}. ${chalk.bold(suggestion.title)}`);
        cliLogger.info(`   ${chalk[priorityColor](suggestion.priority.toUpperCase())} | ${chalk.gray(suggestion.type)}`);
        cliLogger.info(`   ${suggestion.description}`);
        cliLogger.info(`   ${chalk.green('Action:')} ${suggestion.action}`);
        if (suggestion.automated) {
          cliLogger.info(`   ${chalk.blue('🤖 Can be automated')}`);
        }
        cliLogger.info('');
      });
      
    } catch (error) {
      throw new CLIError(`MCP suggestions failed: ${error}`, 'MCP_SUGGESTIONS_FAILED', 'mcp', 'suggestions');
    }
  }

  public async generate(command: CLICommand): Promise<void> {
    try {
      if (!this.mcpClient.isConnected()) {
        await this.mcpClient.connect();
      }

      const componentName = command.target || command.options.name;
      const platform = command.options.platform || 'react';
      const allPlatforms = command.options.all;

      if (!componentName) {
        throw new Error('Component name is required. Usage: xaheen mcp generate <name> --platform <platform>');
      }

      cliLogger.info(chalk.blue(`🚀 Generating component: ${componentName}`));

      let result;
      if (allPlatforms) {
        const platforms = command.options.platforms?.split(',') || undefined;
        result = await this.mcpClient.generateAllPlatforms(componentName, platforms, command.options);
        
        cliLogger.info(chalk.green(`✅ Generated ${componentName} for ${result.platforms.length} platforms:`));
        result.files.forEach((file: any) => {
          cliLogger.info(`  • ${chalk.cyan(file.platform)}: ${file.path}`);
        });
      } else {
        result = await this.mcpClient.generateComponent(componentName, platform, command.options);
        
        cliLogger.info(chalk.green(`✅ Generated ${componentName} for ${platform}:`));
        result.files.forEach((file: any) => {
          cliLogger.info(`  • ${file.path}`);
        });
      }

    } catch (error) {
      throw new CLIError(`MCP generation failed: ${error}`, 'MCP_GENERATE_FAILED', 'mcp', 'generate');
    }
  }

  public async list(command: CLICommand): Promise<void> {
    try {
      if (!this.mcpClient.isConnected()) {
        await this.mcpClient.connect();
      }

      const platform = command.target || command.options.platform || 'react';
      const result = await this.mcpClient.listPlatformComponents(platform);

      cliLogger.info(chalk.blue(`\n📋 Available ${platform} components:\n`));
      result.components.forEach((component: string, index: number) => {
        cliLogger.info(`${index + 1}. ${chalk.cyan(component)}`);
      });

    } catch (error) {
      throw new CLIError(`MCP list failed: ${error}`, 'MCP_LIST_FAILED', 'mcp', 'list');
    }
  }

  public async info(command: CLICommand): Promise<void> {
    try {
      if (!this.mcpClient.isConnected()) {
        await this.mcpClient.connect();
      }

      const platform = command.target || command.options.platform || 'react';
      const result = await this.mcpClient.getPlatformInfo(platform);

      cliLogger.info(chalk.blue(`\n📊 ${platform} Platform Information:\n`));
      cliLogger.info(`${chalk.bold('Version:')} ${result.info.version}`);
      cliLogger.info(`${chalk.bold('Supported:')} ${result.info.supported ? chalk.green('✓') : chalk.red('✗')}`);
      
      if (result.info.features?.length > 0) {
        cliLogger.info(`${chalk.bold('Features:')} ${result.info.features.join(', ')}`);
      }

    } catch (error) {
      throw new CLIError(`MCP info failed: ${error}`, 'MCP_INFO_FAILED', 'mcp', 'info');
    }
  }

  public async context(command: CLICommand): Promise<void> {
    try {
      if (!this.mcpClient.isConnected()) {
        await this.mcpClient.connect();
      }

      const projectPath = command.options.path || process.cwd();
      const context = await this.mcpClient.buildProjectContext(projectPath);
      
      cliLogger.info(chalk.blue('\n📊 Project Context:\n'));
      cliLogger.info(`${chalk.bold('Framework:')} ${context.framework}`);
      cliLogger.info(`${chalk.bold('Stack:')} ${context.stack}`);
      cliLogger.info(`${chalk.bold('Files Analyzed:')} ${context.files.length}`);
      cliLogger.info(`${chalk.bold('Dependencies:')} ${context.dependencies.length}`);
      
      cliLogger.info(chalk.blue('\n🛡️  Compliance:'));
      cliLogger.info(`  • Accessibility: ${chalk.cyan(context.compliance.accessibility)}`);
      cliLogger.info(`  • Norwegian: ${context.compliance.norwegian ? chalk.green('✓') : chalk.gray('✗')}`);
      cliLogger.info(`  • GDPR: ${context.compliance.gdpr ? chalk.green('✓') : chalk.gray('✗')}`);
      
      // File type breakdown
      const fileTypes = context.files.reduce((acc, file) => {
        acc[file.type] = (acc[file.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      cliLogger.info(chalk.blue('\n📁 File Types:'));
      Object.entries(fileTypes).forEach(([type, count]) => {
        cliLogger.info(`  • ${type}: ${count}`);
      });
      
    } catch (error) {
      throw new CLIError(`MCP context failed: ${error}`, 'MCP_CONTEXT_FAILED', 'mcp', 'context');
    }
  }

  public async deploy(command: CLICommand): Promise<void> {
    try {
      if (!this.mcpClient.isConnected()) {
        await this.mcpClient.connect();
      }

      const target = command.options.target || command.target || 'production';
      
      cliLogger.info(chalk.blue('🚀 Preparing MCP-enhanced deployment...'));
      
      // Get pre-deployment analysis
      const analysis = await this.mcpClient.analyzeCodebase();
      const criticalIssues = analysis.issues.filter(issue => issue.type === 'error' || issue.severity >= 8);
      
      if (criticalIssues.length > 0) {
        cliLogger.warn(chalk.yellow(`⚠️  Found ${criticalIssues.length} critical issues:`));
        criticalIssues.forEach(issue => {
          cliLogger.warn(`  • ${issue.title} (${issue.file})`);
        });
        
        if (!command.options.force) {
          cliLogger.error(chalk.red('Deployment blocked due to critical issues. Use --force to override.'));
          return;
        }
      }
      
      cliLogger.info(chalk.green(`✅ MCP analysis passed. Deploying to ${target}...`));
      cliLogger.info(chalk.gray('Integration with deployment platforms coming soon...'));
      
    } catch (error) {
      throw new CLIError(`MCP deployment failed: ${error}`, 'MCP_DEPLOY_FAILED', 'mcp', 'deploy');
    }
  }

  public async disconnect(command: CLICommand): Promise<void> {
    try {
      await this.mcpClient.disconnect();
      cliLogger.info(chalk.green('✅ Disconnected from MCP server'));
    } catch (error) {
      throw new CLIError(`MCP disconnect failed: ${error}`, 'MCP_DISCONNECT_FAILED', 'mcp', 'disconnect');
    }
  }

  private displayAnalysisResults(analysis: any): void {
    const { suggestions, patterns, issues, opportunities, context } = analysis;
    
    cliLogger.info(chalk.blue('\n🤖 MCP Intelligent Analysis Results\n'));
    
    // Health Overview
    cliLogger.info(chalk.bold('📊 Codebase Health:'));
    cliLogger.info(`  Overall Health: ${this.getHealthBar(context.codebaseHealth)}${context.codebaseHealth}%`);
    cliLogger.info(`  Test Coverage: ${this.getHealthBar(context.testCoverage)}${context.testCoverage}%`);
    cliLogger.info(`  Security Score: ${this.getHealthBar(context.securityScore)}${context.securityScore}%`);
    cliLogger.info(`  Performance: ${this.getHealthBar(context.performanceScore)}${context.performanceScore}%`);
    cliLogger.info(`  Accessibility: ${this.getHealthBar(context.accessibilityScore)}${context.accessibilityScore}%`);
    
    // Issues Summary
    if (issues.length > 0) {
      cliLogger.info(chalk.yellow(`\n⚠️  Issues Found (${issues.length}):`));
      issues.slice(0, 5).forEach((issue: any) => {
        const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
        cliLogger.info(`  ${icon} ${issue.title} (${issue.file})`);
      });
      if (issues.length > 5) {
        cliLogger.info(chalk.gray(`  ... and ${issues.length - 5} more`));
      }
    }
    
    // Top Suggestions
    if (suggestions.length > 0) {
      cliLogger.info(chalk.blue(`\n💡 Top Suggestions (${suggestions.length}):`));
      suggestions.slice(0, 3).forEach((suggestion: any, index: number) => {
        const priorityColor = suggestion.priority === 'critical' ? 'red' : 
                             suggestion.priority === 'high' ? 'yellow' : 'cyan';
        cliLogger.info(`  ${index + 1}. ${suggestion.title} (${chalk[priorityColor](suggestion.priority)})`);
      });
    }
    
    // Opportunities
    if (opportunities.length > 0) {
      cliLogger.info(chalk.green(`\n🚀 Opportunities (${opportunities.length}):`));
      opportunities.slice(0, 3).forEach((opp: any) => {
        cliLogger.info(`  • ${opp.title} (${opp.impact} impact, ${opp.effort} effort)`);
      });
    }
    
    cliLogger.info(chalk.gray('\nFor detailed analysis, run: xaheen mcp suggestions'));
  }

  private getHealthBar(score: number): string {
    const barLength = 20;
    const filledLength = Math.round((score / 100) * barLength);
    const filled = '█'.repeat(filledLength);
    const empty = '░'.repeat(barLength - filledLength);
    
    const color = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
    return chalk[color](`${filled}${empty} `);
  }
}