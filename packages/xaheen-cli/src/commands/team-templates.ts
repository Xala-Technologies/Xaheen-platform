/**
 * @fileoverview Team Templates CLI Commands - EPIC 15 Story 15.3 Task 1
 * @description CLI commands for team template operations and repository management
 * @version 1.0.0
 * @compliance Norwegian NSM Standards, GDPR, Enterprise Security, Audit Trail
 * @author Xaheen CLI Team
 * @since 2025-01-03
 */

import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import { z } from "zod";
import path from "path";
import { promises as fs } from "fs";
import ora from "ora";
import Table from "cli-table3";
import { 
  TemplateRepositoryService,
  createTemplateRepositoryService,
  type TemplateRepositoryConfig 
} from "../services/templates/template-repository.service";
import { 
  TemplateVersionManagerService,
  createTemplateVersionManagerService,
  type VersionHistory 
} from "../services/templates/template-version-manager.service";
import type { MCPExecutionLogger } from "../services/mcp/mcp-execution-logger.service";
import type { User, NSMClassification } from "../services/authentication/types";

// Command Configuration Schema
const TeamTemplateConfigSchema = z.object({
  repositoryPath: z.string().default(path.join(process.cwd(), ".xaheen", "templates")),
  versionDataPath: z.string().default(path.join(process.cwd(), ".xaheen", "versions")),
  gitConfig: z.object({
    username: z.string().min(1, "Git username is required"),
    email: z.string().email("Valid email is required"),
    signingKey: z.string().optional(),
    sshKeyPath: z.string().optional(),
    gpgSign: z.boolean().default(false)
  }),
  defaultNSMClassification: z.enum(["OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET"]).default("OPEN")
});

type TeamTemplateConfig = z.infer<typeof TeamTemplateConfigSchema>;

// Service instances
let repositoryService: TemplateRepositoryService;
let versionManagerService: TemplateVersionManagerService;
let logger: MCPExecutionLogger;
let currentUser: User;

/**
 * Initialize services
 */
async function initializeServices(config: TeamTemplateConfig): Promise<void> {
  // Mock logger for now - in real implementation, this would be injected
  logger = {
    logOperation: async () => {},
    logEvent: async () => {},
    getOperations: async () => [],
    getEvents: async () => [],
    generateReport: async () => ({}),
    clearLogs: async () => {}
  } as any;
  
  // Mock user for now - in real implementation, this would come from authentication
  currentUser = {
    id: "current-user",
    email: config.gitConfig.email,
    firstName: "Current",
    lastName: "User",
    roles: ["developer"],
    permissions: [],
    nsmClearance: config.defaultNSMClassification as NSMClassification,
    mfaEnabled: false,
    mfaMethods: [],
    isActive: true,
    metadata: {}
  };
  
  repositoryService = createTemplateRepositoryService(
    config.repositoryPath,
    config.gitConfig,
    logger
  );
  
  versionManagerService = createTemplateVersionManagerService(
    config.versionDataPath,
    logger
  );
}

/**
 * Load configuration
 */
async function loadConfig(): Promise<TeamTemplateConfig> {
  const configPath = path.join(process.cwd(), ".xaheen", "team-templates.config.json");
  
  try {
    const configData = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(configData);
    return TeamTemplateConfigSchema.parse(config);
  } catch (error) {
    // Return default configuration
    return TeamTemplateConfigSchema.parse({
      gitConfig: {
        username: process.env.GIT_AUTHOR_NAME || "Xaheen CLI User",
        email: process.env.GIT_AUTHOR_EMAIL || "user@example.com"
      }
    });
  }
}

/**
 * Repository Commands
 */
const repositoryCommands = new Command("repo")
  .description("Manage template repositories")
  .alias("repository");

