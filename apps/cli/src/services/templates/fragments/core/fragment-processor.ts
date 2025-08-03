/**
 * Core Fragment Processor Implementation
 * Handles processing individual template fragments with proper validation and error handling
 */

import path from "node:path";
import fs from "fs-extra";
import consola from "consola";
import handlebars from "handlebars";
import type {
  FragmentProcessor,
  FragmentConfig,
  FragmentCompositionContext,
  FragmentProcessingResult,
  FragmentDependency,
  FragmentFile,
} from "../interfaces/fragment-base";

export class CoreFragmentProcessor implements FragmentProcessor {
  private readonly handlebarsInstance: typeof handlebars;

  constructor() {
    this.handlebarsInstance = handlebars.create();
    this.registerHandlebarsHelpers();
  }

  /**
   * Process a single fragment with comprehensive error handling
   */
  async processFragment(
    fragmentConfig: FragmentConfig,
    context: FragmentCompositionContext,
    outputPath: string
  ): Promise<FragmentProcessingResult> {
    const result: FragmentProcessingResult = {
      success: false,
      fragmentName: fragmentConfig.name,
      filesProcessed: [],
      dependenciesAdded: [],
      errors: [],
      warnings: [],
      skipped: [],
    };

    try {
      consola.info(`Processing fragment: ${fragmentConfig.name}`);

      // Validate fragment compatibility
      const validationErrors = await this.validateFragment(fragmentConfig, context);
      if (validationErrors.length > 0 && !context.options.skipValidation) {
        result.errors.push(...validationErrors);
        return result;
      }

      if (context.options.validateOnly) {
        result.success = true;
        return result;
      }

      // Process files
      const processedFiles: string[] = [];
      const skippedFiles: string[] = [];

      for (const file of fragmentConfig.files) {
        try {
          const shouldInclude = await this.evaluateCondition(file.condition, context);
          if (!shouldInclude) {
            skippedFiles.push(file.path);
            continue;
          }

          const fileResult = await this.processFile(file, fragmentConfig, context, outputPath);
          if (fileResult.processed) {
            processedFiles.push(fileResult.outputPath);
          } else {
            skippedFiles.push(file.path);
            if (fileResult.reason) {
              result.warnings.push(`Skipped ${file.path}: ${fileResult.reason}`);
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.errors.push(`Failed to process file ${file.path}: ${errorMessage}`);
          consola.error(`Error processing file ${file.path}:`, error);
        }
      }

      // Resolve and add dependencies
      const dependencies = await this.resolveDependencies(fragmentConfig, context);

      result.filesProcessed = processedFiles;
      result.dependenciesAdded = dependencies;
      result.skipped = skippedFiles;
      result.success = result.errors.length === 0;

      consola.success(`Fragment ${fragmentConfig.name} processed successfully`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Fragment processing failed: ${errorMessage}`);
      consola.error(`Error processing fragment ${fragmentConfig.name}:`, error);
      return result;
    }
  }

  /**
   * Validate fragment compatibility with current context
   */
  async validateFragment(
    fragmentConfig: FragmentConfig,
    context: FragmentCompositionContext
  ): Promise<readonly string[]> {
    const errors: string[] = [];

    // Check framework compatibility
    if (!fragmentConfig.frameworks.includes(context.framework)) {
      errors.push(
        `Fragment ${fragmentConfig.name} does not support framework ${context.framework}. ` +
        `Supported frameworks: ${fragmentConfig.frameworks.join(", ")}`
      );
    }

    // Check context compatibility
    if (!fragmentConfig.context.includes(context.context)) {
      errors.push(
        `Fragment ${fragmentConfig.name} does not support context ${context.context}. ` +
        `Supported contexts: ${fragmentConfig.context.join(", ")}`
      );
    }

    // Check required dependencies
    if (fragmentConfig.compatibility?.requires) {
      for (const required of fragmentConfig.compatibility.requires) {
        if (!context.selectedFragments.includes(required)) {
          errors.push(
            `Fragment ${fragmentConfig.name} requires ${required} but it is not selected`
          );
        }
      }
    }

    // Check conflicts
    if (fragmentConfig.compatibility?.conflicts) {
      for (const conflict of fragmentConfig.compatibility.conflicts) {
        if (context.selectedFragments.includes(conflict)) {
          errors.push(
            `Fragment ${fragmentConfig.name} conflicts with ${conflict}`
          );
        }
      }
    }

    return errors;
  }

  /**
   * Resolve fragment dependencies based on context
   */
  async resolveDependencies(
    fragmentConfig: FragmentConfig,
    context: FragmentCompositionContext
  ): Promise<readonly FragmentDependency[]> {
    const resolvedDependencies: FragmentDependency[] = [];

    for (const dependency of fragmentConfig.dependencies) {
      try {
        const shouldInclude = await this.evaluateCondition(dependency.condition, context);
        if (shouldInclude) {
          resolvedDependencies.push(dependency);
        }
      } catch (error) {
        consola.warn(`Failed to evaluate dependency condition for ${dependency.name}:`, error);
        // Include dependency if condition evaluation fails (safe default)
        if (!dependency.optional) {
          resolvedDependencies.push(dependency);
        }
      }
    }

    return resolvedDependencies;
  }

  /**
   * Process individual file with proper template rendering
   */
  private async processFile(
    file: FragmentFile,
    fragmentConfig: FragmentConfig,
    context: FragmentCompositionContext,
    outputPath: string
  ): Promise<{ processed: boolean; outputPath: string; reason?: string }> {
    const fragmentBasePath = this.getFragmentBasePath(fragmentConfig);
    const sourcePath = path.join(fragmentBasePath, file.path);
    const targetPath = path.join(outputPath, this.resolveOutputPath(file.path));

    // Check if source file exists
    if (!(await fs.pathExists(sourcePath))) {
      return {
        processed: false,
        outputPath: targetPath,
        reason: `Source file does not exist: ${sourcePath}`,
      };
    }

    // Check if target exists and handle conflicts
    if (await fs.pathExists(targetPath)) {
      if (!context.options.overwrite && !file.override) {
        return {
          processed: false,
          outputPath: targetPath,
          reason: "File exists and overwrite is disabled",
        };
      }
    }

    // Create target directory
    await fs.ensureDir(path.dirname(targetPath));

    if (context.options.dryRun) {
      return { processed: true, outputPath: targetPath };
    }

    // Process based on file type
    switch (file.type) {
      case "template":
        await this.processTemplateFile(sourcePath, targetPath, fragmentConfig, context);
        break;
      
      case "static":
        await fs.copy(sourcePath, targetPath, { overwrite: true });
        break;
      
      case "config":
        if (file.merge && await fs.pathExists(targetPath)) {
          await this.mergeConfigFile(sourcePath, targetPath, fragmentConfig, context);
        } else {
          await this.processTemplateFile(sourcePath, targetPath, fragmentConfig, context);
        }
        break;
      
      default:
        throw new Error(`Unknown file type: ${file.type}`);
    }

    return { processed: true, outputPath: targetPath };
  }

  /**
   * Process template file with Handlebars
   */
  private async processTemplateFile(
    sourcePath: string,
    targetPath: string,
    fragmentConfig: FragmentConfig,
    context: FragmentCompositionContext
  ): Promise<void> {
    const templateContent = await fs.readFile(sourcePath, "utf-8");
    
    // Create template context
    const templateContext = {
      ...context.projectConfig,
      fragment: fragmentConfig,
      context: context.context,
      framework: context.framework,
      variables: fragmentConfig.variables || {},
    };

    const template = this.handlebarsInstance.compile(templateContent);
    const processedContent = template(templateContext);

    await fs.writeFile(targetPath, processedContent, "utf-8");
  }

  /**
   * Merge configuration files (JSON, YAML, etc.)
   */
  private async mergeConfigFile(
    sourcePath: string,
    targetPath: string,
    fragmentConfig: FragmentConfig,
    context: FragmentCompositionContext
  ): Promise<void> {
    // For now, just process as template - can be enhanced for specific config formats
    await this.processTemplateFile(sourcePath, targetPath, fragmentConfig, context);
  }

  /**
   * Evaluate Handlebars condition
   */
  private async evaluateCondition(
    condition: string | undefined,
    context: FragmentCompositionContext
  ): Promise<boolean> {
    if (!condition) {
      return true;
    }

    try {
      const template = this.handlebarsInstance.compile(`{{#if (${condition})}}true{{else}}false{{/if}}`);
      const result = template({
        ...context.projectConfig,
        context: context.context,
        framework: context.framework,
      });
      return result.trim() === "true";
    } catch {
      // If condition evaluation fails, default to true for safety
      return true;
    }
  }

  /**
   * Get the base path for fragment files
   */
  private getFragmentBasePath(fragmentConfig: FragmentConfig): string {
    // This would be configurable - for now use a standard structure
    return path.join(process.cwd(), "src", "services", "templates", "fragments", "library", fragmentConfig.type, fragmentConfig.name);
  }

  /**
   * Resolve output path from template path
   */
  private resolveOutputPath(templatePath: string): string {
    // Remove .hbs extension if present
    if (templatePath.endsWith(".hbs")) {
      return templatePath.slice(0, -4);
    }
    
    // Handle special file names
    const basename = path.basename(templatePath);
    const dirname = path.dirname(templatePath);
    
    if (basename === "_gitignore") {
      return path.join(dirname, ".gitignore");
    }
    
    if (basename === "_npmrc") {
      return path.join(dirname, ".npmrc");
    }
    
    return templatePath;
  }

  /**
   * Register custom Handlebars helpers for fragment processing
   */
  private registerHandlebarsHelpers(): void {
    // Basic comparison helpers
    this.handlebarsInstance.registerHelper("eq", (a, b) => a === b);
    this.handlebarsInstance.registerHelper("ne", (a, b) => a !== b);
    this.handlebarsInstance.registerHelper("and", (a, b) => a && b);
    this.handlebarsInstance.registerHelper("or", (a, b) => a || b);
    this.handlebarsInstance.registerHelper("not", (a) => !a);

    // Array helpers
    this.handlebarsInstance.registerHelper("includes", (array, value) => 
      Array.isArray(array) && array.includes(value)
    );
    this.handlebarsInstance.registerHelper("length", (array) => 
      Array.isArray(array) ? array.length : 0
    );

    // String helpers
    this.handlebarsInstance.registerHelper("toLowerCase", (str) => 
      typeof str === "string" ? str.toLowerCase() : str
    );
    this.handlebarsInstance.registerHelper("toUpperCase", (str) => 
      typeof str === "string" ? str.toUpperCase() : str
    );
    this.handlebarsInstance.registerHelper("camelCase", (str) => {
      if (typeof str !== "string") return str;
      return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : "");
    });
    this.handlebarsInstance.registerHelper("kebabCase", (str) => {
      if (typeof str !== "string") return str;
      return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    });

    // Framework-specific helpers
    this.handlebarsInstance.registerHelper("isReact", (framework) => 
      ["react", "next"].includes(framework)
    );
    this.handlebarsInstance.registerHelper("isVue", (framework) => 
      ["vue", "nuxt"].includes(framework)
    );
    this.handlebarsInstance.registerHelper("isNode", (context) => 
      context === "server"
    );

    // Context helpers
    this.handlebarsInstance.registerHelper("isWeb", (context) => context === "web");
    this.handlebarsInstance.registerHelper("isNative", (context) => context === "native");
    this.handlebarsInstance.registerHelper("isServer", (context) => context === "server");
  }
}