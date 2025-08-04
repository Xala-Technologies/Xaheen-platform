/**
 * @fileoverview Generate Command - Rails-inspired code generation
 * @description Comprehensive generator command for the Xaheen CLI
 * @author Xala Technologies
 * @version 2.0.0
 */

import {
  intro,
  outro,
  text,
  select,
  confirm,
  spinner,
  isCancel,
  cancel,
} from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import consola from "consola";
import type {
  GeneratorType,
  GeneratorOptions,
  GeneratorResult,
} from "../types/index.js";
import { executeFullStackGenerator, getGeneratorHelp } from "../generators/index.js";

/**
 * Generator type options for the interactive prompt
 */
const GENERATOR_TYPE_OPTIONS: Array<{
  value: GeneratorType;
  label: string;
  hint: string;
}> = [
  // Frontend generators
  { value: "component", label: "Component", hint: "React/Vue component with TypeScript" },
  { value: "page", label: "Page", hint: "Next.js page with routing" },
  { value: "layout", label: "Layout", hint: "Layout component for pages" },
  { value: "hook", label: "Hook", hint: "Custom React hook" },
  { value: "context", label: "Context", hint: "React context provider" },
  { value: "provider", label: "Provider", hint: "Service provider component" },
  
  // Backend generators
  { value: "api", label: "API", hint: "REST API endpoints with validation" },
  { value: "model", label: "Model", hint: "Database model with Prisma" },
  { value: "controller", label: "Controller", hint: "NestJS controller with CRUD" },
  { value: "service", label: "Service", hint: "Business logic service" },
  { value: "middleware", label: "Middleware", hint: "Request/response middleware" },
  { value: "guard", label: "Guard", hint: "Authentication guard" },
  { value: "interceptor", label: "Interceptor", hint: "Request interceptor" },
  { value: "pipe", label: "Pipe", hint: "Validation pipe" },
  { value: "decorator", label: "Decorator", hint: "Custom decorator" },
  
  // Database generators
  { value: "migration", label: "Migration", hint: "Database migration file" },
  { value: "seed", label: "Seed", hint: "Database seed data" },
  { value: "schema", label: "Schema", hint: "Prisma schema definition" },
  { value: "repository", label: "Repository", hint: "Data access repository" },
  
  // Full-stack generators
  { value: "scaffold", label: "Scaffold", hint: "Complete feature with frontend and backend" },
  { value: "crud", label: "CRUD", hint: "Full CRUD operations for entity" },
  { value: "auth", label: "Auth", hint: "Authentication system" },
  { value: "feature", label: "Feature", hint: "Modular feature with all files" },
  
  // Infrastructure generators
  { value: "docker", label: "Docker", hint: "Docker configuration files" },
  { value: "k8s", label: "Kubernetes", hint: "Kubernetes manifests" },
  { value: "ci", label: "CI/CD", hint: "Continuous integration pipeline" },
  { value: "deployment", label: "Deployment", hint: "Cloud deployment scripts" },
  
  // Integration generators
  { value: "webhook", label: "Webhook", hint: "Webhook handler" },
  { value: "queue", label: "Queue", hint: "Queue worker" },
  { value: "cron", label: "Cron", hint: "Scheduled job" },
  { value: "worker", label: "Worker", hint: "Background worker" },
  { value: "integration", label: "Integration", hint: "Third-party integration" },
  
  // Testing generators
  { value: "test", label: "Test", hint: "Unit tests with Jest" },
  { value: "e2e", label: "E2E Test", hint: "End-to-end tests" },
  { value: "mock", label: "Mock", hint: "Mock data and services" },
  
  // Configuration generators
  { value: "config", label: "Config", hint: "Configuration module" },
  { value: "env", label: "Environment", hint: "Environment files" },
  { value: "docs", label: "Documentation", hint: "API documentation" },
];

/**
 * Interactive generator command
 */
