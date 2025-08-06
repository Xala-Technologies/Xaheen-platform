/**
 * License Command Handler
 * Handles all license-related commands for the feature-gated licensing system
 * Follows Single Responsibility Principle (SRP)
 */

import type { CLICommand } from "../../../types/index";
import type { CommandExecutionResult } from "../interfaces/ICommandHandler";
import { BaseCommandHandler } from "./BaseCommandHandler";
import { LicenseCommands } from "../../../licensing/LicenseCommands";
import type { LicenseManager } from "../../../licensing/LicenseManager";
import { logger } from "../../../utils/logger";

export class LicenseCommandHandler extends BaseCommandHandler {
  public readonly domain = 'license';
  private licenseCommands: LicenseCommands;
  private licenseManager: LicenseManager;

  constructor(dependencies: { licenseManager: LicenseManager }) {
    super();
    
    if (!dependencies.licenseManager) {
      throw new Error('LicenseCommandHandler requires licenseManager dependency');
    }

    this.licenseManager = dependencies.licenseManager;
    this.licenseCommands = new LicenseCommands();
  }

  /**
   * Execute a license command (implements BaseCommandHandler)
   */
  protected async executeCommand(command: CLICommand): Promise<CommandExecutionResult | void> {
    this.validateCommand(command);
    this.validateRequiredArguments(command);

    switch (command.action) {
      case 'activate':
        return await this.handleActivate(command);
      case 'status':
        return await this.handleStatus(command);
      case 'features':
        return await this.handleFeatures(command);
      case 'validate':
        return await this.handleValidate(command);
      case 'deactivate':
        return await this.handleDeactivate(command);
      case 'upgrade':
        return await this.handleUpgrade(command);
      case 'usage':
        return await this.handleUsage(command);
      case 'renewal':
        return await this.handleRenewal(command);
      case 'addons':
        return await this.handleAddons(command);
      case 'menu':
        return await this.handleMenu(command);
      case 'diagnostics':
        return await this.handleDiagnostics(command);
      default:
        throw new Error(`Unsupported license action: ${command.action}`);
    }
  }

  /**
   * Get supported actions for the license domain
   */
  public getSupportedActions(): string[] {
    return [
      'activate',
      'status',
      'features',
      'validate',
      'deactivate',
      'upgrade',
      'usage',
      'renewal',
      'addons',
      'menu',
      'diagnostics',
    ];
  }

  /**
   * Get required arguments for license actions
   */
  protected getRequiredArguments(action: string): string[] {
    switch (action) {
      case 'activate':
        return ['key'];
      default:
        return [];
    }
  }

  /**
   * Handle license activation
   */
  private async handleActivate(command: CLICommand): Promise<CommandExecutionResult> {
    const licenseKey = this.getArgumentValue(command, 'key');
    if (!licenseKey) {
      throw new Error('License key is required for activation');
    }

    try {
      await (this.licenseCommands as any).handleActivate(licenseKey, false);
      return this.createSuccessResult('License activated successfully');
    } catch (error) {
      return this.createErrorResult(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle license status display
   */
  private async handleStatus(command: CLICommand): Promise<CommandExecutionResult> {
    try {
      await (this.licenseCommands as any).handleStatus(false);
      return this.createSuccessResult('License status displayed');
    } catch (error) {
      return this.createErrorResult(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle features listing
   */
  private async handleFeatures(command: CLICommand): Promise<CommandExecutionResult> {
    try {
      const showAll = command.options.all || false;
      await (this.licenseCommands as any).handleFeatures(showAll, false);
      return this.createSuccessResult('License features displayed');
    } catch (error) {
      return this.createErrorResult(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle license validation
   */
  private async handleValidate(command: CLICommand): Promise<CommandExecutionResult> {
    try {
      await (this.licenseCommands as any).handleValidate(this.isVerbose(command));
      return this.createSuccessResult('License validation completed');
    } catch (error) {
      return this.createErrorResult(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle license deactivation
   */
  private async handleDeactivate(command: CLICommand): Promise<CommandExecutionResult> {
    try {
      const force = command.options.force || false;
      await (this.licenseCommands as any).handleDeactivate(!force);
      return this.createSuccessResult('License deactivated successfully');
    } catch (error) {
      return this.createErrorResult(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle upgrade information
   */
  private async handleUpgrade(command: CLICommand): Promise<CommandExecutionResult> {
    try {
      await (this.licenseCommands as any).handleUpgrade();
      return this.createSuccessResult('License upgrade information displayed');
    } catch (error) {
      return this.createErrorResult(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle usage metrics display
   */
  private async handleUsage(command: CLICommand): Promise<CommandExecutionResult> {
    try {
      const period = command.options.period || 'month';
      await (this.licenseCommands as any).handleUsage(this.isJsonOutput(command));
      return this.createSuccessResult('License usage metrics displayed');
    } catch (error) {
      return this.createErrorResult(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle renewal information
   */
  private async handleRenewal(command: CLICommand): Promise<CommandExecutionResult> {
    try {
      await (this.licenseCommands as any).handleRenew();
      return this.createSuccessResult('License renewal information displayed');
    } catch (error) {
      return this.createErrorResult(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle add-ons information
   */
  private async handleAddons(command: CLICommand): Promise<CommandExecutionResult> {
    try {
      await (this.licenseCommands as any).handleAddons();
      return this.createSuccessResult('License add-ons information displayed');
    } catch (error) {
      return this.createErrorResult(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle interactive license menu
   */
  private async handleMenu(command: CLICommand): Promise<CommandExecutionResult> {
    try {
      await (this.licenseCommands as any).handleInteractiveMenu();
      return this.createSuccessResult('License menu completed');
    } catch (error) {
      return this.createErrorResult(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Handle license diagnostics
   */
  private async handleDiagnostics(command: CLICommand): Promise<CommandExecutionResult> {
    try {
      await (this.licenseCommands as any).handleDoctor();
      return this.createSuccessResult('License diagnostics completed');
    } catch (error) {
      return this.createErrorResult(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get handler metadata
   */
  public getMetadata(): LicenseHandlerMetadata {
    return {
      domain: this.domain,
      actions: this.getSupportedActions(),
      description: 'Feature-gated licensing system for Xaheen CLI',
      version: '1.0.0',
      features: {
        activation: 'License key activation and validation',
        featureGating: 'Runtime feature access control',
        usageTracking: 'Feature usage analytics and metrics',
        tierManagement: 'License tier and add-on management',
        compliance: 'License compliance and validation',
      },
    };
  }
}

/**
 * License handler metadata
 */
export interface LicenseHandlerMetadata {
  domain: string;
  actions: string[];
  description: string;
  version: string;
  features: Record<string, string>;
}
