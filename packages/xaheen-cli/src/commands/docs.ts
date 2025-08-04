/**
 * @fileoverview Documentation Command - Comprehensive Documentation Generation
 * @description CLI command for generating intelligent documentation portals with Story 8.8 features
 * @author Xaheen Enterprise  
 * @version 1.0.0
 */

import {
  cancel,
  confirm,
  intro,
  isCancel,
  multiselect,
  outro,
  select,
  spinner,
  text,
} from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import consola from "consola";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  DocumentationGeneratorFactory,
  type DocumentationGeneratorOptions,
  type DocumentationPortalOptions,
  type OnboardingGuideOptions,
} from "../generators/documentation/index.js";
import { DocusaurusPortalGenerator } from "../generators/documentation/docusaurus-portal.generator.js";
import { OnboardingGuideGenerator } from "../generators/documentation/onboarding-guide.generator.js";
import { DocumentationSyncService, createDocumentationSyncService } from "../generators/documentation/sync.service.js";
import { DocumentationWatcherService } from "../generators/documentation/watcher.service.js";

interface DocsCommandOptions {
  readonly type?: string;
  readonly output?: string;
  readonly portal?: boolean;
  readonly onboarding?: boolean;
  readonly sync?: boolean;
  readonly watch?: boolean;
  readonly all?: boolean;
  readonly interactive?: boolean;
  readonly config?: string;
}

export const docsCommand = new Command("docs")
  .description("Generate comprehensive documentation with intelligent features")
  .option("-t, --type <type>", "Documentation type (api, architecture, deployment, portal, onboarding)")
  .option("-o, --output <dir>", "Output directory (default: ./docs)")
  .option("--portal", "Generate complete documentation portal with Docusaurus")
  .option("--onboarding", "Generate dynamic onboarding guides")
  .option("--sync", "Enable automatic documentation synchronization")
  .option("--watch", "Watch for changes and update documentation")
  .option("--all", "Generate comprehensive documentation suite")
  .option("-i, --interactive", "Interactive mode for customization")
  .option("-c, --config <file>", "Configuration file path")
  .action(async (options: DocsCommandOptions) => {
    try {
      intro(chalk.cyan("📚 Xaheen Documentation Generator"));

      // Analyze project context
      const projectPath = process.cwd();
      const projectInfo = await analyzeProject(projectPath);

      if (!projectInfo) {
        consola.error("Not in a valid project directory");
        process.exit(1);
      }

      // Load configuration
      const config = await loadDocumentationConfig(options.config, projectPath);
      const outputDir = options.output || config.outputDir || join(projectPath, "docs");

      // Interactive mode
      if (options.interactive || (!options.type && !options.all && !options.portal && !options.onboarding)) {
        const selection = await handleInteractiveMode(projectInfo);
        if (isCancel(selection)) {
          cancel("Operation cancelled");
          return;
        }
        Object.assign(options, selection);
      }

      const s = spinner();

      // Generate comprehensive documentation suite
      if (options.all) {
        s.start("Generating comprehensive documentation suite...");
        await generateComprehensiveDocumentation(projectInfo, config, outputDir);
        s.stop();
        
        outro(chalk.green("✅ Comprehensive documentation suite generated successfully!"));
        displayPostGenerationInfo(outputDir, true, true, options.sync, options.watch);
        return;
      }

      // Generate documentation portal
      if (options.portal) {
        s.start("Generating documentation portal with Docusaurus...");
        const result = await generateDocumentationPortal(projectInfo, config, outputDir);
        s.stop();

        if (result.success) {
          outro(chalk.green(`✅ ${result.message}`));
          consola.info(chalk.cyan("🌐 Portal URL:"), result.portalUrl || "http://localhost:3000");
          displayGeneratedFiles(result.files);
          displayCommands(result.commands);
          displayNextSteps(result.nextSteps);
        } else {
          outro(chalk.red(`❌ ${result.message}`));
          process.exit(1);
        }
      }

      // Generate onboarding guides
      if (options.onboarding) {
        s.start("Generating dynamic onboarding guides...");
        const result = await generateOnboardingGuides(projectInfo, config, outputDir);
        s.stop();

        if (result.success) {
          outro(chalk.green(`✅ ${result.message}`));
          consola.info(chalk.cyan("📖 Guide URL:"), result.guideUrl || `${outputDir}/onboarding`);
          consola.info(chalk.cyan("📊 Steps Generated:"), result.stepsGenerated);
          consola.info(chalk.cyan("⏱️ Estimated Time:"), `${result.estimatedCompletionTime} minutes`);
          displayGeneratedFiles(result.files);
        } else {
          outro(chalk.red(`❌ ${result.message}`));
          process.exit(1);
        }
      }

      // Generate specific documentation type
      if (options.type) {
        s.start(`Generating ${options.type} documentation...`);
        const result = await generateSpecificDocumentation(options.type, projectInfo, config, outputDir);
        s.stop();

        if (result.success) {
          outro(chalk.green(`✅ ${result.message}`));
          displayGeneratedFiles(result.files);
          displayCommands(result.commands);
          displayNextSteps(result.nextSteps);
        } else {
          outro(chalk.red(`❌ ${result.message}`));
          process.exit(1);
        }
      }

      // Setup synchronization
      if (options.sync) {
        s.start("Setting up automatic documentation synchronization...");
        await setupDocumentationSync(projectPath, outputDir, config);
        s.stop();
        consola.success("📡 Documentation synchronization enabled");
      }

      // Setup file watching
      if (options.watch) {
        consola.info("👀 Starting documentation watcher...");
        await startDocumentationWatcher(projectPath, outputDir, config);
      }

    } catch (error) {
      consola.error("Failed to generate documentation:", error);
      process.exit(1);
    }
  });

async function analyzeProject(projectPath: string): Promise<ProjectInfo | null> {
  try {
    // Check for package.json
    const packageJsonPath = join(projectPath, "package.json");
    if (!existsSync(packageJsonPath)) {
      return null;
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    
    // Detect project type and framework
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    let framework = "unknown";
    let projectType = "web";
    let runtime = "node";

    if (dependencies.next) framework = "next";
    else if (dependencies.react) framework = "react";
    else if (dependencies.vue) framework = "vue";
    else if (dependencies.angular) framework = "angular";
    else if (dependencies.express) framework = "express";
    else if (dependencies["@nestjs/core"]) framework = "nestjs";

    if (dependencies.express || dependencies["@nestjs/core"] || dependencies.fastify) {
      projectType = "api";
    } else if (dependencies["react-native"]) {
      projectType = "mobile";
    }

    // Detect databases
    const databases: string[] = [];
    if (dependencies.mongoose || dependencies.mongodb) databases.push("mongodb");
    if (dependencies.pg || dependencies.postgresql) databases.push("postgresql");
    if (dependencies.mysql || dependencies.mysql2) databases.push("mysql");
    if (dependencies.sqlite || dependencies.sqlite3) databases.push("sqlite");

    // Detect integrations
    const integrations: string[] = [];
    if (dependencies.stripe) integrations.push("stripe");
    if (dependencies.aws) integrations.push("aws");
    if (dependencies.axios) integrations.push("http-client");

    return {
      name: packageJson.name || "Unknown Project",
      version: packageJson.version || "1.0.0",
      description: packageJson.description,
      author: packageJson.author || "Unknown Author",
      framework,
      projectType: projectType as any,
      runtime: runtime as any,
      databases,
      integrations,
      repository: packageJson.repository?.url,
    };
  } catch (error) {
    return null;
  }
}

async function loadDocumentationConfig(configPath?: string, projectPath?: string): Promise<Partial<DocumentationGeneratorOptions>> {
  const defaultConfig: Partial<DocumentationGeneratorOptions> = {
    outputDir: "./docs",
    enableOpenAPI: true,
    enableSwaggerUI: true,
    enableArchitectureDocs: true,
    enableDeploymentGuides: true,
    enableAPIReference: true,
    enableTroubleshooting: true,
    enableGettingStarted: true,
    enableDeveloperWorkflow: true,
    enableCodeDocumentation: true,
    enableMermaidDiagrams: true,
    languages: ["en"],
    deploymentTargets: ["docker", "kubernetes"],
  };

  if (!configPath && projectPath) {
    // Look for common config files
    const possibleConfigs = [
      join(projectPath, "docs.config.js"),
      join(projectPath, "docs.config.json"),
      join(projectPath, ".docsrc.json"),
    ];

    for (const configFile of possibleConfigs) {
      if (existsSync(configFile)) {
        configPath = configFile;
        break;
      }
    }
  }

  if (configPath && existsSync(configPath)) {
    try {
      if (configPath.endsWith(".json")) {
        const config = JSON.parse(readFileSync(configPath, "utf8"));
        return { ...defaultConfig, ...config };
      } else if (configPath.endsWith(".js")) {
        const config = await import(configPath);
        return { ...defaultConfig, ...config.default };
      }
    } catch (error) {
      consola.warn(`Failed to load config from ${configPath}:`, error);
    }
  }

  return defaultConfig;
}

async function handleInteractiveMode(projectInfo: ProjectInfo): Promise<any> {
  const documentationTypes = await multiselect({
    message: "What documentation would you like to generate?",
    options: [
      { value: "portal", label: "📚 Documentation Portal (Docusaurus)", hint: "Complete documentation website" },
      { value: "onboarding", label: "🎓 Onboarding Guides", hint: "Dynamic user onboarding" },
      { value: "api", label: "🔌 API Documentation", hint: "OpenAPI and REST docs" },
      { value: "architecture", label: "🏗️ Architecture Docs", hint: "System architecture diagrams" },
      { value: "deployment", label: "🚀 Deployment Guides", hint: "Deployment instructions" },
      { value: "troubleshooting", label: "🔧 Troubleshooting", hint: "Common issues and solutions" },
    ],
  });

  if (isCancel(documentationTypes)) {
    return null;
  }

  const enableSync = await confirm({
    message: "Enable automatic documentation synchronization?",
    initialValue: true,
  });

  if (isCancel(enableSync)) {
    return null;
  }

  const enableWatch = await confirm({
    message: "Enable file watching for real-time updates?",
    initialValue: false,
  });

  if (isCancel(enableWatch)) {
    return null;
  }

  return {
    portal: documentationTypes.includes("portal"),
    onboarding: documentationTypes.includes("onboarding"),
    type: documentationTypes.find(t => !["portal", "onboarding"].includes(t)),
    sync: enableSync,
    watch: enableWatch,
    all: documentationTypes.length >= 4,
  };
}

async function generateComprehensiveDocumentation(
  projectInfo: ProjectInfo,
  config: Partial<DocumentationGeneratorOptions>,
  outputDir: string
): Promise<void> {
  const options: DocumentationGeneratorOptions = {
    projectName: projectInfo.name,
    projectType: projectInfo.projectType,
    framework: projectInfo.framework,
    runtime: projectInfo.runtime,
    version: projectInfo.version,
    description: projectInfo.description,
    author: projectInfo.author,
    repository: projectInfo.repository,
    languages: ["en"],
    deploymentTargets: ["docker", "kubernetes"],
    integrations: projectInfo.integrations,
    databases: projectInfo.databases,
    outputDir,
    enableOpenAPI: true,
    enableSwaggerUI: true,
    enableArchitectureDocs: true,
    enableDeploymentGuides: true,
    enableAPIReference: true,
    enableClientSDK: true,
    enableTroubleshooting: true,
    enableGettingStarted: true,
    enableDeveloperWorkflow: true,
    enableCodeDocumentation: true,
    enableMermaidDiagrams: true,
    enableDocsify: false,
    enableVitePress: false,
    enableGitBookFormat: false,
    ...config,
  };

  // Generate comprehensive documentation
  const result = await DocumentationGeneratorFactory.generateComprehensiveDocumentation(options);
  
  if (!result.success) {
    throw new Error(result.message);
  }

  // Also generate portal and onboarding
  await generateDocumentationPortal(projectInfo, config, outputDir);
  await generateOnboardingGuides(projectInfo, config, outputDir);
}

async function generateDocumentationPortal(
  projectInfo: ProjectInfo,
  config: Partial<DocumentationGeneratorOptions>,
  outputDir: string
): Promise<any> {
  const portalOptions: DocumentationPortalOptions = {
    // Base options
    projectName: projectInfo.name,
    projectType: projectInfo.projectType,
    framework: projectInfo.framework,
    runtime: projectInfo.runtime,
    version: projectInfo.version,
    description: projectInfo.description,
    author: projectInfo.author,
    repository: projectInfo.repository,
    languages: ["en"],
    deploymentTargets: ["docker", "kubernetes", "netlify", "vercel"],
    integrations: projectInfo.integrations,
    databases: projectInfo.databases,
    outputDir,
    
    // Documentation features
    enableOpenAPI: true,
    enableSwaggerUI: true,
    enableArchitectureDocs: true,
    enableDeploymentGuides: true,
    enableAPIReference: true,
    enableClientSDK: true,
    enableTroubleshooting: true,
    enableGettingStarted: true,
    enableDeveloperWorkflow: true,
    enableCodeDocumentation: true,
    enableMermaidDiagrams: true,
    enableDocsify: false,
    enableVitePress: false,
    enableGitBookFormat: false,

    // Portal-specific options
    portalType: "docusaurus",
    theme: "modern",
    
    features: {
      enableSearch: true,
      enableComments: false,
      enableVersioning: false,
      enableMultiLanguage: false,
      enableDarkMode: true,
      enableEditOnGitHub: true,
      enableLastUpdated: true,
      enableContributors: true,
      enableFeedback: true,
      enableDownloadPDF: true,
      enablePrintView: true,
      enableMermaidDiagrams: true,
      enableCodePlayground: true,
      enableInteractiveExamples: true,
      enableAIAssistant: false,
    },

    branding: {
      siteName: `${projectInfo.name} Documentation`,
      tagline: `Comprehensive documentation for ${projectInfo.name}`,
      colors: {
        primary: "#2563eb",
        secondary: "#64748b",
        accent: "#06b6d4",
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#1e293b",
        textSecondary: "#64748b",
      },
      fonts: {
        primary: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        mono: "SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace",
      },
    },

    navigation: {
      sidebar: [
        { type: "doc", label: "Introduction", id: "intro" },
        { type: "doc", label: "Getting Started", id: "getting-started" },
        { type: "category", label: "Guides", id: "guides", collapsed: false, items: [
          { type: "generated", label: "Configuration", id: "guides" },
        ]},
        { type: "category", label: "API Reference", id: "api", collapsed: false, items: [
          { type: "generated", label: "Endpoints", id: "api" },
        ]},
        { type: "category", label: "Tutorials", id: "tutorials", collapsed: false, items: [
          { type: "generated", label: "Examples", id: "tutorials" },
        ]},
      ],
      navbar: [
        { type: "doc", label: "Docs", position: "left", to: "intro" },
        { type: "doc", label: "API", position: "left", to: "api" },
        { type: "doc", label: "Tutorials", position: "left", to: "tutorials" },
        { type: "page", label: "GitHub", position: "right", href: projectInfo.repository || "#" },
      ],
      breadcrumbs: true,
      pagination: true,
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
    },

    search: {
      provider: "local",
      placeholder: "Search documentation...",
    },

    analytics: {
      provider: "google",
      enableHeatmaps: false,
      enableUserTracking: false,
    },

    deployment: {
      provider: "github-pages",
      basePath: "/",
      trailingSlash: false,
    },

    sync: {
      enabled: true,
      watchPatterns: ["src/**/*", "docs/**/*", "*.md"],
      ignorePatterns: ["node_modules/**", "dist/**", "build/**"],
      triggers: [
        {
          event: "file-change",
          pattern: "src/**/*.ts",
          actions: [
            { type: "update-api-docs" },
            { type: "regenerate-docs" },
          ],
        },
      ],
      webhooks: [],
      conflictResolution: "auto-merge",
    },

    collaboration: {
      enableComments: false,
      enableSuggestions: false,
      enableReviews: false,
      enableDiscussions: false,
    },

    ...config,
  };

  const generator = new DocusaurusPortalGenerator();
  return await generator.generate(portalOptions);
}

async function generateOnboardingGuides(
  projectInfo: ProjectInfo,
  config: Partial<DocumentationGeneratorOptions>,
  outputDir: string
): Promise<any> {
  const onboardingOptions: OnboardingGuideOptions = {
    // Base options
    projectName: projectInfo.name,
    projectType: projectInfo.projectType,
    framework: projectInfo.framework,
    runtime: projectInfo.runtime,
    version: projectInfo.version,
    description: projectInfo.description,
    author: projectInfo.author,
    repository: projectInfo.repository,
    languages: ["en"],
    deploymentTargets: ["docker", "kubernetes"],
    integrations: projectInfo.integrations,
    databases: projectInfo.databases,
    outputDir,

    // Documentation features
    enableOpenAPI: true,
    enableSwaggerUI: true,
    enableArchitectureDocs: true,
    enableDeploymentGuides: true,
    enableAPIReference: true,
    enableClientSDK: true,
    enableTroubleshooting: true,
    enableGettingStarted: true,
    enableDeveloperWorkflow: true,
    enableCodeDocumentation: true,
    enableMermaidDiagrams: true,
    enableDocsify: false,
    enableVitePress: false,
    enableGitBookFormat: false,

    // Onboarding-specific options
    guideType: "developer",
    targetAudience: ["developers", "contributors"],
    prerequisites: [
      {
        name: projectInfo.runtime,
        description: `${projectInfo.runtime} runtime environment`,
        type: "environment",
        required: true,
        checkCommand: `${projectInfo.runtime} --version`,
      },
    ],
    learningPath: [], // Will be generated dynamically

    interactiveElements: {
      enableCodePlayground: true,
      enableProgressBar: true,
      enableCheckpoints: true,
      enableQuizzes: false,
      enableFeedback: true,
      enableHints: true,
    },

    progressTracking: {
      enabled: true,
      persistenceMethod: "localStorage",
      showProgress: true,
      enableCertificates: false,
      enableBadges: true,
    },

    customization: {
      allowPersonalization: true,
      dynamicContent: true,
      adaptiveFlow: true,
    },

    ...config,
  };

  const generator = new OnboardingGuideGenerator();
  return await generator.generate(onboardingOptions);
}

async function generateSpecificDocumentation(
  type: string,
  projectInfo: ProjectInfo,
  config: Partial<DocumentationGeneratorOptions>,
  outputDir: string
): Promise<any> {
  const options: DocumentationGeneratorOptions = {
    projectName: projectInfo.name,
    projectType: projectInfo.projectType,
    framework: projectInfo.framework,
    runtime: projectInfo.runtime,
    version: projectInfo.version,
    description: projectInfo.description,
    author: projectInfo.author,
    repository: projectInfo.repository,
    languages: ["en"],
    deploymentTargets: ["docker", "kubernetes"],
    integrations: projectInfo.integrations,
    databases: projectInfo.databases,
    outputDir,
    enableOpenAPI: type === "api",
    enableSwaggerUI: type === "api",
    enableArchitectureDocs: type === "architecture",
    enableDeploymentGuides: type === "deployment",
    enableAPIReference: type === "api",
    enableClientSDK: false,
    enableTroubleshooting: type === "troubleshooting",
    enableGettingStarted: type === "getting-started",
    enableDeveloperWorkflow: false,
    enableCodeDocumentation: false,
    enableMermaidDiagrams: true,
    enableDocsify: false,
    enableVitePress: false,
    enableGitBookFormat: false,
    ...config,
  };

  switch (type) {
    case "api":
      const apiGenerator = DocumentationGeneratorFactory.createAPIReferenceGenerator();
      return await apiGenerator.generate(options);
    case "architecture":
      const archGenerator = DocumentationGeneratorFactory.createArchitectureDocsGenerator();
      return await archGenerator.generate(options);
    case "deployment":
      const deployGenerator = DocumentationGeneratorFactory.createDeploymentGuideGenerator();
      return await deployGenerator.generate(options);
    case "troubleshooting":
      const troubleGenerator = DocumentationGeneratorFactory.createTroubleshootingDocsGenerator();
      return await troubleGenerator.generate(options);
    default:
      throw new Error(`Unknown documentation type: ${type}`);
  }
}

async function setupDocumentationSync(
  projectPath: string,
  outputDir: string,
  config: Partial<DocumentationGeneratorOptions>
): Promise<void> {
  const syncService = createDocumentationSyncService({
    projectRoot: projectPath,
    docsRoot: outputDir,
    config: {
      enabled: true,
      watchPatterns: ["src/**/*", "docs/**/*", "*.md", "package.json"],
      ignorePatterns: ["node_modules/**", "dist/**", "build/**", ".git/**"],
      triggers: [
        {
          event: "file-change",
          pattern: "src/**/*.ts",
          actions: [
            { type: "update-api-docs" },
            { type: "regenerate-docs" },
          ],
        },
        {
          event: "file-change",
          pattern: "package.json",
          actions: [
            { type: "regenerate-docs" },
          ],
        },
      ],
      webhooks: [],
      conflictResolution: "auto-merge",
    },
  });

  // Setup initial sync
  await syncService.manualSync();
  
  consola.success("📡 Documentation synchronization configured");
}

async function startDocumentationWatcher(
  projectPath: string,
  outputDir: string,
  config: Partial<DocumentationGeneratorOptions>
): Promise<void> {
  const watcherService = new DocumentationWatcherService({
    projectRoot: projectPath,
    docsRoot: outputDir,
    outputDir,
    watchPatterns: ["src/**/*", "docs/**/*", "*.md", "package.json"],
    ignorePatterns: ["node_modules/**", "dist/**", "build/**", ".git/**"],
    debounceMs: 1000,
    maxConcurrentJobs: 3,
    enableHotReload: true,
    enableNotifications: true,
  });

  await watcherService.start();
  
  consola.info("👀 Documentation watcher started - watching for changes...");
  consola.info("Press Ctrl+C to stop watching");

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    consola.info("Stopping documentation watcher...");
    await watcherService.stop();
    process.exit(0);
  });
}

function displayGeneratedFiles(files?: readonly string[]): void {
  if (files && files.length > 0) {
    consola.info(chalk.cyan("📁 Generated files:"));
    for (const file of files) {
      consola.info(`  ${chalk.green("+")} ${file}`);
    }
  }
}

function displayCommands(commands?: readonly string[]): void {
  if (commands && commands.length > 0) {
    consola.info(chalk.cyan("🔧 Commands to run:"));
    for (const command of commands) {
      consola.info(`  ${chalk.yellow("$")} ${command}`);
    }
  }
}

function displayNextSteps(nextSteps?: readonly string[]): void {
  if (nextSteps && nextSteps.length > 0) {
    consola.info(chalk.cyan("📋 Next steps:"));
    for (const step of nextSteps) {
      consola.info(`  ${chalk.blue("•")} ${step}`);
    }
  }
}

function displayPostGenerationInfo(
  outputDir: string, 
  hasPortal: boolean, 
  hasOnboarding: boolean, 
  hasSync?: boolean, 
  hasWatch?: boolean
): void {
  consola.info(chalk.cyan("🎉 Documentation Generation Complete!"));
  consola.info("");
  
  if (hasPortal) {
    consola.info(chalk.green("📚 Documentation Portal:"));
    consola.info(`  ${chalk.blue("•")} Location: ${outputDir}/docs-portal`);
    consola.info(`  ${chalk.blue("•")} Start dev server: cd ${outputDir}/docs-portal && npm start`);
    consola.info(`  ${chalk.blue("•")} Build for production: cd ${outputDir}/docs-portal && npm run build`);
  }
  
  if (hasOnboarding) {
    consola.info(chalk.green("🎓 Onboarding Guides:"));
    consola.info(`  ${chalk.blue("•")} Location: ${outputDir}/onboarding`);
    consola.info(`  ${chalk.blue("•")} Interactive guides with progress tracking`);
    consola.info(`  ${chalk.blue("•")} Personalized learning paths`);
  }
  
  if (hasSync) {
    consola.info(chalk.green("📡 Auto-Synchronization:"));
    consola.info(`  ${chalk.blue("•")} Watches for code changes`);
    consola.info(`  ${chalk.blue("•")} Automatically updates documentation`);
    consola.info(`  ${chalk.blue("•")} Keeps docs in sync with codebase`);
  }
  
  if (hasWatch) {
    consola.info(chalk.green("👀 File Watching:"));
    consola.info(`  ${chalk.blue("•")} Real-time documentation updates`);
    consola.info(`  ${chalk.blue("•")} Hot reloading for development`);
  }

  consola.info("");
  consola.info(chalk.cyan("💡 Pro Tips:"));
  consola.info(`  ${chalk.blue("•")} Use \`xaheen docs --watch\` for development`);
  consola.info(`  ${chalk.blue("•")} Configure automatic deployment with GitHub Actions`);
  consola.info(`  ${chalk.blue("•")} Enable search with Algolia for production`);
  consola.info(`  ${chalk.blue("•")} Add team collaboration features for larger projects`);
}

interface ProjectInfo {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly author?: string;
  readonly framework: string;
  readonly projectType: "web" | "api" | "microservice" | "fullstack" | "mobile" | "desktop";
  readonly runtime: "node" | "python" | "go" | "java" | "dotnet" | "php" | "rust";
  readonly databases: readonly string[];
  readonly integrations: readonly string[];
  readonly repository?: string;
}