async function runInteractiveGenerator(): Promise<void> {
  intro(chalk.cyan("🚀 Xaheen Generator"));

  // Get generator type
  const type = await select({
    message: "What would you like to generate?",
    options: GENERATOR_TYPE_OPTIONS,
  });

  if (isCancel(type)) {
    cancel("Operation cancelled.");
    return;
  }

  // Get name
  const name = await text({
    message: `Enter the ${type} name:`,
    placeholder: `my-${type}`,
    validate(value) {
      if (!value) return "Name is required";
      if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(value)) {
        return "Name must start with a letter and contain only letters, numbers, hyphens, and underscores";
      }
      return;
    },
  });

  if (isCancel(name)) {
    cancel("Operation cancelled.");
    return;
  }

  // Get additional options based on generator type
  const options: GeneratorOptions = {};

  // For certain generators, ask for additional options
  if (['scaffold', 'crud', 'model', 'api'].includes(type)) {
    const addFields = await confirm({
      message: "Would you like to add fields/properties?",
      initialValue: false,
    });

    if (isCancel(addFields)) {
      cancel("Operation cancelled.");
      return;
    }

    if (addFields) {
      const fieldsInput = await text({
        message: "Enter fields (comma-separated, e.g., name:string,email:string,age:number):",
        placeholder: "name:string,email:string",
      });

      if (!isCancel(fieldsInput) && fieldsInput) {
        options.fields = fieldsInput.split(',').map(field => {
          const [name, type = 'string'] = field.trim().split(':');
          return { name: name.trim(), type: type.trim() };
        });
      }
    }
  }

  // Execute generator
  const s = spinner();
  s.start(`Generating ${type}: ${name}`);

  try {
    const result = await executeFullStackGenerator({
      type: type as GeneratorType,
      name,
      options,
      projectInfo: {
        name: process.cwd().split('/').pop() || 'project',
        path: process.cwd(),
        type: 'fullstack',
        framework: 'nextjs',
        hasPackageJson: true,
        hasTsConfig: true,
        dependencies: {},
        devDependencies: {},
      },
    });

    s.stop();

    if (result.success) {
      outro(chalk.green(`✅ ${result.message}`));
      
      // Display generated files
      if (result.files && result.files.length > 0) {
        consola.info(chalk.cyan("📁 Generated files:"));
        for (const file of result.files) {
          consola.info(`  ${chalk.green('+')} ${file}`);
        }
      }

      // Display commands to run
      if (result.commands && result.commands.length > 0) {
        consola.info(chalk.cyan("🔧 Commands to run:"));
        for (const command of result.commands) {
          consola.info(`  ${chalk.yellow('$')} ${command}`);
        }
      }

      // Display next steps
      if (result.nextSteps && result.nextSteps.length > 0) {
        consola.info(chalk.cyan("📋 Next steps:"));
        for (const step of result.nextSteps) {
          consola.info(`  ${chalk.blue('•')} ${step}`);
        }
      }
    } else {
      outro(chalk.red(`❌ ${result.message}`));
      if (result.error) {
        consola.error(result.error);
      }
      process.exit(1);
    }
  } catch (error) {
    s.stop();
    outro(chalk.red(`❌ Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    process.exit(1);
  }
}

/**
 * Direct generator command
 */
async function runDirectGenerator(type: string, name: string, options: GeneratorOptions): Promise<void> {
  // Validate generator type
  const validTypes = GENERATOR_TYPE_OPTIONS.map(opt => opt.value);
  if (!validTypes.includes(type as GeneratorType)) {
    consola.error(`Invalid generator type: ${type}`);
    consola.info(`Available types: ${validTypes.join(', ')}`);
    process.exit(1);
  }

  // Execute generator
  const s = spinner();
  s.start(`Generating ${type}: ${name}`);

  try {
    const result = await executeFullStackGenerator({
      type: type as GeneratorType,
      name,
      options,
      projectInfo: {
        name: process.cwd().split('/').pop() || 'project',
        path: process.cwd(),
        type: 'fullstack',
        framework: 'nextjs',
        hasPackageJson: true,
        hasTsConfig: true,
        dependencies: {},
        devDependencies: {},
      },
    });

    s.stop();

    if (result.success) {
      consola.success(`✅ ${result.message}`);
      
      // Display generated files
      if (result.files && result.files.length > 0) {
        consola.info(chalk.cyan("📁 Generated files:"));
        for (const file of result.files) {
          consola.info(`  ${chalk.green('+')} ${file}`);
        }
      }

      // Display commands to run
      if (result.commands && result.commands.length > 0) {
        consola.info(chalk.cyan("🔧 Commands to run:"));
        for (const command of result.commands) {
          consola.info(`  ${chalk.yellow('$')} ${command}`);
        }
      }

      // Display next steps
      if (result.nextSteps && result.nextSteps.length > 0) {
        consola.info(chalk.cyan("📋 Next steps:"));
        for (const step of result.nextSteps) {
          consola.info(`  ${chalk.blue('•')} ${step}`);
        }
      }
    } else {
      consola.error(`❌ ${result.message}`);
      if (result.error) {
        consola.error(result.error);
      }
      process.exit(1);
    }
  } catch (error) {
    s.stop();
    consola.error(`❌ Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Generate command definition
 */
export const generateCommand = new Command("generate")
  .alias("g")
  .description("Generate code using Rails-inspired generators")
  .argument("[type]", "Generator type (component, api, model, etc.)")
  .argument("[name]", "Name of the item to generate")
  .option("--fields <fields>", "Fields for the generator (comma-separated)")
  .option("--dry-run", "Show what would be generated without creating files")
  .option("--force", "Overwrite existing files")
  .option("--help-generators", "Show available generators and their descriptions")
  .action(async (type?: string, name?: string, options?: {
    fields?: string;
    dryRun?: boolean;
    force?: boolean;
    helpGenerators?: boolean;
  }) => {
    try {
      // Show generator help
      if (options?.helpGenerators) {
        consola.info(chalk.cyan("📚 Available Generators:"));
        consola.info("");
        
        const categories = {
          "Frontend": ["component", "page", "layout", "hook", "context", "provider"],
          "Backend": ["api", "model", "controller", "service", "middleware", "guard", "interceptor", "pipe", "decorator"],
          "Database": ["migration", "seed", "schema", "repository"],
          "Full-Stack": ["scaffold", "crud", "auth", "feature"],
          "Infrastructure": ["docker", "k8s", "ci", "deployment"],
          "Integration": ["webhook", "queue", "cron", "worker", "integration"],
          "Testing": ["test", "e2e", "mock"],
          "Configuration": ["config", "env", "docs"],
        };

        for (const [category, types] of Object.entries(categories)) {
          consola.info(chalk.yellow(`${category}:`));
          for (const genType of types) {
            const option = GENERATOR_TYPE_OPTIONS.find(opt => opt.value === genType);
            if (option) {
              consola.info(`  ${chalk.green(genType.padEnd(12))} - ${option.hint}`);
            }
          }
          consola.info("");
        }
        
        consola.info(chalk.cyan("Usage examples:"));
        consola.info(`  ${chalk.gray('$')} xaheen generate component MyButton`);
        consola.info(`  ${chalk.gray('$')} xaheen g api users --fields "name:string,email:string"`);
        consola.info(`  ${chalk.gray('$')} xaheen g scaffold Product --fields "name:string,price:number"`);
        return;
      }

      // Interactive mode if no type provided
      if (!type) {
        await runInteractiveGenerator();
        return;
      }

      // Direct mode if type provided but no name
      if (!name) {
        consola.error("Name is required when using direct generator mode");
        consola.info(`Usage: xaheen generate ${type} <name>`);
        process.exit(1);
      }

      // Parse options
      const generatorOptions: GeneratorOptions = {};
      
      if (options?.fields) {
        generatorOptions.fields = options.fields.split(',').map(field => {
          const [name, type = 'string'] = field.trim().split(':');
          return { name: name.trim(), type: type.trim() };
        });
      }

      if (options?.dryRun) {
        generatorOptions.dryRun = true;
      }

      if (options?.force) {
        generatorOptions.force = true;
      }

      // Run direct generator
      await runDirectGenerator(type, name, generatorOptions);
    } catch (error) {
      consola.error("Generation failed:", error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });
