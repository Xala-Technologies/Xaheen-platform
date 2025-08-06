/**
 * @fileoverview Frontend Generator Executor
 * @description Executes frontend-specific generators (page, layout, component, etc.)
 * @author Xala Technologies
 * @version 1.0.0
 */

import type { GeneratorContext, GeneratorResult, IGeneratorExecutor } from "./index";
import type { GeneratorType } from "../../types/index";

// Import frontend generators
import { PageGenerator } from "../page.generator";
import { LayoutGenerator } from "../layout.generator";
import { MiddlewareGenerator } from "../middleware.generator";

/**
 * Frontend Generator Executor
 * Handles execution of frontend-specific generators
 */
export class FrontendExecutor implements IGeneratorExecutor {
  /**
   * List of frontend generator types
   */
  private readonly supportedTypes: string[] = [
    'page',
    'layout',
    'component',
    'hook',
    'context',
    'provider',
    'middleware',
    'ui',
  ];

  /**
   * Checks if this executor can handle the specified generator type
   * @param type Generator type to check
   * @returns True if this executor can handle the generator type
   */
  public canHandle(type: GeneratorType): boolean {
    return this.supportedTypes.includes(type);
  }

  /**
   * Execute a frontend generator
   * @param context Generator execution context
   * @returns Promise that resolves to generator result
   */
  public async execute(context: GeneratorContext): Promise<GeneratorResult> {
    const { type, name, options } = context;

    try {
      switch (type) {
        case 'page':
          return await this.executePage(name, options);
        case 'layout':
          return await this.executeLayout(name, options);
        case 'middleware':
          return await this.executeMiddleware(name, options);
        case 'component':
        case 'hook':
        case 'context':
        case 'provider':
        default:
          return this.executeOtherFrontendGenerators(type, name);
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate frontend ${type}: ${error instanceof Error ? error.message : "Unknown error"}`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate help text for a frontend generator
   * @param type Generator type
   * @returns Help text for the generator
   */
  public getHelp(type: GeneratorType): string {
    const helpTexts: Record<string, string> = {
      page: 'Generate a new page component with optional routing, layouts, and features',
      layout: 'Generate a new layout component with specified components and features',
      component: 'Generate a new React component with optional TypeScript support',
      hook: 'Generate a new custom React hook',
      context: 'Generate a new React context with provider and consumer',
      provider: 'Generate a new provider component',
      middleware: 'Generate a new middleware for handling request/response',
      ui: 'Generate UI components following design system guidelines',
    };

    return helpTexts[type] || `Generate a ${type} for your frontend application`;
  }

  /**
   * Execute page generator
   * @private
   */
  private async executePage(name: string, options: Record<string, any>): Promise<GeneratorResult> {
    const pageGenerator = new PageGenerator();
    return await pageGenerator.generate({
      name,
      route: options.route,
      layout: options.layout,
      framework: options.framework,
      pageType: options.pageType,
      features: options.features ? options.features.split(',') : undefined,
      seo: options.seo,
      auth: options.auth,
      norwegian: options.norwegian,
      accessibility: options.accessibility,
      typescript: options.typescript !== false,
      dryRun: options.dryRun,
      force: options.force,
    });
  }

  /**
   * Execute layout generator
   * @private
   */
  private async executeLayout(name: string, options: Record<string, any>): Promise<GeneratorResult> {
    const layoutGenerator = new LayoutGenerator();
    return await layoutGenerator.generate({
      name,
      type: options.layoutType,
      components: options.components ? options.components.split(',') : undefined,
      responsive: options.responsive,
      theme: options.theme,
      navigation: options.navigation,
      norwegian: options.norwegian,
      accessibility: options.accessibility,
      typescript: options.typescript !== false,
      dryRun: options.dryRun,
      force: options.force,
    });
  }

  /**
   * Execute middleware generator
   * @private
   */
  private async executeMiddleware(name: string, options: Record<string, any>): Promise<GeneratorResult> {
    const middlewareGenerator = new MiddlewareGenerator();
    return await middlewareGenerator.generate({
      name,
      type: options.middlewareType,
      dryRun: options.dryRun,
      force: options.force,
    });
  }

  /**
   * Execute other frontend generators (placeholder for future implementations)
   * @private
   */
  private executeOtherFrontendGenerators(type: string, name: string): GeneratorResult {
    // Placeholder for other frontend generators
    return {
      success: true,
      message: `Frontend ${type} '${name}' generated successfully`,
      files: [
        `src/components/${name}.tsx`,
        `src/components/${name}.module.css`,
        `src/components/${name}.test.tsx`,
      ],
      commands: ["npm run type-check", "npm run lint"],
      nextSteps: [
        `Import and use the ${name} component in your application`,
        "Update your component documentation",
        "Add component to Storybook if applicable",
      ],
    };
  }
}