// Register repository command
repositoryCommands
  .command("register")
  .description("Register a new template repository")
  .option("-n, --name <name>", "Repository name")
  .option("-u, --url <url>", "Git repository URL")
  .option("-b, --branch <branch>", "Default branch", "main")
  .option("-p, --private", "Mark repository as private")
  .option("-c, --classification <level>", "NSM classification level", "OPEN")
  .option("--interactive", "Interactive mode")
  .action(async (options) => {
    const spinner = ora("Registering template repository...").start();
    
    try {
      const config = await loadConfig();
      await initializeServices(config);
      
      let repositoryConfig: Partial<TemplateRepositoryConfig>;
      
      if (options.interactive) {
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "name",
            message: "Repository name:",
            validate: (input: string) => input.length > 0 || "Repository name is required"
          },
          {
            type: "input", 
            name: "description",
            message: "Repository description (optional):"
          },
          {
            type: "input",
            name: "gitUrl",
            message: "Git repository URL:",
            validate: (input: string) => {
              try {
                new URL(input);
                return true;
              } catch {
                return "Please enter a valid URL";
              }
            }
          },
          {
            type: "input",
            name: "branch",
            message: "Default branch:",
            default: "main"
          },
          {
            type: "confirm",
            name: "isPrivate",
            message: "Is this a private repository?",
            default: false
          },
          {
            type: "list",
            name: "nsmClassification",
            message: "NSM classification level:",
            choices: ["OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET"],
            default: "OPEN"
          },
          {
            type: "confirm",
            name: "autoSync",
            message: "Enable automatic synchronization?",
            default: true
          }
        ]);
        
        repositoryConfig = {
          name: answers.name,
          description: answers.description,
          gitUrl: answers.gitUrl,
          branch: answers.branch,
          localPath: path.join(config.repositoryPath, answers.name),
          accessControl: {
            isPrivate: answers.isPrivate,
            nsmClassification: answers.nsmClassification
          },
          synchronization: {
            autoSync: answers.autoSync
          },
          norwegianCompliance: {
            dataClassification: answers.nsmClassification
          }
        };
      } else {
        if (!options.name || !options.url) {
          spinner.fail("Repository name and URL are required");
          process.exit(1);
        }
        
        repositoryConfig = {
          name: options.name,
          gitUrl: options.url,
          branch: options.branch,
          localPath: path.join(config.repositoryPath, options.name),
          accessControl: {
            isPrivate: options.private,
            nsmClassification: options.classification
          },
          norwegianCompliance: {
            dataClassification: options.classification
          }
        };
      }
      
      await repositoryService.registerRepository(
        repositoryConfig as TemplateRepositoryConfig,
        currentUser
      );
      
      spinner.succeed(`Repository '${repositoryConfig.name}' registered successfully`);
      
    } catch (error) {
      spinner.fail(`Failed to register repository: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// List repositories command
repositoryCommands
  .command("list")
  .description("List all registered repositories")
  .option("-c, --category <category>", "Filter by category")
  .option("-f, --framework <framework>", "Filter by framework")
  .option("--classification <level>", "Filter by NSM classification")
  .action(async (options) => {
    const spinner = ora("Loading repositories...").start();
    
    try {
      const config = await loadConfig();
      await initializeServices(config);
      
      const repositories = await repositoryService.listRepositories(currentUser, {
        category: options.category,
        framework: options.framework,
        nsmClassification: options.classification
      });
      
      spinner.stop();
      
      if (repositories.length === 0) {
        console.log(chalk.yellow("No repositories found"));
        return;
      }
      
      const table = new Table({
        head: [
          chalk.cyan("Name"),
          chalk.cyan("URL"),
          chalk.cyan("Branch"),
          chalk.cyan("Classification"),
          chalk.cyan("Private"),
          chalk.cyan("Auto Sync")
        ],
        style: { head: [], border: [] }
      });
      
      for (const repo of repositories) {
        table.push([
          repo.name,
          repo.gitUrl,
          repo.branch,
          repo.norwegianCompliance.dataClassification,
          repo.accessControl.isPrivate ? "Yes" : "No",
          repo.synchronization.autoSync ? "Yes" : "No"
        ]);
      }
      
      console.log(table.toString());
      
    } catch (error) {
      spinner.fail(`Failed to list repositories: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Clone repository command
repositoryCommands
  .command("clone <name>")
  .description("Clone a template repository")
  .option("-f, --force", "Force clone even if directory exists")
  .option("--shallow", "Perform shallow clone")
  .option("--depth <number>", "Clone depth", "1")
  .action(async (name, options) => {
    const spinner = ora(`Cloning repository '${name}'...`).start();
    
    try {
      const config = await loadConfig();
      await initializeServices(config);
      
      await repositoryService.cloneRepository(name, currentUser, {
        force: options.force,
        shallow: options.shallow,
        depth: options.depth ? parseInt(options.depth) : undefined
      });
      
      spinner.succeed(`Repository '${name}' cloned successfully`);
      
    } catch (error) {
      spinner.fail(`Failed to clone repository: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Pull repository command
repositoryCommands
  .command("pull <name>")
  .description("Pull latest changes from repository")
  .option("--rebase", "Use rebase instead of merge")
  .option("-f, --force", "Force pull")
  .action(async (name, options) => {
    const spinner = ora(`Pulling repository '${name}'...`).start();
    
    try {
      const config = await loadConfig();
      await initializeServices(config);
      
      const result = await repositoryService.pullRepository(name, currentUser, {
        rebase: options.rebase,
        force: options.force
      });
      
      spinner.succeed(`Repository '${name}' updated successfully`);
      
      if (result.conflicts.length > 0) {
        console.log(chalk.yellow(`⚠️  Conflicts detected in files:`));
        for (const conflict of result.conflicts) {
          console.log(chalk.red(`   - ${conflict}`));
        }
      }
      
      if (result.changedFiles.length > 0) {
        console.log(chalk.green(`✨ Changed files (${result.changedFiles.length}):`));
        for (const file of result.changedFiles.slice(0, 10)) {
          console.log(chalk.dim(`   - ${file}`));
        }
        if (result.changedFiles.length > 10) {
          console.log(chalk.dim(`   ... and ${result.changedFiles.length - 10} more`));
        }
      }
      
    } catch (error) {
      spinner.fail(`Failed to pull repository: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Push repository command
repositoryCommands
  .command("push <name>")
  .description("Push changes to repository")
  .option("-m, --message <message>", "Commit message")
  .option("-f, --force", "Force push")
  .option("--tags", "Push tags")
  .option("-b, --branch <branch>", "Target branch")
  .action(async (name, options) => {
    const spinner = ora(`Pushing repository '${name}'...`).start();
    
    try {
      const config = await loadConfig();
      await initializeServices(config);
      
      let commitMessage = options.message;
      if (!commitMessage) {
        const answer = await inquirer.prompt({
          type: "input",
          name: "message",
          message: "Commit message:",
          validate: (input: string) => input.length > 0 || "Commit message is required"
        });
        commitMessage = answer.message;
      }
      
      await repositoryService.pushRepository(name, currentUser, commitMessage, {
        force: options.force,
        tags: options.tags,
        branch: options.branch
      });
      
      spinner.succeed(`Repository '${name}' pushed successfully`);
      
    } catch (error) {
      spinner.fail(`Failed to push repository: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

/**
 * Version Commands
 */
const versionCommands = new Command("version")
  .description("Manage template versions")
  .alias("v");

// Create version command
versionCommands
  .command("create <templateId> <version>")
  .description("Create a new template version")
  .option("-m, --message <message>", "Changelog message")
  .option("--breaking", "Mark as breaking change")
  .option("--hash <hash>", "Git commit hash")
  .action(async (templateId, version, options) => {
    const spinner = ora(`Creating version ${version} for ${templateId}...`).start();
    
    try {
      const config = await loadConfig();
      await initializeServices(config);
      
      const versionHistory = await versionManagerService.createVersion(
        templateId,
        version,
        {
          author: `${currentUser.firstName} ${currentUser.lastName}`,
          changelog: options.message,
          breaking: options.breaking,
          commitHash: options.hash
        },
        currentUser
      );
      
      spinner.succeed(`Version ${version} created for ${templateId}`);
      
      console.log(chalk.green("Version Details:"));
      console.log(`  Template ID: ${versionHistory.templateId}`);
      console.log(`  Version: ${versionHistory.version}`);
      console.log(`  Author: ${versionHistory.author}`);
      console.log(`  Release Date: ${versionHistory.releaseDate.toISOString()}`);
      console.log(`  Breaking: ${versionHistory.breaking ? "Yes" : "No"}`);
      console.log(`  Prerelease: ${versionHistory.prerelease ? "Yes" : "No"}`);
      if (versionHistory.changelog) {
        console.log(`  Changelog: ${versionHistory.changelog}`);
      }
      
    } catch (error) {
      spinner.fail(`Failed to create version: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// List versions command
versionCommands
  .command("list <templateId>")
  .description("List all versions for a template")
  .option("--include-deprecated", "Include deprecated versions")
  .option("--include-prerelease", "Include prerelease versions")
  .action(async (templateId, options) => {
    const spinner = ora(`Loading versions for ${templateId}...`).start();
    
    try {
      const config = await loadConfig();
      await initializeServices(config);
      
      const versions = await versionManagerService.getVersions(templateId, {
        includeDeprecated: options.includeDeprecated,
        includePrerelease: options.includePrerelease
      });
      
      spinner.stop();
      
      if (versions.length === 0) {
        console.log(chalk.yellow(`No versions found for template '${templateId}'`));
        return;
      }
      
      const table = new Table({
        head: [
          chalk.cyan("Version"),
          chalk.cyan("Release Date"),
          chalk.cyan("Author"),
          chalk.cyan("Breaking"),
          chalk.cyan("Prerelease"),
          chalk.cyan("Deprecated")
        ],
        style: { head: [], border: [] }
      });
      
      for (const version of versions) {
        table.push([
          version.version,
          version.releaseDate.toLocaleDateString(),
          version.author,
          version.breaking ? chalk.red("Yes") : "No",
          version.prerelease ? chalk.yellow("Yes") : "No",
          version.deprecated ? chalk.red("Yes") : "No"
        ]);
      }
      
      console.log(table.toString());
      
    } catch (error) {
      spinner.fail(`Failed to list versions: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Resolve version command
versionCommands
  .command("resolve <templateId> <constraint>")
  .description("Resolve version constraint")
  .option("--prerelease", "Include prerelease versions")
  .option("--strategy <strategy>", "Resolution strategy", "range")
  .action(async (templateId, constraint, options) => {
    const spinner = ora(`Resolving ${templateId}@${constraint}...`).start();
    
    try {
      const config = await loadConfig();
      await initializeServices(config);
      
      const resolution = await versionManagerService.resolveVersion(templateId, constraint, {
        includePrerelease: options.prerelease,
        strategy: options.strategy
      });
      
      spinner.succeed(`Resolved ${templateId}@${constraint} to ${resolution.resolvedVersion}`);
      
      console.log(chalk.green("Resolution Details:"));
      console.log(`  Requested: ${resolution.requestedVersion}`);
      console.log(`  Resolved: ${resolution.resolvedVersion}`);
      console.log(`  Strategy: ${resolution.resolutionStrategy}`);
      
      if (resolution.dependencies.length > 0) {
        console.log(chalk.cyan("\nDependencies:"));
        for (const dep of resolution.dependencies) {
          console.log(`  ${dep.templateId}@${dep.requestedVersion} -> ${dep.resolvedVersion}`);
        }
      }
      
      if (resolution.conflicts.length > 0) {
        console.log(chalk.red("\nConflicts:"));
        for (const conflict of resolution.conflicts) {
          console.log(`  ${conflict.templateId}: ${conflict.conflictingVersions.join(", ")}`);
          if (conflict.reason) {
            console.log(`    Reason: ${conflict.reason}`);
          }
        }
      }
      
    } catch (error) {
      spinner.fail(`Failed to resolve version: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Check compatibility command
versionCommands
  .command("check <templateId> <version>")
  .description("Check version compatibility")
  .option("--framework <framework>", "Target framework")
  .option("--node <version>", "Node.js version")
  .option("--npm <version>", "npm version")
  .option("--platform <platforms...>", "Target platforms")
  .action(async (templateId, version, options) => {
    const spinner = ora(`Checking compatibility for ${templateId}@${version}...`).start();
    
    try {
      const config = await loadConfig();
      await initializeServices(config);
      
      const result = await versionManagerService.checkCompatibility(templateId, version, {
        framework: options.framework,
        nodeVersion: options.node,
        npmVersion: options.npm,
        platforms: options.platform
      });
      
      spinner.stop();
      
      if (result.compatible) {
        console.log(chalk.green(`✅ ${templateId}@${version} is compatible`));
      } else {
        console.log(chalk.red(`❌ ${templateId}@${version} has compatibility issues`));
      }
      
      if (result.issues.length > 0) {
        console.log(chalk.red("\nIssues:"));
        for (const issue of result.issues) {
          console.log(`  - ${issue}`);
        }
      }
      
      if (result.warnings.length > 0) {
        console.log(chalk.yellow("\nWarnings:"));
        for (const warning of result.warnings) {
          console.log(`  - ${warning}`);
        }
      }
      
    } catch (error) {
      spinner.fail(`Failed to check compatibility: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

/**
 * Main Team Templates Command
 */
export const teamTemplatesCommand = new Command("team-templates")
  .description("Manage team template repositories and versions")
  .alias("tt")
  .addCommand(repositoryCommands)
  .addCommand(versionCommands);

// Initialize command
teamTemplatesCommand
  .command("init")
  .description("Initialize team templates configuration")
  .option("--interactive", "Interactive setup")
  .action(async (options) => {
    const spinner = ora("Initializing team templates...").start();
    
    try {
      const configDir = path.join(process.cwd(), ".xaheen");
      const configPath = path.join(configDir, "team-templates.config.json");
      
      // Ensure config directory exists
      await fs.mkdir(configDir, { recursive: true });
      
      let config: TeamTemplateConfig;
      
      if (options.interactive) {
        const answers = await inquirer.prompt([
          {
            type: "input",
            name: "repositoryPath",
            message: "Templates repository path:",
            default: path.join(process.cwd(), ".xaheen", "templates")
          },
          {
            type: "input",
            name: "versionDataPath", 
            message: "Version data path:",
            default: path.join(process.cwd(), ".xaheen", "versions")
          },
          {
            type: "input",
            name: "gitUsername",
            message: "Git username:",
            default: process.env.GIT_AUTHOR_NAME || "Xaheen CLI User"
          },
          {
            type: "input",
            name: "gitEmail",
            message: "Git email:",
            default: process.env.GIT_AUTHOR_EMAIL || "user@example.com",
            validate: (input: string) => {
              return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || "Please enter a valid email";
            }
          },
          {
            type: "list",
            name: "defaultClassification",
            message: "Default NSM classification:",
            choices: ["OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET"],
            default: "OPEN"
          }
        ]);
        
        config = TeamTemplateConfigSchema.parse({
          repositoryPath: answers.repositoryPath,
          versionDataPath: answers.versionDataPath,
          gitConfig: {
            username: answers.gitUsername,
            email: answers.gitEmail
          },
          defaultNSMClassification: answers.defaultClassification
        });
      } else {
        config = TeamTemplateConfigSchema.parse({
          gitConfig: {
            username: process.env.GIT_AUTHOR_NAME || "Xaheen CLI User",
            email: process.env.GIT_AUTHOR_EMAIL || "user@example.com"
          }
        });
      }
      
      // Save configuration
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      
      // Create directories
      await fs.mkdir(config.repositoryPath, { recursive: true });
      await fs.mkdir(config.versionDataPath, { recursive: true });
      
      spinner.succeed("Team templates initialized successfully");
      
      console.log(chalk.green("\nConfiguration saved to:"));
      console.log(chalk.dim(configPath));
      console.log(chalk.green("\nDirectories created:"));
      console.log(chalk.dim(`  - ${config.repositoryPath}`));
      console.log(chalk.dim(`  - ${config.versionDataPath}`));
      
    } catch (error) {
      spinner.fail(`Failed to initialize: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

// Status command
teamTemplatesCommand
  .command("status")
  .description("Show team templates status")
  .action(async () => {
    const spinner = ora("Checking status...").start();
    
    try {
      const config = await loadConfig();
      await initializeServices(config);
      
      const repositories = await repositoryService.listRepositories(currentUser);
      
      spinner.stop();
      
      console.log(chalk.cyan("Team Templates Status"));
      console.log("=".repeat(50));
      console.log(`Repositories: ${repositories.length}`);
      console.log(`Repository Path: ${config.repositoryPath}`);
      console.log(`Version Data Path: ${config.versionDataPath}`);
      console.log(`Git User: ${config.gitConfig.username} <${config.gitConfig.email}>`);
      console.log(`Default Classification: ${config.defaultNSMClassification}`);
      
      if (repositories.length > 0) {
        console.log(chalk.cyan("\nRegistered Repositories:"));
        for (const repo of repositories) {
          console.log(`  - ${repo.name} (${repo.norwegianCompliance.dataClassification})`);
        }
      }
      
    } catch (error) {
      spinner.fail(`Failed to get status: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

export default teamTemplatesCommand;